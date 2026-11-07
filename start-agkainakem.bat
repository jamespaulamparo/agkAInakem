@echo off
REM agkAInakem - one-click local launcher (Windows)
title agkAInakem server
cd /d "%~dp0"

if not exist "venv\Scripts\python.exe" (
  echo [1/5] Creating virtual environment...
  python -m venv venv || (echo Python was not found. Install Python 3.11+ from python.org and try again. & pause & exit /b 1)
)
set PY=venv\Scripts\python.exe

echo [2/5] Installing Python packages...
%PY% -m pip install -q --disable-pip-version-check -r requirements.txt || (echo Package install failed. & pause & exit /b 1)

if not exist ".env" copy /y ".env.example" ".env" >nul

echo [3/5] Updating database...
%PY% manage.py migrate --noinput || (pause & exit /b 1)

echo [4/5] Loading dictionary and support data...
%PY% manage.py seed_vocabulary
%PY% manage.py seed_support
%PY% manage.py create_admin --username pc --password password --if-missing
%PY% manage.py seed_demo_data --if-empty

echo [5/5] Starting server at http://127.0.0.1:8000  (close this window to stop)
start "" http://127.0.0.1:8000/
%PY% manage.py runserver 127.0.0.1:8000
pause
