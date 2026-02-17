# Traka Launchpad - Start Script
# Starts both the Next.js dev server and the Caddy HTTPS reverse proxy

$root = Split-Path -Parent $PSScriptRoot

Write-Host "Starting Traka Launchpad..." -ForegroundColor Cyan
Write-Host ""

# Start Next.js dev server in background
Write-Host "[1/2] Starting Next.js dev server (port 3000)..." -ForegroundColor Yellow
$nextjs = Start-Process -FilePath "npm" -ArgumentList "run dev" -WorkingDirectory $root -PassThru -WindowStyle Hidden
Write-Host "       PID: $($nextjs.Id)" -ForegroundColor DarkGray

Start-Sleep -Seconds 2

# Start Caddy reverse proxy
Write-Host "[2/2] Starting Caddy HTTPS reverse proxy..." -ForegroundColor Yellow
$caddy = Start-Process -FilePath "$root\caddy\caddy.exe" -ArgumentList "run --config `"$root\caddy\Caddyfile`"" -PassThru -WindowStyle Hidden
Write-Host "       PID: $($caddy.Id)" -ForegroundColor DarkGray

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host " Traka Launchpad is running!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host " https://launchpad.traka.test" -ForegroundColor White
Write-Host ""
Write-Host " Press Ctrl+C to stop all services" -ForegroundColor DarkGray
Write-Host ""

try {
    while ($true) { Start-Sleep -Seconds 1 }
} finally {
    Write-Host "`nStopping services..." -ForegroundColor Yellow
    Stop-Process -Id $nextjs.Id -Force -ErrorAction SilentlyContinue
    Stop-Process -Id $caddy.Id -Force -ErrorAction SilentlyContinue
    Write-Host "All services stopped." -ForegroundColor Green
}
