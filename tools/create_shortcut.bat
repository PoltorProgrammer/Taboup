@echo off
setlocal

:: 1. SETTINGS
set "APP_NAME=Taboup"
set "PORT=2404"
set "ICON_RELATIVE_PATH=data\images\taboup_logo.ico"
set "SHORTCUT_NAME=%APP_NAME%.lnk"

:: 2. DETECT MODE
:: If run with --serve, it starts the web server.
:: Otherwise, it creates the shortcut.
if "%1"=="--serve" goto :SERVE

:: 3. CREATE MODE (Default)
:: Get the directory where this script is located (the tools folder)
set "TOOLS_DIR=%~dp0"
if "%TOOLS_DIR:~-1%"=="\" set "TOOLS_DIR=%TOOLS_DIR:~0,-1%"

:: Get the root directory (one level up from tools)
for %%I in ("%TOOLS_DIR%\..") do set "ROOT_DIR=%%~fI"

set "SHORTCUT_PATH=%ROOT_DIR%\%SHORTCUT_NAME%"
set "ICON_PATH=%ROOT_DIR%\%ICON_RELATIVE_PATH%"
set "SCRIPT_PATH=%~f0"

echo.
echo ========================================================
echo  %APP_NAME% Shortcut Creator
echo ========================================================
echo.
echo Creating shortcut in root: %ROOT_DIR%
echo Target shortcut: %SHORTCUT_NAME%
echo.

:: Create the shortcut pointing back to this script with the --serve flag
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ws = New-Object -ComObject WScript.Shell; " ^
  "$s = $ws.CreateShortcut('%SHORTCUT_PATH%'); " ^
  "$s.TargetPath = '%SCRIPT_PATH%'; " ^
  "$s.Arguments = '--serve'; " ^
  "$s.WorkingDirectory = '%ROOT_DIR%'; " ^
  "$s.IconLocation = '%ICON_PATH%'; " ^
  "$s.Description = 'Start %APP_NAME%'; " ^
  "$s.Save()"

echo.
echo ========================================================
echo  SUCCESS!
echo.
echo  1. The '%APP_NAME%' shortcut has been created in the main folder.
echo  2. Use that shortcut to launch the site.
echo.
echo ========================================================
echo.
pause
exit /b

:SERVE
:: SERVER LOGIC
title %APP_NAME% Local Server
setlocal enabledelayedexpansion

:: Move to the root directory (one level up from tools)
cd /d "%~dp0\.."

echo.
echo ========================================================
echo  %APP_NAME% is running at: http://localhost:%PORT%
echo  Serving folder: !cd!
echo ========================================================
echo.
echo  [!] Keep this window open to keep the server running.
echo.

:: Run the server using npx -y serve
echo Starting server...
start /b "" npx -y serve -p %PORT% .

:: Wait a moment for the server to initialize (2 seconds)
timeout /t 2 /nobreak >nul

:: Open the browser once the server is likely ready
start "" "http://localhost:%PORT%"

:: Keep the window open and wait for user to close it
echo.
echo ========================================================
echo  SERVER READY
echo  Press Ctrl+C in this window to stop the server later.
echo ========================================================
pause >nul

if %errorlevel% neq 0 (
   echo.
   echo Error: Failed to start server. Ensure Node.js is installed.
   pause
)
