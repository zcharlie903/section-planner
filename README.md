# RetireWise Frontend (Railway-ready)

## Deploy on Railway
1. Push this folder to GitHub.
2. Railway → New Project → Deploy from Repo.
3. In the **Variables** tab, add:
   ```
   VITE_API_BASE_URL=https://retirewise-backend-production.up.railway.app
   ```
4. Deploy. Railway will run `npm ci && npm run build` then `npm run preview` (see `railway.toml`).

## Local dev
```bash
npm install
npm run dev
```
Create `.env` from `.env.example` and set your backend URL.
