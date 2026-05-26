# Tabitayo

Philippine event seat-finder — guests scan a QR code, search their name, and find their table.

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- React Router v7
- fuse.js, qrcode, axios, react-dropzone, papaparse

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Environment

Copy `.env.example` to `.env`:

```
VITE_API_URL=http://localhost:3000/api
VITE_USE_MOCK=true
```

Mock data is enabled by default (`VITE_USE_MOCK` unset or `true`). Set `VITE_USE_MOCK=false` when your backend is ready.

## Demo accounts

| Role  | Email               | Password   |
|-------|---------------------|------------|
| Host  | maria@example.com   | any        |
| Admin | admin@tabitayo.ph   | any        |

## Key routes

| Route | Description |
|-------|-------------|
| `/e/:eventId` | Guest landing (try `evt-demo`) |
| `/login` | Admin & host login |
| `/register` | Host registration |
| `/host/events` | Host dashboard |
| `/admin/hosts` | Admin host management |

## Guest demo event

Visit `/e/evt-demo` to try fuzzy name search with Filipino name samples (aliases, `Ma.`, hyphenated surnames).
