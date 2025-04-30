@echo off
setlocal

where python >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ОШИБКА] Python не найден. Установите Python и добавьте в PATH.
    pause
    exit /b 1
)

where pip >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ОШИБКА] pip не найден.
    pause
    exit /b 1
)

if not exist backend\venv (
    python -m venv backend\venv
)

call backend\venv\Scripts\activate.bat

pip install -r backend\requirements.txt

start cmd /k "cd backend && call venv\Scripts\activate.bat && python main.py"

where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    pause
    exit /b 1
)

if not exist frontend\node_modules (
    cd frontend
    npm install
    cd ..
)

start cmd /k "cd frontend && npm start"
