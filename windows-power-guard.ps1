# EAII PTT Windows power guard
# Keeps Windows SYSTEM AWAKE while an EAII PTT test/suite is active.
# The display is NOT forced to stay on, so the screen may turn off normally.
# This does not allow execution while Windows is actually suspended; instead it
# prevents normal Windows system sleep/standby while an active benchmark is running.
# The display may turn off; the process continues in the background.
# NOTE: closing a laptop lid can still force sleep if Windows is configured to sleep on lid close.

Add-Type @'
using System;
using System.Runtime.InteropServices;
public static class EaiiPower {
  [DllImport("kernel32.dll")]
  public static extern uint SetThreadExecutionState(uint esFlags);
  public const uint ES_CONTINUOUS = 0x80000000;
  public const uint ES_SYSTEM_REQUIRED = 0x00000001;
  public const uint ES_AWAYMODE_REQUIRED = 0x00000040;
}
'@

$uri = 'http://127.0.0.1:3000/__eaii/suite-status'
$active = $false

Write-Host '[EAII PTT] Background power guard started.'
Write-Host '[EAII PTT] System sleep is blocked while a test/suite is active.'
Write-Host '[EAII PTT] Display may turn off; the benchmark continues running in the background.'

try {
  while ($true) {
    try {
      $r = Invoke-RestMethod -Uri $uri -Method Get -TimeoutSec 3
      $active = [bool]$r.active
    } catch {
      # If the dev server is unavailable, do not hold the machine awake.
      $active = $false
    }

    if ($active) {
      [void][EaiiPower]::SetThreadExecutionState([EaiiPower]::ES_CONTINUOUS -bor [EaiiPower]::ES_SYSTEM_REQUIRED -bor [EaiiPower]::ES_AWAYMODE_REQUIRED)
    } else {
      [void][EaiiPower]::SetThreadExecutionState([EaiiPower]::ES_CONTINUOUS)
    }

    Start-Sleep -Seconds 2
  }
}
finally {
  [void][EaiiPower]::SetThreadExecutionState([EaiiPower]::ES_CONTINUOUS)
}
