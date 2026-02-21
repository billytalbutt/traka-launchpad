import { execFile } from "child_process";
import { promisify } from "util";
import { readFileSync } from "fs";
import path from "path";

const execFileAsync = promisify(execFile);

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

export interface ServiceConfig {
  name: string;
  displayName: string;
  description: string;
  color: string;
  logProvider: string;
}

export function getServiceConfigs(): ServiceConfig[] {
  const configPath = path.join(process.cwd(), "services.config.json");
  const raw = readFileSync(configPath, "utf-8");
  const parsed = JSON.parse(raw) as { services: ServiceConfig[] };
  return parsed.services;
}

export function getServiceConfig(name: string): ServiceConfig | undefined {
  return getServiceConfigs().find(
    (s) => s.name.toLowerCase() === name.toLowerCase()
  );
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ServiceStatus =
  | "Running"
  | "Stopped"
  | "Starting"
  | "Stopping"
  | "Paused"
  | "NotFound"
  | "Error";

export interface ServiceState {
  name: string;
  displayName: string;
  status: ServiceStatus;
  startType: string;
  exists: boolean;
  error?: string;
}

export interface LogEntry {
  time: string;
  level: string;
  message: string;
  source: string;
}

export type ServiceAction = "start" | "stop" | "restart";

// ---------------------------------------------------------------------------
// PowerShell runner
// ---------------------------------------------------------------------------

async function runPowerShell(script: string, timeoutMs = 20000): Promise<string> {
  const { stdout, stderr } = await execFileAsync(
    "powershell.exe",
    ["-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-Command", script],
    { timeout: timeoutMs }
  );
  if (stderr && !stdout) throw new Error(stderr.trim());
  return stdout.trim();
}

// ---------------------------------------------------------------------------
// Service status
// ---------------------------------------------------------------------------

export async function getAllServicesStatus(): Promise<ServiceState[]> {
  const configs = getServiceConfigs();
  const namesJson = JSON.stringify(configs.map((c) => c.name));

  const script = `
$names = ${namesJson} | ConvertFrom-Json
$results = $names | ForEach-Object {
  $n = $_
  try {
    $svc = Get-Service -Name $n -ErrorAction Stop
    @{
      name        = $n
      displayName = $svc.DisplayName
      status      = $svc.Status.ToString()
      startType   = $svc.StartType.ToString()
      exists      = $true
      error       = ''
    }
  } catch {
    @{
      name        = $n
      displayName = ''
      status      = 'NotFound'
      startType   = ''
      exists      = $false
      error       = $_.Exception.Message
    }
  }
}
ConvertTo-Json -InputObject @($results) -Depth 2 -Compress
  `.trim();

  const raw = await runPowerShell(script);
  const parsed = JSON.parse(raw) as ServiceState[];
  return parsed;
}

export async function getServiceStatus(name: string): Promise<ServiceState> {
  const all = await getAllServicesStatus();
  return (
    all.find((s) => s.name.toLowerCase() === name.toLowerCase()) ?? {
      name,
      displayName: "",
      status: "NotFound",
      startType: "",
      exists: false,
    }
  );
}

// ---------------------------------------------------------------------------
// Logs
// ---------------------------------------------------------------------------

export async function getServiceLogs(
  serviceName: string,
  displayName: string
): Promise<LogEntry[]> {
  const script = `
$serviceName = '${serviceName.replace(/'/g, "''")}'
$displayName = '${displayName.replace(/'/g, "''")}'
$cutoff = (Get-Date).AddDays(-3)
$results = [System.Collections.ArrayList]@()

# System log: service start/stop events (7036 = state change, 7034 = crash, 7031 = unexpected stop)
try {
  $sys = Get-WinEvent -FilterHashtable @{
    LogName   = 'System'
    Id        = @(7036, 7034, 7031, 7001, 7009)
    StartTime = $cutoff
  } -MaxEvents 200 -ErrorAction Stop |
    Where-Object { $_.Message -like "*$displayName*" -or $_.Message -like "*$serviceName*" } |
    Select-Object -First 30 @{N='time';E={$_.TimeCreated.ToString('o')}},
      @{N='level';E={$_.LevelDisplayName}},
      @{N='message';E={($_.Message -replace '\\r?\\n',' ').Trim()}},
      @{N='source';E={'System'}}
  $null = $results.AddRange(@($sys))
} catch {}

# Application log: service's own events
try {
  $app = Get-WinEvent -FilterHashtable @{
    LogName      = 'Application'
    ProviderName = $serviceName
    StartTime    = $cutoff
  } -MaxEvents 50 -ErrorAction Stop |
    Select-Object @{N='time';E={$_.TimeCreated.ToString('o')}},
      @{N='level';E={$_.LevelDisplayName}},
      @{N='message';E={($_.Message -replace '\\r?\\n',' ').Trim()}},
      @{N='source';E={'Application'}}
  $null = $results.AddRange(@($app))
} catch {}

$sorted = $results | Sort-Object time -Descending | Select-Object -First 80
ConvertTo-Json -InputObject @($sorted) -Depth 2 -Compress
  `.trim();

  try {
    const raw = await runPowerShell(script, 30000);
    if (!raw || raw === "null") return [];
    const parsed = JSON.parse(raw) as LogEntry[];
    return parsed.filter((e) => e && e.time);
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export async function performServiceAction(
  name: string,
  action: ServiceAction
): Promise<{ success: boolean; error?: string }> {
  const psAction =
    action === "start"
      ? `Start-Service -Name '${name.replace(/'/g, "''")}' -ErrorAction Stop`
      : action === "stop"
      ? `Stop-Service -Name '${name.replace(/'/g, "''")}' -Force -ErrorAction Stop`
      : `Restart-Service -Name '${name.replace(/'/g, "''")}' -Force -ErrorAction Stop`;

  const script = `
try {
  ${psAction}
  Write-Output 'OK'
} catch {
  Write-Error $_.Exception.Message
}
  `.trim();

  try {
    await runPowerShell(script, 30000);
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.toLowerCase().includes("access") || message.toLowerCase().includes("denied")) {
      return {
        success: false,
        error: "Access denied — the launchpad must be running as Administrator to control services.",
      };
    }
    return { success: false, error: message };
  }
}
