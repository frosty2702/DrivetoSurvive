# 🏎️ FastF1 API Microservice

Real F1 telemetry and timing data service powered by [FastF1](https://docs.fastf1.dev/).

## 🚀 Quick Start

### 1. Install Python 3.8+

```bash
python3 --version  # Should be 3.8 or higher
```

### 2. Create Virtual Environment

```bash
cd services/fastf1-api
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Run the Service

```bash
python main.py
```

Service runs on: **http://localhost:8000**

### 5. Test It

```bash
# Health check
curl http://localhost:8000/health

# Get 2024 drivers
curl http://localhost:8000/drivers/2024

# Get lap times for a race
curl http://localhost:8000/lap-times/2024/1
```

## 📡 API Endpoints

| Endpoint | Description | Example |
|----------|-------------|---------|
| `GET /` | Service info | `/` |
| `GET /health` | Health check | `/health` |
| `GET /drivers/{year}` | Season drivers | `/drivers/2024` |
| `GET /telemetry/{year}/{round}/{driver}` | Driver telemetry | `/telemetry/2024/1/VER` |
| `GET /lap-times/{year}/{round}` | Race lap times | `/lap-times/2024/1?driver=VER` |
| `GET /session/{year}/{round}/{type}` | Session data | `/session/2024/1/R` |

### Session Types
- `FP1`, `FP2`, `FP3` - Practice sessions
- `Q` - Qualifying
- `S` - Sprint race
- `R` - Race

## 🔌 Connect to NestJS API

Add to your NestJS `drivers.controller.ts`:

```typescript
import axios from 'axios';

const FASTF1_API = 'http://localhost:8000';

@Get('telemetry/:driver')
async getDriverTelemetry(@Param('driver') driver: string) {
  const response = await axios.get(`${FASTF1_API}/telemetry/2024/1/${driver}`);
  return response.data;
}
```

## 📦 Data Available

- **Telemetry**: Speed, RPM, gear, throttle, brake, DRS
- **Lap Times**: Sector times, lap times, personal bests
- **Tyre Data**: Compound, age, pit stops
- **Position Data**: Track position, race position
- **Session Results**: Finishing positions, points, status

## 🎯 Use Cases for DrivetoSurvive

1. **Real-time Performance Updates**
   - Fetch latest lap times after races
   - Update driver NFT stats with verified data

2. **Detailed Analytics**
   - Show speed traces on track maps
   - Compare driver performances

3. **Historical Data**
   - Access telemetry from 2018 onwards
   - Build performance history charts

## 🐛 Troubleshooting

**ImportError: No module named 'fastf1'**
```bash
pip install -r requirements.txt
```

**Slow first request**
- FastF1 caches data on first request (~30-60 seconds)
- Subsequent requests are fast (<1 second)

**Data not found**
- Check if race has finished (data available 30-120 mins after)
- Verify year/round/driver abbreviation

## 📚 Resources

- FastF1 Docs: https://docs.fastf1.dev/
- Driver Abbreviations: VER, HAM, LEC, etc.
- 2024 has 24 rounds (races)

---

**Perfect for hackathon demos with real F1 data!** 🏆

