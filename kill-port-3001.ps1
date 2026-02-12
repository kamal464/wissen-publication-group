# Free port 3001 on Windows (PowerShell)
$port = 3001
$lines = netstat -ano | findstr ":$port "
if (-not $lines) {
  Write-Host "No process found listening on port $port"
  exit 0
}
$pids = New-Object System.Collections.Generic.HashSet[int]
foreach ($line in $lines) {
  if ($line -match '\s+(\d+)\s*$') {
    [void]$pids.Add([int]$Matches[1])
  }
}
foreach ($processId in $pids) {
  if ($processId -gt 0) {
    Write-Host "Killing PID $processId (was using port $port)..."
    taskkill /PID $processId /F 2>$null
  }
}
Write-Host "Port $port should be free. Try starting the backend again."
