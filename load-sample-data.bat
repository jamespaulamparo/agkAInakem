@echo off
rem Add (or regenerate) clearly-marked sample data for demos.
rem Remove it from the dashboard (Admin tools) or run: venv\Scripts\python.exe manage.py seed_demo_data --clear
cd /d "%~dp0"
if not exist "venv\Scripts\python.exe" (echo Run start-agkainakem.bat once first. & pause & exit /b 1)
venv\Scripts\python.exe manage.py seed_demo_data
pause
