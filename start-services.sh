#!/bin/bash

echo "🏎️ Starting DrivetoSurvive Services..."
echo "======================================"

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️  Port $1 is already in use"
        return 1
    else
        echo "✅ Port $1 is available"
        return 0
    fi
}

# Check required ports
echo "🔍 Checking ports..."
check_port 3000  # Frontend
check_port 3001  # NestJS API
check_port 8000  # FastF1 API

echo ""
echo "🚀 Starting services in background..."

# Start FastF1 API (Python)
echo "📊 Starting FastF1 API on port 8000..."
cd services/fastf1-api
python3 main.py &
FASTF1_PID=$!
echo "FastF1 API PID: $FASTF1_PID"

# Wait a moment for FastF1 to start
sleep 3

# Start NestJS API
echo "🔧 Starting NestJS API on port 3001..."
cd ../../apps/api
npm run dev &
API_PID=$!
echo "NestJS API PID: $API_PID"

# Wait a moment for API to start
sleep 5

# Start Frontend (if you want to)
echo "🎨 Frontend can be started separately with: cd apps/web && npm start"
echo ""

echo "✅ Services started!"
echo "📊 FastF1 API: http://localhost:8000"
echo "🔧 NestJS API: http://localhost:3001"
echo "🎨 Frontend: http://localhost:3000 (start separately)"
echo ""
echo "📚 API Documentation:"
echo "   FastF1 API Docs: http://localhost:8000/docs"
echo "   NestJS API Health: http://localhost:3001/health"
echo "   F1 Data Endpoints: http://localhost:3001/f1-data"
echo ""
echo "🛑 To stop all services, run: pkill -f 'python3 main.py' && pkill -f 'npm run dev'"
echo ""

# Keep script running and show logs
echo "📋 Service logs (Ctrl+C to stop all services):"
echo "=============================================="
wait
