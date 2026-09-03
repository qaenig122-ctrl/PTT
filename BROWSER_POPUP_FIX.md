# Browser popup fix

Browser opening is now strictly idempotent.

- `run_windows.bat` never opens the browser.
- The application does not open a browser during startup recovery.
- A manual Start Test may request one dashboard opening.
- Automatic sequential continuation never opens another window/tab.
- React remounts/StrictMode cannot cause duplicate openings because the app uses sessionStorage.
- The Vite server also has a second server-process guard, so repeated requests to the open-dashboard endpoint are ignored after the first successful request.
