import hmac
import hashlib
import time
import os
import json
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

SECRET_SALT = os.getenv("LEADERBOARD_SECRET", "LAST_GRID_DEFENSE_2026_SALT")
SCORES_FILE = "/tmp/scores_cache.json"

app = FastAPI(
    title="Tower Defense: Last Grid - Vercel Serverless API",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DEFAULT_SCORES = [
  { "id": 1, "player_name": "NeonMaster", "map_id": "last_grid", "difficulty": "normal", "wave_reached": 30, "score": 12450, "created_at": time.time() - 3600 },
  { "id": 2, "player_name": "CyberGhost", "map_id": "twin_gate", "difficulty": "normal", "wave_reached": 29, "score": 9820, "created_at": time.time() - 7200 },
  { "id": 3, "player_name": "GridRunner_UZ", "map_id": "iron_wall", "difficulty": "normal", "wave_reached": 25, "score": 7650, "created_at": time.time() - 10800 },
  { "id": 4, "player_name": "TashkentPro", "map_id": "training_grid", "difficulty": "normal", "wave_reached": 10, "score": 3400, "created_at": time.time() - 14400 }
]

def load_scores():
    if os.path.exists(SCORES_FILE):
        try:
            with open(SCORES_FILE, "r") as f:
                return json.load(f)
        except Exception:
            return list(DEFAULT_SCORES)
    return list(DEFAULT_SCORES)

def save_scores(scores):
    try:
        with open(SCORES_FILE, "w") as f:
            json.dump(scores, f)
    except Exception:
        pass

class ScoreSubmission(BaseModel):
    player_name: str = Field(..., min_length=2, max_length=24)
    map_id: str
    difficulty: str = "normal"
    wave_reached: int
    score: int
    seed: int
    checksum: Optional[str] = None

@app.get("/")
@app.get("/api")
@app.get("/api/")
@app.get("/scores")
@app.get("/api/scores")
def get_all_scores(
    map_id: Optional[str] = None,
    limit: int = Query(50, ge=1, le=100)
):
    scores = load_scores()
    if map_id and map_id != "all":
        scores = [s for s in scores if s.get("map_id") == map_id]
    scores.sort(key=lambda s: s.get("score", 0), reverse=True)
    return scores[:limit]

@app.post("/")
@app.post("/api")
@app.post("/api/")
@app.post("/scores")
@app.post("/api/scores")
def post_score(sub: ScoreSubmission):
    scores = load_scores()
    new_entry = {
        "id": len(scores) + 1,
        "player_name": sub.player_name.strip(),
        "map_id": sub.map_id,
        "difficulty": sub.difficulty,
        "wave_reached": sub.wave_reached,
        "score": sub.score,
        "created_at": time.time()
    }
    scores.append(new_entry)
    scores.sort(key=lambda s: s.get("score", 0), reverse=True)
    save_scores(scores[:200])
    return {
        "status": "success",
        "message": f"Score of {sub.score} saved for {sub.player_name}!",
        "rank": scores.index(new_entry) + 1
    }
