@echo off
REM Creates (or resets) the demo admin account: username pc, password password
cd /d "%~dp0"
if not exist "venv\Scripts\python.exe" (echo Run start-agkainakem.bat once first. & pause & exit /b 1)
venv\Scripts\python.exe manage.py migrate --noinput >nul
venv\Scripts\python.exe manage.py create_admin --username pc --password password
echo.
echo Log in at http://127.0.0.1:8000/admin/  (or your tunnel link + /admin/)
pause
