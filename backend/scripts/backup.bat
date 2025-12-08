@echo off
REM ===================================
REM NMN CINEMA - DATABASE BACKUP SCRIPT
REM ===================================
REM Usage: scripts\backup.bat
REM
REM Requirements:
REM - mongodump installed (part of MongoDB Tools)
REM - .env file with MONGO_URI

echo.
echo ========================================
echo   NMN CINEMA - DATABASE BACKUP
echo ========================================
echo.

REM Variables
set BACKUP_DIR=backups
set DATE=%date:~10,4%%date:~4,2%%date:~7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set DATE=%DATE: =0%
set BACKUP_NAME=nmn_cinema_%DATE%

REM Create backup directory
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

echo [INFO] Starting backup...
echo   Output: %BACKUP_DIR%\%BACKUP_NAME%
echo.

REM Run mongodump (using localhost default)
mongodump --db=datn-cinema --out="%BACKUP_DIR%\%BACKUP_NAME%"

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Backup failed!
    exit /b 1
)

echo.
echo [SUCCESS] Backup completed!
echo   Location: %BACKUP_DIR%\%BACKUP_NAME%
echo.

REM List backups
echo Recent backups:
dir /b "%BACKUP_DIR%" 2>nul | findstr /n "."

pause
