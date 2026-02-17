# Traka Launchpad - Local Hostname Setup
# Run this script as Administrator (right-click > Run as Administrator)
# Uses .test TLD (IANA RFC 2606 reserved for testing - no DNS/mDNS conflicts)

$hostsPath = "C:\Windows\System32\drivers\etc\hosts"

# Remove old .local entries if present
$content = Get-Content $hostsPath -Raw
if ($content -match "traka\.local") {
    Write-Host "Removing old .traka.local entries..." -ForegroundColor Yellow
    $lines = Get-Content $hostsPath
    $filtered = $lines | Where-Object { $_ -notmatch "traka\.local" -and $_ -notmatch "# Traka Launchpad" -and $_ -notmatch "# End Traka" }
    Set-Content -Path $hostsPath -Value $filtered -Encoding ASCII
    Write-Host "Old entries removed." -ForegroundColor Green
}

$marker = "# Traka Launchpad hostnames"
$entries = @"

$marker
127.0.0.1  launchpad.traka.test
127.0.0.1  docs.traka.test
127.0.0.1  bookings.traka.test
127.0.0.1  api.traka.test
# End Traka Launchpad
"@

$content = Get-Content $hostsPath -Raw
if ($content -match [regex]::Escape($marker)) {
    Write-Host "Traka .test hostnames already configured." -ForegroundColor Yellow
} else {
    Add-Content -Path $hostsPath -Value $entries -Encoding ASCII
    Write-Host "Traka hostnames added to hosts file." -ForegroundColor Green
}

# Flush DNS cache
ipconfig /flushdns | Out-Null
Write-Host "DNS cache flushed." -ForegroundColor Green

Write-Host ""
Write-Host "Configured hostnames:" -ForegroundColor Cyan
Write-Host "  https://launchpad.traka.test  -> Traka Launchpad"
Write-Host "  https://docs.traka.test       -> Docs Assistant"
Write-Host "  https://bookings.traka.test   -> Item Bookings"
Write-Host "  https://api.traka.test        -> Integration Engine API"
Write-Host ""
Write-Host "Press any key to close..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
