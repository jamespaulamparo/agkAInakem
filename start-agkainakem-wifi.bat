@echo off
REM agkAInakem - run locally AND let phones on the same Wi-Fi open it (not a deployment)
title agkAInakem server (Wi-Fi sharing)
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

echo.
echo [5/5] Sharing on your Wi-Fi at port 8000. Phones on the SAME Wi-Fi can open:
%PY% -c "import socket;s=socket.socket(socket.AF_INET,socket.SOCK_DGRAM);s.connect(('10.255.255.255',1));print('      http://'+s.getsockname()[0]+':8000')"
echo.
echo  - If Windows asks about the firewall, allow Python on PRIVATE networks.
echo  - The QR code page opens in your browser; scan it with a phone.
echo  - Close this window to stop sharing.
echo.
set DJANGO_LAN=1
start "" http://127.0.0.1:8000/share
%PY% manage.py runserver 0.0.0.0:8000
pause
