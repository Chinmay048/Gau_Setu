@echo off
REM Quick Vercel Deployment Script for Backend

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║      🚀 QUICK VERCEL DEPLOYMENT SCRIPT                    ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Check if Vercel is installed
echo Checking Vercel CLI...
vercel --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing Vercel CLI...
    call npm install -g vercel
    if %errorlevel% neq 0 (
        echo ❌ Failed to install Vercel CLI
        echo Please run: npm install -g vercel
        pause
        exit /b 1
    )
)

echo ✅ Vercel CLI found

REM Change to backend directory
cd /d "%~dp0"

echo.
echo 📦 Deploying to Vercel...
echo (This will open a browser for authentication if needed)
echo.

REM Deploy to Vercel
call vercel --prod

if %errorlevel% equ 0 (
    echo.
    echo ✅ DEPLOYMENT SUCCESSFUL!
    echo.
    echo 📋 IMPORTANT - Add Environment Variables:
    echo    1. Go to: https://vercel.com/dashboard
    echo    2. Click on your "gau-setu-backend" project
    echo    3. Go to: Settings → Environment Variables
    echo    4. Add these variables:
    echo       - JWT_SECRET: dfb05fde165909de36ab79645eefaf81aa0f246bc071802c6659f165f98dbbe5
    echo       - FRONTEND_URL: https://Chinmay048.github.io/Gau_Setu/
    echo       - NODE_ENV: production
    echo    5. Click "Deploy" in Deployments tab to redeploy with new env vars
    echo.
    echo 🎉 Your backend URL: https://gau-setu-backend.vercel.app/api/
    echo.
    pause
) else (
    echo.
    echo ❌ Deployment failed!
    echo.
    echo Try these troubleshooting steps:
    echo    1. Make sure you're logged in: vercel login
    echo    2. Try again: vercel --prod
    echo    3. Check the .env file exists with JWT_SECRET
    echo.
    pause
    exit /b 1
)
