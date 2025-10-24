"""
FastF1 API Microservice for DrivetoSurvive
Provides real F1 telemetry and timing data
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import fastf1
import fastf1.plotting
from typing import Optional, List, Dict
import os
import pandas as pd
from datetime import datetime
import asyncio
import aiohttp

# Enable FastF1 cache for performance
cache_dir = os.path.join(os.path.dirname(__file__), ".fastf1_cache")
fastf1.Cache.enable_cache(cache_dir)

app = FastAPI(
    title="DrivetoSurvive FastF1 API",
    description="Real F1 telemetry and timing data powered by FastF1",
    version="1.0.0"
)

# Enable CORS for NestJS API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "service": "FastF1 API",
        "status": "running",
        "endpoints": {
            "/health": "Health check",
            "/drivers/{year}": "Get drivers for a season",
            "/telemetry/{year}/{round}/{driver}": "Get driver telemetry",
            "/lap-times/{year}/{round}": "Get lap times for a race",
            "/session/{year}/{round}/{session_type}": "Get session data"
        }
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "fastf1_version": fastf1.__version__
    }

@app.get("/drivers/{year}")
def get_season_drivers(year: int):
    """Get all drivers for a given season"""
    try:
        # Get first race of season to extract driver list
        session = fastf1.get_session(year, 1, 'R')
        session.load()
        
        drivers = []
        for driver_abbr in session.drivers:
            driver_info = session.get_driver(driver_abbr)
            drivers.append({
                "abbreviation": driver_abbr,
                "full_name": driver_info.get('FullName', 'Unknown'),
                "team": driver_info.get('TeamName', 'Unknown'),
                "team_color": driver_info.get('TeamColor', '000000'),
                "driver_number": str(driver_info.get('DriverNumber', ''))
            })
        
        return {
            "year": year,
            "driver_count": len(drivers),
            "drivers": drivers
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch drivers: {str(e)}")

@app.get("/telemetry/{year}/{round_number}/{driver}")
def get_driver_telemetry(
    year: int,
    round_number: int,
    driver: str,
    lap_number: Optional[int] = None
):
    """Get telemetry data for a specific driver"""
    try:
        session = fastf1.get_session(year, round_number, 'R')
        session.load()
        
        driver_laps = session.laps.pick_driver(driver)
        
        if lap_number:
            lap = driver_laps[driver_laps['LapNumber'] == lap_number].iloc[0]
        else:
            # Get fastest lap if no lap specified
            lap = driver_laps.pick_fastest()
        
        telemetry = lap.get_car_data().add_distance()
        
        # Convert to JSON-serializable format
        telemetry_data = {
            "lap_number": int(lap['LapNumber']),
            "lap_time": str(lap['LapTime']),
            "is_personal_best": bool(lap['IsPersonalBest']),
            "compound": str(lap['Compound']) if lap['Compound'] else None,
            "tyre_life": int(lap['TyreLife']) if not pd.isna(lap['TyreLife']) else None,
            "telemetry": {
                "speed": telemetry['Speed'].tolist(),
                "rpm": telemetry['RPM'].tolist(),
                "gear": telemetry['nGear'].tolist(),
                "throttle": telemetry['Throttle'].tolist(),
                "brake": telemetry['Brake'].tolist(),
                "distance": telemetry['Distance'].tolist(),
                "time": [str(t) for t in telemetry['Time']]
            }
        }
        
        return {
            "year": year,
            "round": round_number,
            "driver": driver,
            "data": telemetry_data
        }
    except IndexError:
        raise HTTPException(status_code=404, detail=f"No data found for driver {driver}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch telemetry: {str(e)}")

@app.get("/lap-times/{year}/{round_number}")
def get_race_lap_times(year: int, round_number: int, driver: Optional[str] = None):
    """Get lap times for all drivers in a race"""
    try:
        session = fastf1.get_session(year, round_number, 'R')
        session.load()
        
        if driver:
            laps = session.laps.pick_driver(driver)
        else:
            laps = session.laps
        
        lap_data = []
        for _, lap in laps.iterrows():
            lap_data.append({
                "driver": lap['Driver'],
                "lap_number": int(lap['LapNumber']),
                "lap_time": str(lap['LapTime']) if not pd.isna(lap['LapTime']) else None,
                "sector1_time": str(lap['Sector1Time']) if not pd.isna(lap['Sector1Time']) else None,
                "sector2_time": str(lap['Sector2Time']) if not pd.isna(lap['Sector2Time']) else None,
                "sector3_time": str(lap['Sector3Time']) if not pd.isna(lap['Sector3Time']) else None,
                "compound": str(lap['Compound']) if lap['Compound'] else None,
                "tyre_life": int(lap['TyreLife']) if not pd.isna(lap['TyreLife']) else None,
                "stint": int(lap['Stint']) if not pd.isna(lap['Stint']) else None,
                "pit_out_time": str(lap['PitOutTime']) if not pd.isna(lap['PitOutTime']) else None,
                "pit_in_time": str(lap['PitInTime']) if not pd.isna(lap['PitInTime']) else None,
                "is_personal_best": bool(lap['IsPersonalBest']) if not pd.isna(lap['IsPersonalBest']) else False
            })
        
        return {
            "year": year,
            "round": round_number,
            "driver_filter": driver,
            "lap_count": len(lap_data),
            "laps": lap_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch lap times: {str(e)}")

@app.get("/session/{year}/{round_number}/{session_type}")
def get_session_info(year: int, round_number: int, session_type: str):
    """
    Get session information
    session_type: 'FP1', 'FP2', 'FP3', 'Q', 'SQ' (Sprint Qualifying), 'S' (Sprint), 'R' (Race)
    """
    try:
        session = fastf1.get_session(year, round_number, session_type)
        session.load()
        
        # Get session results
        results = session.results
        results_list = []
        
        for _, driver in results.iterrows():
            results_list.append({
                "position": int(driver['Position']) if not pd.isna(driver['Position']) else None,
                "driver_number": str(driver['DriverNumber']),
                "driver_abbr": driver['Abbreviation'],
                "full_name": driver['FullName'],
                "team": driver['TeamName'],
                "grid_position": int(driver['GridPosition']) if not pd.isna(driver['GridPosition']) else None,
                "points": float(driver['Points']) if not pd.isna(driver['Points']) else 0,
                "status": driver['Status']
            })
        
        return {
            "year": year,
            "round": round_number,
            "session_type": session_type,
            "event_name": session.event['EventName'],
            "location": session.event['Location'],
            "country": session.event['Country'],
            "results": results_list
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch session: {str(e)}")

@app.get("/championship-standings/{year}")
def get_championship_standings(year: int):
    """Get current championship standings for drivers and constructors"""
    try:
        # Get driver standings
        driver_standings = fastf1.api.standings.get_driver_standings(year)
        constructor_standings = fastf1.api.standings.get_constructor_standings(year)
        
        return {
            "year": year,
            "driver_standings": driver_standings.to_dict('records') if not driver_standings.empty else [],
            "constructor_standings": constructor_standings.to_dict('records') if not constructor_standings.empty else []
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch standings: {str(e)}")

@app.get("/driver-performance/{year}")
def get_driver_performance_metrics(year: int):
    """Get comprehensive driver performance metrics for the season"""
    try:
        # Get all races for the year
        schedule = fastf1.get_event_schedule(year)
        performance_data = []
        
        for _, race in schedule.iterrows():
            if race['EventFormat'] == 'conventional':
                try:
                    session = fastf1.get_session(year, race['RoundNumber'], 'R')
                    session.load()
                    
                    # Calculate performance metrics for each driver
                    for driver_abbr in session.drivers:
                        driver_laps = session.laps.pick_driver(driver_abbr)
                        if not driver_laps.empty:
                            fastest_lap = driver_laps.pick_fastest()
                            avg_lap_time = driver_laps['LapTime'].mean()
                            consistency = 1 - (driver_laps['LapTime'].std() / avg_lap_time) if avg_lap_time else 0
                            
                            # Get race position
                            results = session.results
                            driver_result = results[results['Abbreviation'] == driver_abbr]
                            position = int(driver_result['Position'].iloc[0]) if not driver_result.empty else None
                            
                            performance_data.append({
                                "year": year,
                                "round": race['RoundNumber'],
                                "event_name": race['EventName'],
                                "driver": driver_abbr,
                                "driver_name": driver_result['FullName'].iloc[0] if not driver_result.empty else driver_abbr,
                                "team": driver_result['TeamName'].iloc[0] if not driver_result.empty else "Unknown",
                                "position": position,
                                "points": float(driver_result['Points'].iloc[0]) if not driver_result.empty and not pd.isna(driver_result['Points'].iloc[0]) else 0,
                                "fastest_lap_time": str(fastest_lap['LapTime']) if fastest_lap is not None else None,
                                "average_lap_time": str(avg_lap_time) if avg_lap_time else None,
                                "consistency_score": float(consistency) if consistency else 0,
                                "laps_completed": len(driver_laps),
                                "total_race_time": str(driver_laps['LapTime'].sum()) if not driver_laps.empty else None
                            })
                except Exception as e:
                    # Skip races with no data
                    continue
        
        return {
            "year": year,
            "total_races": len(schedule),
            "performance_data": performance_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch performance metrics: {str(e)}")

@app.get("/race-calendar/{year}")
def get_race_calendar(year: int):
    """Get the complete race calendar for a year"""
    try:
        schedule = fastf1.get_event_schedule(year)
        
        calendar = []
        for _, event in schedule.iterrows():
            calendar.append({
                "round": int(event['RoundNumber']),
                "event_name": event['EventName'],
                "location": event['Location'],
                "country": event['Country'],
                "event_format": event['EventFormat'],
                "date_start": str(event['EventDate']),
                "f1_support_series": event['F1SupportSeries']
            })
        
        return {
            "year": year,
            "total_events": len(calendar),
            "calendar": calendar
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch race calendar: {str(e)}")

@app.get("/team-analysis/{year}")
def get_team_analysis(year: int):
    """Get comprehensive team performance analysis"""
    try:
        # Get all races for analysis
        schedule = fastf1.get_event_schedule(year)
        team_data = {}
        
        for _, race in schedule.iterrows():
            if race['EventFormat'] == 'conventional':
                try:
                    session = fastf1.get_session(year, race['RoundNumber'], 'R')
                    session.load()
                    
                    results = session.results
                    for _, driver in results.iterrows():
                        team_name = driver['TeamName']
                        if team_name not in team_data:
                            team_data[team_name] = {
                                "team_name": team_name,
                                "races": 0,
                                "total_points": 0,
                                "drivers": set(),
                                "positions": [],
                                "fastest_laps": 0
                            }
                        
                        team_data[team_name]["races"] += 1
                        team_data[team_name]["total_points"] += float(driver['Points']) if not pd.isna(driver['Points']) else 0
                        team_data[team_name]["drivers"].add(driver['FullName'])
                        team_data[team_name]["positions"].append(int(driver['Position']) if not pd.isna(driver['Position']) else None)
                        
                        # Check for fastest lap
                        if driver.get('FastestLap', False):
                            team_data[team_name]["fastest_laps"] += 1
                            
                except Exception:
                    continue
        
        # Convert sets to lists and calculate averages
        for team in team_data.values():
            team["drivers"] = list(team["drivers"])
            team["avg_position"] = sum(p for p in team["positions"] if p is not None) / len([p for p in team["positions"] if p is not None]) if team["positions"] else None
        
        return {
            "year": year,
            "teams": list(team_data.values())
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch team analysis: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    import pandas as pd  # Import here for runtime
    uvicorn.run(app, host="0.0.0.0", port=8000)

