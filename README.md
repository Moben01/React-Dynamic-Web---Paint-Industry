# Alimi Paint Company

React + Vite website and local CMS with Electron desktop packaging.

## Run in browser

```bash
npm install
npm run dev
```

Public website: `http://127.0.0.1:5173/`
Admin panel: `http://127.0.0.1:5173/admin`

## Run as desktop app

```bash
npm run electron:dev
```

## Build Windows installer and portable app

```bash
npm run desktop:build
```

Outputs are written to `release/`.

## Language behavior

- Dari and Pashto use RTL.
- English uses LTR.
- The language choice is stored in localStorage.
- Admin/public content stored in localStorage remains local to each computer.

## Translation button

Set a backend translation endpoint in `.env`:

```env
VITE_TRANSLATION_API_URL=http://127.0.0.1:5050/api/translate
```

Do not put private translation API keys directly in Vite frontend environment variables.
