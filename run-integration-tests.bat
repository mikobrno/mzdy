@echo off
echo Starting DB-FE Integration Tests...
echo.

REM Load environment variables from .env.local if it exists
if exist .env.local (
    echo Loading environment from .env.local
    for /f "tokens=1,2 delims==" %%a in (.env.local) do (
        set "%%a=%%b"
    )
)

REM Run the integration test
node test-db-fe-integration.js

echo.
echo Integration tests completed.
pause
