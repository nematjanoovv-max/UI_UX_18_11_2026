import hmac
import hashlib
import time
import os
import sqlite3
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Request, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Secret key for HMAC checksum validation
SECRET_SALT = os.getenv("LEADERBOARD_SECRET", "LAST_GRID_DEFENSE_2026_SALT")
DB_PATH = os.getenv("DB_PATH", "leaderboard.db")

app = FastAPI(
    title="Tower Defense: Last Grid - Global Leaderboard API",
    version="1.0.0",
    description="Online Leaderboard service with HMAC anti-cheat validation."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS scores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            player_name TEXT NOT NULL,
            map_id TEXT NOT NULL,
            difficulty TEXT NOT NULL,
            wave_reached INTEGER NOT NULL,
            score INTEGER NOT NULL,
            seed INTEGER NOT NULL,
            created_at REAL NOT NULL
        )
    """)
    conn.commit()
    conn.close()

init_db()

class ScoreSubmission(BaseModel):
    player_name: str = Field(..., min_length=2, max_length=20)
    map_id: str
    difficulty: str = "normal"
    wave_reached: int
    score: int
    seed: int
    checksum: str

class ScoreEntry(BaseModel):
    id: int
    player_name: str
    map_id: str
    difficulty: str
    wave_reached: int
    score: int
    created_at: float

def compute_checksum(player_name: str, map_id: str, wave_reached: int, score: int, seed: int) -> str:
    raw = f"{player_name}:{map_id}:{wave_reached}:{score}:{seed}:{SECRET_SALT}"
    return hashlib.sha256(raw.encode('utf-8')).hexdigest()

@app.get("/")
def read_root():
    return {
        "service": "Tower Defense: Last Grid Leaderboard API",
        "status": "online",
        "version": "1.0.0"
    }

@app.get("/api/scores/{map_id}", response_model=List[ScoreEntry])
def get_leaderboard(
    map_id: str,
    difficulty: str = Query("normal", regex="^(normal|hard|nightmare|endless|boss_rush)$"),
    limit: int = Query(50, ge=1, le=100)
):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("""
        SELECT id, player_name, map_id, difficulty, wave_reached, score, created_at
        FROM scores
        WHERE map_id = ? AND difficulty = ?
        ORDER BY score DESC, wave_reached DESC, created_at ASC
        LIMIT ?
    """, (map_id, difficulty, limit))
    rows = c.fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.post("/api/scores")
def submit_score(submission: ScoreSubmission):
    # 1. Anti-cheat HMAC Checksum Verification
    expected = compute_checksum(
        submission.player_name,
        submission.map_id,
        submission.wave_reached,
        submission.score,
        submission.seed
    )
    if not hmac.compare_digest(expected, submission.checksum):
        raise HTTPException(status_code=403, detail="Invalid score signature (anti-cheat verification failed).")

    # 2. Sanity Checks
    if submission.wave_reached <= 0 or submission.score < 0:
        raise HTTPException(status_code=400, detail="Invalid game parameters.")

    # 3. Insert Score
    now = time.time()
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("""
        INSERT INTO scores (player_name, map_id, difficulty, wave_reached, score, seed, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        submission.player_name.strip(),
        submission.map_id,
        submission.difficulty,
        submission.wave_reached,
        submission.score,
        submission.seed,
        now
    ))
    conn.commit()
    inserted_id = c.lastrowid
    conn.close()

    return {
        "status": "accepted",
        "score_id": inserted_id,
        "message": f"Score of {submission.score} recorded for {submission.player_name}."
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
