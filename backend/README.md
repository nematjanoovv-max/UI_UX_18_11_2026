# Tower Defense: Last Grid — Online Leaderboard API

Lightweight FastAPI backend with HMAC-signed anti-cheat checksum validation and SQLite/PostgreSQL storage.

## Features
- `GET /api/scores/{map_id}`: Fetch Top 50/100 rankings per sector and difficulty.
- `POST /api/scores`: Submit score with SHA-256 HMAC signature verification (`player_name:map_id:wave_reached:score:seed:SECRET`).
- Zero external services required: runs out of the box with SQLite or connect `DATABASE_URL` for PostgreSQL.

## Deployment to Render.com (1-Click)
1. Push this repository to GitHub.
2. In Render Dashboard, click **New > Blueprint** and select this repo (uses `backend/render.yaml`).
3. Set your production secret in environment variable `LEADERBOARD_SECRET`.

## Local Development
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
