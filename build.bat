@echo off
echo =========================================
echo BAT DAU DONG GOI MA NGUON (PRODUCTION)
echo =========================================

echo.
echo [1/2] Dang build Backend (NestJS)...
cd backend
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [LOI] Xay ra loi khi build Backend!
    pause
    exit /b %ERRORLEVEL%
)
cd ..
echo [OK] Build Backend hoan tat! Thu muc 'backend/dist' da duoc tao.

echo.
echo [2/2] Dang build Frontend (React/Vite)...
cd frontend
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [LOI] Xay ra loi khi build Frontend!
    pause
    exit /b %ERRORLEVEL%
)
cd ..
echo [OK] Build Frontend hoan tat! Thu muc 'frontend/dist' da duoc tao.

echo.
echo =========================================
echo DONG GOI THANH CONG!
echo He thong da san sang chay tren Production.
echo =========================================
pause
