ALIMI ASSISTANT — Multi-browser live chat
=========================================

Files to replace/add:
- src/data/assistantStore.js
- src/pages/BotAssistant.jsx
- src/pages/BotAssistant.css
- src/pages/management.jsx
- src/pages/management.css
- server/assistant-server.mjs
- package.json

Run:
  npm install
  npm run dev

`npm run dev` now starts both:
- Vite website: port 5173
- Shared assistant server: port 4179

The assistant server listens on 0.0.0.0 so Chrome/Firefox/Edge and other devices
that open the website from the same computer/LAN can share the same conversations.

Data is saved in:
  server/data/assistant-chat.json

Important for another device on the LAN:
- Open the website using the host computer IP, for example:
  http://192.168.1.20:5173
- Do NOT use 127.0.0.1 from the other device.
- Windows Firewall may ask permission for ports 5173 and 4179; allow Private networks.

For a public internet deployment, host the assistant server on your public server
and set VITE_ASSISTANT_API_ROOT to its public /api/assistant URL.
