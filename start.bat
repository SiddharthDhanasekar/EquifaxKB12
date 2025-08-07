@echo off
REM 🚀 Equifax Knowledge Base - One-Click Startup Script for Windows

echo 🚀 Starting Equifax Knowledge Base...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    echo Then run this script again.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed!
    echo Please install npm (comes with Node.js)
    echo Then run this script again.
    pause
    exit /b 1
)

REM Check if package.json exists
if not exist "package.json" (
    echo ❌ package.json not found!
    echo Please make sure you're in the correct directory.
    echo Current directory: %cd%
    pause
    exit /b 1
)

echo ✅ Node.js and npm found
echo 📦 Installing dependencies...

REM Install dependencies
npm install

if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    echo Try running: npm cache clean --force ^&^& npm install
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully
echo 🌐 Starting development server...

REM Start the development server
npm run dev

echo 🎉 Application started!
echo 📱 Open your browser and go to: http://localhost:3000
echo 🛑 Press Ctrl+C to stop the server
pause 