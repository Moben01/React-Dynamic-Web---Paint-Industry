# Project completion status

## Completed in this package

- Central language context for Dari, Pashto and English.
- Global RTL for Dari/Pashto and LTR for English.
- Header language switch connected to the central language state.
- Header responsive RTL/LTR CSS.
- Admin sidebar RTL/LTR direction support.
- Translation API helper with Google Translate fallback.
- Product color picker and HEX color management.
- Dynamic products/projects stores retained.
- BrowserRouter in development and HashRouter in packaged Electron.
- Electron main/preload files added.
- Windows NSIS and portable build configuration organized.
- Invalid automatic icon dependency removed from packaging config.
- README and environment example added.
- Explicit hard-coded RTL attributes removed so global direction can work.

## Important

The translation API requires a backend endpoint. Without it, the Google Translate fallback opens instead. The frontend must not contain a private API key.

Data is currently stored in localStorage and is therefore local to each computer/profile.
