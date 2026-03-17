$myPid = $PID
$procs = Get-CimInstance Win32_Process | Where-Object {
  $_.ProcessId -ne $myPid -and
  $_.Name -eq 'node.exe' -and
  $_.CommandLine -match 'next' -and
  $_.CommandLine -match 'bunny' -and
  $_.CommandLine -notmatch 'cleanup-lock'
}
foreach ($p in $procs) {
  try {
    Stop-Process -Id $p.ProcessId -Force -ErrorAction SilentlyContinue
    Write-Host "[cleanup] PID $($p.ProcessId) 종료 ($($p.CommandLine.Substring(0, [Math]::Min(80, $p.CommandLine.Length))))..."
  } catch {}
}
if ($procs.Count -gt 0) {
  Start-Sleep -Milliseconds 1500
}
