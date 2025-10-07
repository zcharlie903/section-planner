# RetireWise (React + Vite)

A minimal React frontend wired to a FastAPI backend for retirement planning.

## Quick Start
```bash
npm install
npm run dev
```

Set the backend URL by creating a `.env` file:
```bash
cp .env.example .env
# edit .env to point to your deployed FastAPI URL
```

Build for production:
```bash
npm run build
```

## Deploy
- **Vercel**: Connect repo, set `VITE_API_BASE_URL` env var, build command `npm run build`, output `dist`.
- **Netlify**: Same; `netlify.toml` included.
