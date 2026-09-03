# Sequential Pipeline Resilience Fix

## Problem
The six-test pipeline was browser-timer driven. When Windows/OS sleep suspended the browser, `setTimeout`/`setInterval` could stop running. If the computer slept during the short hand-off between completed tests, the pending auto-advance timer could be lost, leaving the UI stuck on the previous step.

## Fixes
- Sequential test elapsed time is reconciled from wall-clock time after sleep/resume.
- A persisted `autoAdvanceAtMs` deadline is stored with the active pipeline snapshot.
- On system wake or session restore, an expired hand-off deadline starts the next queued test automatically.
- The next-test countdown is derived from the deadline instead of decrementing a counter blindly.
- Pipeline snapshots are refreshed during the hand-off so a reload/sleep does not lose the next-step state.
- Browser favicon/app icon now uses `/logo.png`, so the EAII PTT logo appears in the browser tab/URL bar.

## Important limitation
This is still a browser-side test runner. A browser cannot continue generating traffic while the entire computer is powered off or fully suspended. WakeLock helps prevent sleep on supported browsers, but it is not a guarantee against OS policy, laptop lid closure, battery saver, browser termination, or power loss.

For true unattended execution (PC can sleep/close and tests continue remotely), the execution engine must move to a server/worker/CI job. The browser should then monitor the job rather than own the test timers.

## Windows aggressive background execution / sleep protection

EAII PTT now includes `windows-power-guard.ps1` and `run_windows.bat` starts it automatically.

The native Windows guard uses `SetThreadExecutionState(ES_CONTINUOUS | ES_SYSTEM_REQUIRED)` while EAII PTT reports an active test or sequential suite. This is intentionally different from browser Wake Lock:

- Windows is prevented from entering system sleep/standby while tests are active.
- The display is **not** forced to remain on; the monitor can turn off normally.
- The guard runs outside the browser, so browser timer throttling does not control the Windows sleep decision.
- When the suite/test is stopped or all six tests complete, EAII PTT reports inactive and the guard releases the execution request.
- If Windows is already actually suspended, no browser application can continue executing JavaScript during that suspension. The native guard prevents that suspension from occurring during an active benchmark.

### Requirement

For unattended execution, start EAII PTT with `run_windows.bat` on Windows. Do not rely only on the browser's Wake Lock API.

### Important laptop behavior

Closing a laptop lid can be configured by Windows to force sleep. The native execution-state request is not a substitute for changing the lid-close power policy. If the lid is closed, configure Windows Power Options so closing the lid does not put the computer to sleep during unattended test execution.
