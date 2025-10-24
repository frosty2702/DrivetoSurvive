#!/bin/bash

echo "🏎️ Starting FastF1 API Service..."

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 is not installed. Please install Python 3.8+ to continue."
    exit 1
fi

# Check if pip is available
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 is not installed. Please install pip3 to continue."
    exit 1
fi

# Install dependencies if requirements.txt exists
if [ -f "requirements.txt" ]; then
    echo "📦 Installing Python dependencies..."
    pip3 install -r requirements.txt
fi

# Start the FastAPI server
echo "🚀 Starting FastF1 API on http://localhost:8000"
echo "📊 Available endpoints:"
echo "   - GET /health - Health check"
echo "   - GET /drivers/{year} - Get drivers for a season"
echo "   - GET /driver-performance/{year} - Get driver performance metrics"
echo "   - GET /championship-standings/{year} - Get championship standings"
echo "   - GET /race-calendar/{year} - Get race calendar"
echo "   - GET /team-analysis/{year} - Get team analysis"
echo "   - GET /session/{year}/{round}/{session_type} - Get session data"
echo "   - GET /telemetry/{year}/{round}/{driver} - Get driver telemetry"
echo "   - GET /lap-times/{year}/{round} - Get lap times"
echo ""
echo "🔗 API Documentation: http://localhost:8000/docs"
echo ""

python3 main.py
