# Stops orphaned Next.js / Turbopack / PostCSS node workers that can freeze the PC.
# Safe: only targets next/postcss/start-server processes, not all node.exe.
$targets = Get-CimInstance Win32_Process -Filter "Name='node.exe'" |
  Where-Object { $_.CommandLine -match 'postcss\.js|next[\\/]dist[\\/]bin[\\/]next|start-server\.js|next dev|next start' }

if (-not $targets) {
  Write-Host "No orphan Next.js workers found."
  exit 0
}

Write-Host "Stopping $($targets.Count) process(es)..."
foreach ($p in $targets) {
  try {
    Stop-Process -Id $p.ProcessId -Force -ErrorAction Stop
    Write-Host "  stopped PID $($p.ProcessId)"
  } catch {
    Write-Host "  failed PID $($p.ProcessId): $_"
  }
}

Start-Sleep -Seconds 2
$left = (Get-CimInstance Win32_Process -Filter "Name='node.exe'" |
  Where-Object { $_.CommandLine -match 'postcss\.js' }).Count
Write-Host "Remaining postcss workers: $left"
