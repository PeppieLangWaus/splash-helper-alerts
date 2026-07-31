@echo off
REM Quick setup script for splash-helper-alerts (Windows)
REM Run: setup.bat

echo.
echo 🎮 Splash Helper - Quick Setup (Windows)
echo ========================================
echo.

REM Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js not found. Please install Node.js 18+ from https://nodejs.org/
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✓ Node.js %NODE_VERSION% detected

REM Install dependencies
echo.
echo 📦 Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm install failed
    exit /b 1
)

REM Create .env from template
if not exist .env (
    echo.
    echo 📝 Creating .env from template...
    copy .env.example .env
    echo ✓ .env created - please edit with your values:
    echo   1. JOIN_API_KEY - Get from your Join app
    echo   2. JOIN_DEVICE_ID - Usually 'group.all'
    echo   3. (Optional) ACCOUNT_FILTER_NAMES - Your character names
) else (
    echo ✓ .env already exists
)

REM Create logs directory
if not exist logs mkdir logs
echo ✓ logs directory created

echo.
echo ✓ Setup complete!
echo.
echo Next steps:
echo 1. Edit .env with your Join API key:
echo    notepad .env
echo.
echo 2. Start the server:
echo    npm run dev    (development)
echo    npm start      (production)
echo.
echo 3. Test the webhook:
echo    curl http://localhost:3000/health
echo.
echo 4. In Dink plugin settings, set webhook URL to:
echo    http://localhost:3000/webhook/dink
echo.
echo 5. Deploy to cloud (see DEPLOYMENT.md for options^)
echo.
pause
