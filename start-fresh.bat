@echo off
echo ============================================
echo  Traka Launchpad - Clean Start
echo ============================================
echo.

echo [1/3] Clearing Turbopack cache (.next folder)...
if exist ".next" (
    rmdir /s /q ".next"
    echo       Done.
) else (
    echo       Nothing to clear.
)

echo.
echo [2/3] Regenerating Prisma client...
call npx prisma generate
if %errorlevel% neq 0 (
    echo       WARNING: Prisma generate had issues - server may still work.
) else (
    echo       Done.
)

echo.
echo [3/3] Starting dev server on http://localhost:3847 ...
echo       Press Ctrl+C to stop.
echo.
call npm run dev
