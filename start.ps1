Write-Host "Starting CYKHO Mini SOC..." -ForegroundColor Cyan

Write-Host "WARNING: Ensure MongoDB is running on localhost:27017" -ForegroundColor Yellow

# Start FastAPI backend
Write-Host "Starting Backend API..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit -Command `"cd backend; .\venv\Scripts\activate; uvicorn main:app_asgi --host 0.0.0.0 --port 8000 --reload`""

# Start Simulator
Write-Host "Starting Log Simulator..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit -Command `"cd backend; .\venv\Scripts\activate; Start-Sleep -Seconds 3; python simulator.py`""

# Start Frontend
Write-Host "Starting Frontend App..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit -Command `"cd frontend; npm run dev`""

Write-Host "CYKHO is starting up!" -ForegroundColor Green
Write-Host "Dashboard: http://localhost:5173" -ForegroundColor White
Write-Host "API: http://localhost:8000" -ForegroundColor White
