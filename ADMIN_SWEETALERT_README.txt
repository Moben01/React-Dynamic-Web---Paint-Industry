Admin SweetAlert2 update

1) Replace the included files in the same paths in your project.
2) In the project root run:
   npm install sweetalert2
3) Restart Vite/Electron.

This update removes browser alert()/confirm()/prompt() usage from src/pages and src/components used by Admin and routes success, warning, error, reset and delete confirmations through SweetAlert2.

The DashboardImages files in this package also preserve the previous multi-image/compression fix.
