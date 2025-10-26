#!/bin/bash

# Start the FastF1 API service
echo "Starting FastF1 API service..."
python3 main.py &
FASTF1_PID=$!

echo "FastF1 API running with PID: $FASTF1_PID"
echo "API will be available at http://localhost:8000"
echo "Press Ctrl+C to stop the service"

# Wait for the service to be ready
sleep 3

# Check if the service is running
if curl -s http://localhost:8000/health > /dev/null; then
  echo "✅ FastF1 API is running and healthy"
  echo "You can now use the following endpoints in your NestJS app:"
  echo "- POST /f1-data/sync-drivers - Sync driver data"
  echo "- POST /f1-data/sync-race/:year/:round - Sync specific race results"
  echo "- POST /f1-data/update-valuations - Update driver valuations"
  echo "- POST /f1-data/sync-all - Sync all data"
else
  echo "❌ FastF1 API failed to start"
  kill $FASTF1_PID
  exit 1
fi

# Keep the script running until Ctrl+C
trap "echo 'Stopping FastF1 API...'; kill $FASTF1_PID; exit 0" INT
wait $FASTF1_PID