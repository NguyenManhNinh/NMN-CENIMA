@echo off
REM ===================================
REM NMN CINEMA - DATABASE RESTORE SCRIPT
REM ===================================
REM Usage: scripts\restore.bat [backup_folder_name]
REM Example: scripts\restore.bat nmn_cinema_20251208_093000
REM
REM Requirements:
REM - mongorestore installed (part of MongoDB Tools)

echo.
echo ========================================
echo   NMN CINEMA - DATABASE RESTORE
echo ========================================
echo.

set BACKUP_DIR=backups
set BACKUP_NAME=%1

if "%BACKUP_NAME%"=="" (
    echo [ERROR] Please provide backup folder name
    echo Usage: scripts\restore.bat [backup_folder_name]
    echo.
    echo Available backups:
    dir /b "%BACKUP_DIR%" 2>nul
    exit /b 1
)

echo [WARNING] This will REPLACE the current database!
echo Backup to restore: %BACKUP_DIR%\%BACKUP_NAME%
echo.
set /p CONFIRM="Are you sure? (y/n): "

if /i not "%CONFIRM%"=="y" (
    echo Restore cancelled.
    exit /b 0
)

echo.
echo [INFO] Restoring database...

mongorestore --db=datn-cinema --drop "%BACKUP_DIR%\%BACKUP_NAME%\datn-cinema"

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Restore failed!
    exit /b 1
)

echo.
echo [SUCCESS] Database restored successfully!
echo.

pause
