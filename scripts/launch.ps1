# Traka Launchpad - Desktop Launcher
# Double-click shortcut runs this: starts services if needed, opens browser.

$root = Split-Path -Parent $PSScriptRoot
$url = "http://localhost:3000"
$port = 3000
$maxWait = 30

function Test-PortOpen {
    try {
        $tcp = New-Object System.Net.Sockets.TcpClient
        $tcp.Connect("127.0.0.1", $port)
        $tcp.Close()
        return $true
    } catch {
        return $false
    }
}

# If already running, just open the browser
if (Test-PortOpen) {
    Start-Process $url
    exit 0
}

# Start Next.js dev server in background
Start-Process -FilePath "npm" -ArgumentList "run dev" -WorkingDirectory $root -WindowStyle Hidden

# Wait for the dev server to be ready
$elapsed = 0
while (-not (Test-PortOpen) -and $elapsed -lt $maxWait) {
    Start-Sleep -Seconds 1
    $elapsed++
}

if (Test-PortOpen) {
    Start-Process $url
} else {
    # Fallback: open anyway — Next.js may still be compiling
    Start-Sleep -Seconds 2
    Start-Process $url
}
