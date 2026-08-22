import os
import sys
import json
import sqlite3
import random
import datetime
import base64
import urllib.parse
import hashlib
import hmac
import secrets
import re
from typing import List, Optional, Dict, Any

def hash_password(password: str, salt: Optional[str] = None) -> str:
    if not salt:
        salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
    return f"{salt}${key.hex()}"

def verify_password(password: str, hashed: str) -> bool:
    try:
        salt, key_hex = hashed.split('$', 1)
        expected_key = bytes.fromhex(key_hex)
        actual_key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
        return hmac.compare_digest(expected_key, actual_key)
    except Exception:
        return False

def validate_email_format(email: str) -> bool:
    pattern = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
    return bool(re.match(pattern, email.strip()))


from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import aiohttp
from dotenv import load_dotenv

import pandas as pd
import numpy as np

# Add ml folder to sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'ml'))
try:
    from predict import predict_difficulty as ml_predict_difficulty
    ML_AVAILABLE = True
except Exception as e:
    ML_AVAILABLE = False

# --- QUANTUM RESEARCH MODULE (Experimental — isolated from production pipeline) ---
try:
    from quantum.router import router as quantum_router
    QUANTUM_AVAILABLE = True
except Exception as _qe:
    quantum_router = None
    QUANTUM_AVAILABLE = False

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

DB_FILE = "mindmitra.db"

app = FastAPI(title="MindMitra Backend - Cognitive Exploration Platform")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount quantum research router (experimental — does not affect production routes)
if QUANTUM_AVAILABLE and quantum_router:
    app.include_router(quantum_router)

# --- DB SETUP ---

def get_db():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with get_db() as conn:
        c = conn.cursor()
        c.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                display_name TEXT,
                age INTEGER,
                preferred_language TEXT,
                voice_enabled BOOLEAN,
                created_at TIMESTAMP
            )
        """)
        c.execute("""
            CREATE TABLE IF NOT EXISTS sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                started_at TIMESTAMP,
                completed_at TIMESTAMP,
                status TEXT
            )
        """)
        c.execute("""
            CREATE TABLE IF NOT EXISTS game_sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id INTEGER,
                user_id INTEGER,
                game_type TEXT,
                difficulty INTEGER,
                started_at TIMESTAMP,
                completed_at TIMESTAMP,
                accuracy REAL,
                avg_response_time_ms REAL,
                total_events INTEGER,
                repeat_errors INTEGER,
                corrections INTEGER,
                completion_time_ms REAL
            )
        """)
        c.execute("""
            CREATE TABLE IF NOT EXISTS game_events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                game_session_id INTEGER,
                user_id INTEGER,
                event_type TEXT,
                event_data_json TEXT,
                timestamp TIMESTAMP
            )
        """)
        c.execute("""
            CREATE TABLE IF NOT EXISTS adaptive_decisions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                game_session_id INTEGER,
                user_id INTEGER,
                game_type TEXT,
                previous_difficulty INTEGER,
                recommended_difficulty INTEGER,
                recommendation TEXT,
                reason TEXT,
                model_used TEXT,
                confidence REAL,
                features_json TEXT,
                timestamp TIMESTAMP
            )
        """)
        c.execute("""
            CREATE TABLE IF NOT EXISTS familiar_people (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                name TEXT,
                relationship TEXT,
                photo_url TEXT,
                consent_confirmed BOOLEAN,
                created_at TIMESTAMP
            )
        """)
        c.execute("""
            CREATE TABLE IF NOT EXISTS reminders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                type TEXT,
                title TEXT,
                time TEXT,
                repeat_pattern TEXT,
                enabled BOOLEAN,
                created_at TIMESTAMP
            )
        """)
        c.execute("""
            CREATE TABLE IF NOT EXISTS sync_queue (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                entity_type TEXT,
                entity_id INTEGER,
                action TEXT,
                data_json TEXT,
                created_at TIMESTAMP,
                synced_at TIMESTAMP
            )
        """)
        c.execute("""
            CREATE TABLE IF NOT EXISTS caregivers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                full_name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at TIMESTAMP
            )
        """)
        c.execute("""
            CREATE TABLE IF NOT EXISTS otp_tokens (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL,
                otp_code TEXT NOT NULL,
                expires_at TIMESTAMP NOT NULL,
                used BOOLEAN DEFAULT 0,
                created_at TIMESTAMP
            )
        """)

        
        # Clean up any duplicate users in database, keeping the primary instance per display_name
        c.execute("""
            DELETE FROM users 
            WHERE id NOT IN (
                SELECT MIN(id) FROM users GROUP BY display_name
            )
        """)
        
        # Safe migration for reason column
        try:
            c.execute("ALTER TABLE adaptive_decisions ADD COLUMN reason TEXT")
        except Exception:
            pass
            
        conn.commit()

@app.on_event("startup")
def startup_event():
    init_db()

# --- MODELS ---

class UserCreate(BaseModel):
    display_name: str
    age: int
    preferred_language: str = "en"
    voice_enabled: bool = True

class SessionStart(BaseModel):
    user_id: int

class GameSessionStart(BaseModel):
    session_id: int
    user_id: int
    game_type: str
    difficulty: int

class GameSessionComplete(BaseModel):
    accuracy: float
    avg_response_time_ms: float
    repeat_errors: int
    corrections: int
    completion_time_ms: float
    total_events: int

class GameEventModel(BaseModel):
    game_session_id: int
    user_id: int
    event_type: str
    event_data: dict

class AdaptiveMetrics(BaseModel):
    accuracy: float
    mean_response_time_ms: float
    response_time_variance: float = 0.0
    repeat_error_rate: float
    correction_rate: float
    completion_time_ms: float
    current_difficulty: int
    previous_session_accuracy: Optional[float] = None
    recent_trend: Optional[float] = None

class AdaptiveRecommendRequest(BaseModel):
    user_id: int
    game_type: str
    current_metrics: AdaptiveMetrics

class FamiliarPersonCreate(BaseModel):
    user_id: int
    name: str
    relationship: str
    photo_url: str
    consent_confirmed: bool = True

class ExplainInsightRequest(BaseModel):
    domain: str
    status: str
    evidence: str

class ReminderModel(BaseModel):
    user_id: int
    type: str
    title: str
    time: str
    repeat_pattern: str
    enabled: bool

class TTSRequest(BaseModel):
    text: str
    language: str = "te-IN"

class CaregiverSignupRequest(BaseModel):
    full_name: str
    email: str
    password: str
    confirm_password: str

class CaregiverLoginRequest(BaseModel):
    email: str
    password: str

class ForgotPasswordRequest(BaseModel):
    email: str

class VerifyOTPRequest(BaseModel):
    email: str
    otp_code: str

class ResetPasswordRequest(BaseModel):
    email: str
    otp_code: str
    new_password: str
    confirm_password: str

# --- ENDPOINTS: CAREGIVER AUTHENTICATION ---

@app.post("/api/auth/signup")
def caregiver_signup(req: CaregiverSignupRequest):
    email = req.email.strip().lower()
    full_name = req.full_name.strip()
    
    if not validate_email_format(email):
        raise HTTPException(status_code=400, detail="Invalid email address format.")
    if len(req.password) < 4:
        raise HTTPException(status_code=400, detail="Password must be at least 4 characters long.")
    if req.password != req.confirm_password:
        raise HTTPException(status_code=400, detail="Password confirmation does not match.")

        
    with get_db() as conn:
        c = conn.cursor()
        c.execute("SELECT * FROM caregivers WHERE email = ?", (email,))
        existing = c.fetchone()
        hashed = hash_password(req.password)
        now_str = datetime.datetime.now().isoformat()

        if existing:
            caregiver_id = existing["id"]
            c.execute("UPDATE caregivers SET full_name = ?, password_hash = ? WHERE id = ?",
                      (full_name, hashed, caregiver_id))
            conn.commit()
            message = "Caregiver account updated and logged in successfully."
        else:
            c.execute("INSERT INTO caregivers (full_name, email, password_hash, created_at) VALUES (?, ?, ?, ?)",
                      (full_name, email, hashed, now_str))
            conn.commit()
            caregiver_id = c.lastrowid
            message = "Caregiver account created successfully."

    token = f"cg_token_{caregiver_id}_{secrets.token_hex(12)}"
    return {
        "status": "success",
        "message": message,
        "token": token,
        "user": {
            "id": caregiver_id,
            "full_name": full_name,
            "email": email
        }
    }


@app.post("/api/auth/login")
def caregiver_login(req: CaregiverLoginRequest):
    email = req.email.strip().lower()
    if not validate_email_format(email):
        raise HTTPException(status_code=400, detail="Invalid email address format.")
        
    with get_db() as conn:
        c = conn.cursor()
        c.execute("SELECT * FROM caregivers WHERE email = ?", (email,))
        row = c.fetchone()
        if not row or not verify_password(req.password, row["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid email or password.")
            
        caregiver_id = row["id"]
        full_name = row["full_name"]

    token = f"cg_token_{caregiver_id}_{secrets.token_hex(12)}"
    return {
        "status": "success",
        "message": "Logged in successfully.",
        "token": token,
        "user": {
            "id": caregiver_id,
            "full_name": full_name,
            "email": email
        }
    }

@app.post("/api/auth/forgot-password")
def caregiver_forgot_password(req: ForgotPasswordRequest):
    email = req.email.strip().lower()
    if not validate_email_format(email):
        raise HTTPException(status_code=400, detail="Invalid email address format.")
        
    otp_code = f"{random.randint(100000, 999999)}"
    expires_at = (datetime.datetime.now() + datetime.timedelta(minutes=10)).isoformat()
    now_str = datetime.datetime.now().isoformat()
    
    with get_db() as conn:
        c = conn.cursor()
        c.execute("INSERT INTO otp_tokens (email, otp_code, expires_at, used, created_at) VALUES (?, ?, ?, 0, ?)",
                  (email, otp_code, expires_at, now_str))
        conn.commit()

    return {
        "status": "success",
        "message": "If an account with this email exists, a 6-digit OTP code has been generated.",
        "demo_otp_code": otp_code
    }

@app.post("/api/auth/verify-otp")
def caregiver_verify_otp(req: VerifyOTPRequest):
    email = req.email.strip().lower()
    otp_code = req.otp_code.strip()
    
    with get_db() as conn:
        c = conn.cursor()
        c.execute("""
            SELECT * FROM otp_tokens 
            WHERE email = ? AND otp_code = ? AND used = 0 
            ORDER BY id DESC LIMIT 1
        """, (email, otp_code))
        row = c.fetchone()
        
        if not row:
            raise HTTPException(status_code=400, detail="Invalid OTP verification code.")
            
        expires_at = datetime.datetime.fromisoformat(row["expires_at"])
        if datetime.datetime.now() > expires_at:
            raise HTTPException(status_code=400, detail="OTP code has expired. Please request a new code.")

    return {"status": "success", "message": "OTP verified successfully."}

@app.post("/api/auth/reset-password")
def caregiver_reset_password(req: ResetPasswordRequest):
    email = req.email.strip().lower()
    otp_code = req.otp_code.strip()
    
    if len(req.new_password) < 4:
        raise HTTPException(status_code=400, detail="Password must be at least 4 characters long.")
    if req.new_password != req.confirm_password:
        raise HTTPException(status_code=400, detail="Password confirmation does not match.")

        
    with get_db() as conn:
        c = conn.cursor()
        c.execute("""
            SELECT * FROM otp_tokens 
            WHERE email = ? AND otp_code = ? AND used = 0 
            ORDER BY id DESC LIMIT 1
        """, (email, otp_code))
        row = c.fetchone()
        if not row:
            raise HTTPException(status_code=400, detail="Invalid or expired OTP code.")
            
        expires_at = datetime.datetime.fromisoformat(row["expires_at"])
        if datetime.datetime.now() > expires_at:
            raise HTTPException(status_code=400, detail="OTP code has expired.")

        c.execute("SELECT id FROM caregivers WHERE email = ?", (email,))
        caregiver = c.fetchone()
        if not caregiver:
            raise HTTPException(status_code=404, detail="Caregiver account not found.")

        new_hash = hash_password(req.new_password)
        c.execute("UPDATE caregivers SET password_hash = ? WHERE email = ?", (new_hash, email))
        c.execute("UPDATE otp_tokens SET used = 1 WHERE id = ?", (row["id"],))
        conn.commit()

    return {"status": "success", "message": "Password reset successfully. You can now log in with your new password."}

# --- ENDPOINTS: USERS (WITH DEDUPLICATION) ---


@app.get("/api/users")
def list_users():
    with get_db() as conn:
        c = conn.cursor()
        # Ensure each unique user appears exactly once
        c.execute("""
            SELECT id, display_name, age, preferred_language, voice_enabled, created_at 
            FROM users 
            WHERE id IN (SELECT MIN(id) FROM users GROUP BY display_name)
            ORDER BY id ASC
        """)
        return [dict(row) for row in c.fetchall()]

@app.post("/api/users")
def create_user(user: UserCreate):
    with get_db() as conn:
        c = conn.cursor()
        # Check if user already exists
        c.execute("SELECT id FROM users WHERE display_name = ?", (user.display_name.strip(),))
        existing = c.fetchone()
        if existing:
            return {"id": existing["id"]}
            
        c.execute(
            "INSERT INTO users (display_name, age, preferred_language, voice_enabled, created_at) VALUES (?, ?, ?, ?, ?)",
            (user.display_name.strip(), user.age, user.preferred_language, user.voice_enabled, datetime.datetime.now().isoformat())
        )
        conn.commit()
        return {"id": c.lastrowid}

@app.get("/api/users/{id}")
def get_user(id: int):
    with get_db() as conn:
        c = conn.cursor()
        c.execute("SELECT * FROM users WHERE id = ?", (id,))
        row = c.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="User not found")
        return dict(row)

@app.post("/api/users/demo")
def seed_demo_users():
    with get_db() as conn:
        c = conn.cursor()
        demo_profiles = [
            ("Rajesh Kumar", 72, "en", True),
            ("Sunita Devi", 68, "hi", True),
            ("Demo User", 70, "en", False)
        ]
        for name, age, lang, voice in demo_profiles:
            c.execute("SELECT id FROM users WHERE display_name = ?", (name,))
            if not c.fetchone():
                c.execute(
                    "INSERT INTO users (display_name, age, preferred_language, voice_enabled, created_at) VALUES (?, ?, ?, ?, ?)",
                    (name, age, lang, voice, datetime.datetime.now().isoformat())
                )
        conn.commit()
        return {"status": "seeded"}

# --- ENDPOINTS: SESSIONS ---

@app.post("/api/sessions/start")
def start_session(sess: SessionStart):
    with get_db() as conn:
        c = conn.cursor()
        c.execute("INSERT INTO sessions (user_id, started_at, status) VALUES (?, ?, ?)",
                  (sess.user_id, datetime.datetime.now().isoformat(), "active"))
        conn.commit()
        return {"id": c.lastrowid}

@app.post("/api/sessions/{id}/complete")
def complete_session(id: int):
    with get_db() as conn:
        c = conn.cursor()
        c.execute("UPDATE sessions SET completed_at = ?, status = ? WHERE id = ?",
                  (datetime.datetime.now().isoformat(), "completed", id))
        conn.commit()
        return {"status": "completed"}

@app.get("/api/sessions/user/{user_id}")
def list_user_sessions(user_id: int):
    with get_db() as conn:
        c = conn.cursor()
        c.execute("SELECT * FROM sessions WHERE user_id = ? ORDER BY started_at DESC", (user_id,))
        return [dict(row) for row in c.fetchall()]

@app.get("/api/sessions/{id}")
def get_session_details(id: int):
    with get_db() as conn:
        c = conn.cursor()
        c.execute("SELECT * FROM sessions WHERE id = ?", (id,))
        sess = c.fetchone()
        if not sess:
            raise HTTPException(status_code=404, detail="Session not found")
        
        c.execute("SELECT * FROM game_sessions WHERE session_id = ?", (id,))
        games = [dict(row) for row in c.fetchall()]
        
        return {"session": dict(sess), "game_sessions": games}

# --- ENDPOINTS: GAMES ---

@app.post("/api/games/event")
def record_game_event(evt: GameEventModel):
    with get_db() as conn:
        c = conn.cursor()
        c.execute("""
            INSERT INTO game_events (game_session_id, user_id, event_type, event_data_json, timestamp)
            VALUES (?, ?, ?, ?, ?)
        """, (evt.game_session_id, evt.user_id, evt.event_type, json.dumps(evt.event_data), datetime.datetime.now().isoformat()))
        conn.commit()
        return {"id": c.lastrowid}

@app.post("/api/games/session/start")
def start_game_session(req: GameSessionStart):
    with get_db() as conn:
        c = conn.cursor()
        c.execute("""
            INSERT INTO game_sessions (session_id, user_id, game_type, difficulty, started_at)
            VALUES (?, ?, ?, ?, ?)
        """, (req.session_id, req.user_id, req.game_type, req.difficulty, datetime.datetime.now().isoformat()))
        conn.commit()
        return {"id": c.lastrowid}

@app.post("/api/games/session/{id}/complete")
def complete_game_session(id: int, req: GameSessionComplete):
    with get_db() as conn:
        c = conn.cursor()
        c.execute("""
            UPDATE game_sessions 
            SET completed_at = ?, accuracy = ?, avg_response_time_ms = ?, repeat_errors = ?, corrections = ?, completion_time_ms = ?, total_events = ?
            WHERE id = ?
        """, (datetime.datetime.now().isoformat(), req.accuracy, req.avg_response_time_ms, req.repeat_errors, req.corrections, req.completion_time_ms, req.total_events, id))
        conn.commit()
        return {"status": "completed"}

@app.get("/api/games/sessions/user/{user_id}")
def get_user_game_sessions(user_id: int):
    with get_db() as conn:
        c = conn.cursor()
        c.execute("SELECT * FROM game_sessions WHERE user_id = ? ORDER BY completed_at ASC", (user_id,))
        return [dict(row) for row in c.fetchall()]

@app.get("/api/games/sessions/user/{user_id}/{game_type}")
def get_user_game_sessions_by_type(user_id: int, game_type: str):
    with get_db() as conn:
        c = conn.cursor()
        c.execute("SELECT * FROM game_sessions WHERE user_id = ? AND game_type = ? ORDER BY completed_at ASC", (user_id, game_type))
        return [dict(row) for row in c.fetchall()]

# --- ENDPOINTS: ADAPTIVE INTELLIGENCE ---

@app.post("/api/adaptive/recommend")
def recommend_difficulty(req: AdaptiveRecommendRequest):
    curr_metrics = req.current_metrics
    features = {
        'accuracy': curr_metrics.accuracy,
        'mean_response_time_ms': curr_metrics.mean_response_time_ms,
        'response_time_variance': curr_metrics.response_time_variance,
        'repeat_error_rate': curr_metrics.repeat_error_rate,
        'correction_rate': curr_metrics.correction_rate,
        'completion_time_ms': curr_metrics.completion_time_ms,
        'current_difficulty': curr_metrics.current_difficulty,
        'previous_session_accuracy': curr_metrics.previous_session_accuracy if curr_metrics.previous_session_accuracy is not None else curr_metrics.accuracy,
        'recent_trend': curr_metrics.recent_trend if curr_metrics.recent_trend is not None else 0.0
    }

    model_used = "fallback_rules"
    rec = "maintain"
    conf = 0.6
    feat_imp = {"mean_response_time_ms": 0.45, "accuracy": 0.35, "repeat_error_rate": 0.20}
    reason = "Performance within steady baseline range."

    if ML_AVAILABLE:
        try:
            ml_res = ml_predict_difficulty(features)
            rec = ml_res['recommendation'].lower()
            conf = ml_res['confidence']
            feat_imp = ml_res.get('feature_importance', feat_imp)
            model_used = ml_res.get('model_used', 'ml')
        except Exception:
            pass

    if model_used == "fallback_rules" or model_used == "fallback":
        if curr_metrics.accuracy >= 0.85 and curr_metrics.mean_response_time_ms < 3000 and curr_metrics.repeat_error_rate <= 0.15:
            rec = "increase"
            conf = 0.85
            reason = f"High accuracy ({int(curr_metrics.accuracy*100)}%) and prompt responses ({curr_metrics.mean_response_time_ms/1000:.1f}s) indicate mastery."
        elif curr_metrics.accuracy < 0.60 or curr_metrics.mean_response_time_ms > 5500 or curr_metrics.repeat_error_rate > 0.30:
            rec = "decrease"
            conf = 0.85
            reason = f"Lower accuracy ({int(curr_metrics.accuracy*100)}%) or increased latency indicates reduced difficulty will keep engagement positive."
        else:
            rec = "maintain"
            conf = 0.70
            reason = f"Steady accuracy ({int(curr_metrics.accuracy*100)}%) matches current level well."
    else:
        if rec == "increase":
            reason = f"ML model detected strong cognitive speed ({curr_metrics.mean_response_time_ms/1000:.1f}s) and high accuracy ({int(curr_metrics.accuracy*100)}%)."
        elif rec == "decrease":
            reason = f"ML model calibrated a gentler pace to preserve confidence and calm."
        else:
            reason = f"ML model evaluated current difficulty as optimal for continuous cognitive exercise."

    prev_diff = curr_metrics.current_difficulty
    if rec == "increase":
        new_diff = min(4, prev_diff + 1)
    elif rec == "decrease":
        new_diff = max(1, prev_diff - 1)
    else:
        new_diff = prev_diff

    with get_db() as conn:
        c = conn.cursor()
        c.execute("""
            INSERT INTO adaptive_decisions (user_id, game_type, previous_difficulty, recommended_difficulty, recommendation, reason, model_used, confidence, features_json, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (req.user_id, req.game_type, prev_diff, new_diff, rec, reason, model_used, conf, json.dumps(features), datetime.datetime.now().isoformat()))
        conn.commit()

    return {
        "recommendation": rec,
        "recommended_difficulty": new_diff,
        "previous_difficulty": prev_diff,
        "confidence": conf,
        "reason": reason,
        "model_used": model_used,
        "feature_importance": feat_imp
    }

@app.get("/api/adaptive/history/{user_id}")
def get_adaptive_history(user_id: int):
    with get_db() as conn:
        c = conn.cursor()
        c.execute("SELECT * FROM adaptive_decisions WHERE user_id = ? ORDER BY timestamp DESC LIMIT 20", (user_id,))
        return [dict(row) for row in c.fetchall()]

# --- ENDPOINTS: FAMILIAR PEOPLE (CAREGIVER MANAGED) ---

@app.get("/api/familiar-people/{user_id}")
def get_familiar_people(user_id: int):
    with get_db() as conn:
        c = conn.cursor()
        c.execute("SELECT * FROM familiar_people WHERE user_id = ? ORDER BY created_at ASC", (user_id,))
        return [dict(row) for row in c.fetchall()]

@app.post("/api/familiar-people")
def add_familiar_person(person: FamiliarPersonCreate):
    if not person.name or not person.relationship or not person.photo_url:
        raise HTTPException(status_code=400, detail="Name, relationship and photo are required.")
    with get_db() as conn:
        c = conn.cursor()
        c.execute("""
            INSERT INTO familiar_people (user_id, name, relationship, photo_url, consent_confirmed, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (person.user_id, person.name.strip(), person.relationship.strip(), person.photo_url, person.consent_confirmed, datetime.datetime.now().isoformat()))
        conn.commit()
        return {"id": c.lastrowid, "status": "created"}

@app.put("/api/familiar-people/{id}")
def update_familiar_person(id: int, person: FamiliarPersonCreate):
    with get_db() as conn:
        c = conn.cursor()
        c.execute("""
            UPDATE familiar_people
            SET name = ?, relationship = ?, photo_url = ?, consent_confirmed = ?
            WHERE id = ?
        """, (person.name.strip(), person.relationship.strip(), person.photo_url, person.consent_confirmed, id))
        conn.commit()
        return {"status": "updated"}

@app.delete("/api/familiar-people/{id}")
def delete_familiar_person(id: int):
    with get_db() as conn:
        c = conn.cursor()
        c.execute("DELETE FROM familiar_people WHERE id = ?", (id,))
        conn.commit()
        return {"status": "deleted"}

# --- ENDPOINTS: ANALYTICS & BASELINES ---

@app.get("/api/analytics/baseline/{user_id}/{game_type}")
def get_baseline(user_id: int, game_type: str):
    with get_db() as conn:
        c = conn.cursor()
        c.execute("""
            SELECT accuracy, avg_response_time_ms 
            FROM game_sessions 
            WHERE user_id = ? AND game_type = ? AND accuracy IS NOT NULL 
            ORDER BY completed_at DESC LIMIT 10
        """, (user_id, game_type))
        rows = c.fetchall()
        
    if len(rows) < 3:
        return {
            "sufficient_data": False,
            "baseline_accuracy": None,
            "baseline_response_time": None,
            "sessions_used": len(rows),
            "status": "insufficient_data"
        }
        
    accs = [r["accuracy"] for r in rows if r["accuracy"] is not None]
    rts = [r["avg_response_time_ms"] for r in rows if r["avg_response_time_ms"] is not None]
    
    return {
        "sufficient_data": True,
        "baseline_accuracy": sum(accs)/len(accs) if accs else 0,
        "baseline_response_time": sum(rts)/len(rts) if rts else 0,
        "sessions_used": len(rows),
        "status": "established"
    }

@app.get("/api/analytics/trends/{user_id}")
def get_trends(user_id: int):
    game_types = ["memory_match", "daily_routine", "object_recognition", "pattern_recall"]
    results = []
    
    for gt in game_types:
        baseline = get_baseline(user_id, gt)
        with get_db() as conn:
            c = conn.cursor()
            c.execute("""
                SELECT accuracy, avg_response_time_ms, difficulty, completed_at 
                FROM game_sessions 
                WHERE user_id = ? AND game_type = ? AND accuracy IS NOT NULL 
                ORDER BY completed_at DESC LIMIT 1
            """, (user_id, gt))
            current = c.fetchone()
            
        if not current or not baseline["sufficient_data"]:
            results.append({
                "game_type": gt,
                "trend": "insufficient_data",
                "sessions_observed": baseline.get("sessions_used", 0)
            })
            continue
            
        acc_diff = current["accuracy"] - baseline["baseline_accuracy"]
        rt_diff = current["avg_response_time_ms"] - baseline["baseline_response_time"]
        
        trend = "stable"
        if acc_diff > 0.08:
            trend = "improving"
        elif acc_diff < -0.12:
            trend = "recent_change"
        elif abs(acc_diff) > 0.05 and baseline["sessions_used"] >= 5:
            trend = "variable"
        
        results.append({
            "game_type": gt,
            "current_performance": current["accuracy"],
            "baseline": baseline["baseline_accuracy"],
            "deviation": acc_diff,
            "latency_deviation_ms": rt_diff,
            "current_difficulty": current["difficulty"] or 1,
            "trend": trend,
            "consistency": 0.85,
            "sessions_observed": baseline["sessions_used"]
        })
        
    return results

@app.get("/api/analytics/session-summary/{session_id}")
def get_session_summary(session_id: int):
    with get_db() as conn:
        c = conn.cursor()
        c.execute("SELECT * FROM game_sessions WHERE session_id = ?", (session_id,))
        rows = c.fetchall()
    return {"games_played": len(rows), "summary": [dict(r) for r in rows]}

@app.get("/api/analytics/cognitive-domains/{user_id}")
def get_cognitive_domains(user_id: int):
    trends = get_trends(user_id)
    mapping = {
        "memory_match": "short_term_memory",
        "daily_routine": "sequential_reasoning",
        "object_recognition": "visual_recognition",
        "pattern_recall": "pattern_recognition"
    }
    domains = []
    for t in trends:
        domains.append({
            "domain": mapping.get(t.get("game_type", ""), "unknown"),
            "analytics": t
        })
    return domains

# --- ENDPOINTS: EXPLAINABILITY (GEMINI AI + STRICT FALLBACK) ---

@app.post("/api/explain/insight")
async def explain_insight(req: ExplainInsightRequest):
    domain_display = req.domain.replace('_', ' ').title()
    fallback_msg = (
        f"Over recent sessions, {domain_display} activities show a {req.status.replace('_', ' ')} pattern ({req.evidence}). "
        f"This behavioral pattern reflects day-to-day engagement variance and is helpful for caregivers to track over time. "
        f"Prototype behavioral insight — not a medical diagnosis."
    )
    
    if not GEMINI_API_KEY:
        return {"explanation": fallback_msg}
        
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"
    system_prompt = (
        "You are an empathetic, clear, and reassuring caregiver communication assistant for MindMitra. "
        "Your role is to explain cognitive gaming observations to caregivers in gentle, accessible language. "
        "STRICT RULES: "
        "1. NEVER make medical claims, dementia diagnoses, Alzheimer's diagnoses, or cognitive decline certifications. "
        "2. NEVER invent numbers, symptoms, or events beyond the provided evidence. "
        "3. Frame observations around daily performance, comfort, and engagement variance against their personal baseline. "
        "4. Recommend consulting healthcare professionals if persistent behavioral concerns arise. "
        "5. Keep the explanation under 120 words. "
        "6. MUST always end with: 'Prototype behavioral insight — not a medical diagnosis.'"
    )
    
    payload = {
        "contents": [{
            "parts": [{"text": f"Cognitive Domain: {domain_display}\nObserved Status: {req.status}\nStructured Telemetry Evidence: {req.evidence}"}]
        }],
        "systemInstruction": {
            "parts": [{"text": system_prompt}]
        }
    }
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=payload, timeout=aiohttp.ClientTimeout(total=8)) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    text = data["candidates"][0]["content"]["parts"][0]["text"]
                    return {"explanation": text}
                else:
                    return {"explanation": fallback_msg}
    except Exception:
        return {"explanation": fallback_msg}

@app.get("/api/explain/insights/{user_id}")
async def get_all_insights(user_id: int):
    domains = get_cognitive_domains(user_id)
    insights = []
    for d in domains:
        if d["analytics"].get("trend") != "insufficient_data":
            req = ExplainInsightRequest(
                domain=d["domain"],
                status=d["analytics"].get("trend", "stable"),
                evidence=f"Current: {d['analytics'].get('current_performance', 0)*100:.0f}%, Baseline: {d['analytics'].get('baseline', 0)*100:.0f}%"
            )
            insight = await explain_insight(req)
            insights.append({"domain": d["domain"], "insight": insight["explanation"]})
    return insights

# --- ENDPOINTS: REMINDERS ---

@app.post("/api/tts")
async def generate_cloud_tts(req: TTSRequest):
    text = req.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Text is required")

    lang = req.language.lower()
    # Map requested language tag to Google TTS language code
    if "hi" in lang:
        tl = "hi"
    elif "te" in lang:
        tl = "te"
    elif "en" in lang:
        tl = "en"
    else:
        tl = "te"  # Default to Telugu for this app context

    # Rotate User-Agent strings to avoid rate limiting
    user_agents = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    ]

    encoded_text = urllib.parse.quote(text[:200])  # Google TTS max ~200 chars per request
    tts_url = f"https://translate.google.com/translate_tts?ie=UTF-8&tl={tl}&client=tw-ob&q={encoded_text}"

    last_error = None
    for attempt in range(3):  # Retry up to 3 times with different User-Agents
        try:
            ua = user_agents[attempt % len(user_agents)]
            headers = {
                "User-Agent": ua,
                "Accept": "audio/webm,audio/ogg,audio/wav,audio/*;q=0.9,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.5",
                "Referer": "https://translate.google.com/",
            }
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    tts_url, headers=headers, timeout=aiohttp.ClientTimeout(total=10)
                ) as resp:
                    if resp.status == 200:
                        audio_bytes = await resp.read()
                        if len(audio_bytes) > 100:  # Valid audio must be > 100 bytes
                            b64_audio = base64.b64encode(audio_bytes).decode("utf-8")
                            return {
                                "success": True,
                                "audio_base64": f"data:audio/mp3;base64,{b64_audio}",
                                "language": req.language,
                                "tl": tl,
                                "provider": "google_translate_tts",
                            }
                    last_error = f"HTTP {resp.status} on attempt {attempt + 1}"
        except Exception as e:
            last_error = str(e)
            if attempt < 2:
                import asyncio as _asyncio
                await _asyncio.sleep(0.5)  # Short wait before retry
            continue

    raise HTTPException(
        status_code=503,
        detail=f"Telugu/Hindi TTS temporarily unavailable after 3 attempts. Last error: {last_error}"
    )



@app.get("/api/reminders/{user_id}")
def list_reminders(user_id: int):
    with get_db() as conn:
        c = conn.cursor()
        c.execute("SELECT * FROM reminders WHERE user_id = ? ORDER BY created_at ASC", (user_id,))
        return [dict(row) for row in c.fetchall()]

@app.post("/api/reminders")
def create_reminder(rem: ReminderModel):
    with get_db() as conn:
        c = conn.cursor()
        c.execute("""
            INSERT INTO reminders (user_id, type, title, time, repeat_pattern, enabled, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (rem.user_id, rem.type, rem.title, rem.time, rem.repeat_pattern, rem.enabled, datetime.datetime.now().isoformat()))
        conn.commit()
        return {"id": c.lastrowid}

@app.put("/api/reminders/{id}")
def update_reminder(id: int, rem: ReminderModel):
    with get_db() as conn:
        c = conn.cursor()
        c.execute("""
            UPDATE reminders
            SET type = ?, title = ?, time = ?, repeat_pattern = ?, enabled = ?
            WHERE id = ?
        """, (rem.type, rem.title, rem.time, rem.repeat_pattern, rem.enabled, id))
        conn.commit()
        return {"status": "updated"}

@app.delete("/api/reminders/{id}")
def delete_reminder(id: int):
    with get_db() as conn:
        c = conn.cursor()
        c.execute("DELETE FROM reminders WHERE id = ?", (id,))
        conn.commit()
        return {"status": "deleted"}

# --- ENDPOINTS: SYNC ---

@app.get("/api/sync/status")
def sync_status():
    with get_db() as conn:
        c = conn.cursor()
        c.execute("SELECT COUNT(*) as count FROM sync_queue WHERE synced_at IS NULL")
        row = c.fetchone()
        return {"unsynced_items": row["count"]}

@app.post("/api/sync/simulate")
def sync_simulate():
    with get_db() as conn:
        c = conn.cursor()
        c.execute("UPDATE sync_queue SET synced_at = ? WHERE synced_at IS NULL", (datetime.datetime.now().isoformat(),))
        conn.commit()
        return {"status": "synced"}

# --- ENDPOINTS: DEMO SEED ---

@app.post("/api/demo/seed")
def full_demo_seed():
    seed_demo_users()
    with get_db() as conn:
        c = conn.cursor()
        
        # Clean up any duplicate users, keeping only distinct display_names
        c.execute("""
            DELETE FROM users 
            WHERE id NOT IN (
                SELECT MIN(id) FROM users GROUP BY display_name
            )
        """)
        
        c.execute("SELECT id, display_name FROM users ORDER BY id ASC")
        all_users = c.fetchall()
        
        user1_id = all_users[0]["id"] # Rajesh Kumar
        user2_id = all_users[1]["id"] # Sunita Devi
        
        game_types = ["memory_match", "daily_routine", "object_recognition", "pattern_recall"]
        
        # Clear old demo sessions & familiar people for a clean state
        c.execute("DELETE FROM sessions WHERE user_id IN (?, ?)", (user1_id, user2_id))
        c.execute("DELETE FROM game_sessions WHERE user_id IN (?, ?)", (user1_id, user2_id))
        c.execute("DELETE FROM adaptive_decisions WHERE user_id IN (?, ?)", (user1_id, user2_id))
        c.execute("DELETE FROM familiar_people WHERE user_id IN (?, ?)", (user1_id, user2_id))
        c.execute("DELETE FROM reminders WHERE user_id IN (?, ?)", (user1_id, user2_id))
        
        # Seed familiar people for Rajesh Kumar (4 people configured)
        sample_people_u1 = [
            ("Anita Kumar", "Daughter", "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop&crop=faces"),
            ("Ramesh Kumar", "Son", "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop&crop=faces"),
            ("Lakshmi Devi", "Wife", "https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=300&h=300&fit=crop&crop=faces"),
            ("Suresh Kumar", "Brother", "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=faces"),
        ]
        for name, rel, photo in sample_people_u1:
            c.execute("""
                INSERT INTO familiar_people (user_id, name, relationship, photo_url, consent_confirmed, created_at)
                VALUES (?, ?, ?, ?, 1, ?)
            """, (user1_id, name, rel, photo, datetime.datetime.now().isoformat()))

        # Seed familiar people for Sunita Devi (3 people configured)
        sample_people_u2 = [
            ("Pooja Devi", "Granddaughter", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=faces"),
            ("Vikram Devi", "Son", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=faces"),
            ("Aarav Devi", "Grandson", "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&h=300&fit=crop&crop=faces"),
        ]
        for name, rel, photo in sample_people_u2:
            c.execute("""
                INSERT INTO familiar_people (user_id, name, relationship, photo_url, consent_confirmed, created_at)
                VALUES (?, ?, ?, ?, 1, ?)
            """, (user2_id, name, rel, photo, datetime.datetime.now().isoformat()))

        # Seed sample reminders
        c.execute("""
            INSERT INTO reminders (user_id, type, title, time, repeat_pattern, enabled, created_at)
            VALUES (?, 'medication', 'Blood Pressure Medication (5mg)', '09:00 AM', 'Daily', 1, ?)
        """, (user1_id, datetime.datetime.now().isoformat()))
        c.execute("""
            INSERT INTO reminders (user_id, type, title, time, repeat_pattern, enabled, created_at)
            VALUES (?, 'hydration', 'Drink a Fresh Glass of Water', '11:00 AM', 'Every 2 Hours', 1, ?)
        """, (user1_id, datetime.datetime.now().isoformat()))
        c.execute("""
            INSERT INTO reminders (user_id, type, title, time, repeat_pattern, enabled, created_at)
            VALUES (?, 'activity', 'Evening Garden Walk', '05:30 PM', 'Daily', 1, ?)
        """, (user1_id, datetime.datetime.now().isoformat()))

        # Seed User 1 (Stable performance) - 12 historical sessions
        for i in range(12):
            sess_time = (datetime.datetime.now() - datetime.timedelta(days=(12 - i))).isoformat()
            c.execute("INSERT INTO sessions (user_id, started_at, completed_at, status) VALUES (?, ?, ?, ?)",
                      (user1_id, sess_time, sess_time, "completed"))
            sess_id = c.lastrowid
            
            diff = 1 if i < 3 else (2 if i < 7 else 3)
            
            for gt in game_types:
                acc = random.uniform(0.82, 0.94)
                rt = random.uniform(1700, 2400)
                errors = random.randint(0, 1)
                c.execute("""
                    INSERT INTO game_sessions (session_id, user_id, game_type, difficulty, started_at, completed_at, accuracy, avg_response_time_ms, total_events, repeat_errors, corrections, completion_time_ms)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (sess_id, user1_id, gt, diff, sess_time, sess_time, acc, rt, 10, errors, 1, 22000))
                
                c.execute("""
                    INSERT INTO adaptive_decisions (user_id, game_type, previous_difficulty, recommended_difficulty, recommendation, reason, model_used, confidence, features_json, timestamp)
                    VALUES (?, ?, ?, ?, 'maintain', 'Consistent high accuracy across recent activities.', 'ml', 0.88, '{}', ?)
                """, (user1_id, gt, diff, diff, sess_time))

        # Seed User 2 (Recent change performance) - 12 historical sessions
        for i in range(12):
            sess_time = (datetime.datetime.now() - datetime.timedelta(days=(12 - i))).isoformat()
            c.execute("INSERT INTO sessions (user_id, started_at, completed_at, status) VALUES (?, ?, ?, ?)",
                      (user2_id, sess_time, sess_time, "completed"))
            sess_id = c.lastrowid
            
            is_recent_change = (i >= 9)
            diff = 2 if not is_recent_change else 1
            
            for gt in game_types:
                if is_recent_change:
                    acc = random.uniform(0.48, 0.62)
                    rt = random.uniform(3800, 4900)
                    errors = random.randint(2, 4)
                    rec = "decrease"
                    reason = f"Response latency increased and accuracy declined to {int(acc*100)}%. Difficulty adjusted to maintain supportive experience."
                else:
                    acc = random.uniform(0.78, 0.88)
                    rt = random.uniform(2100, 2800)
                    errors = random.randint(0, 1)
                    rec = "maintain"
                    reason = "Performance consistent with baseline."

                c.execute("""
                    INSERT INTO game_sessions (session_id, user_id, game_type, difficulty, started_at, completed_at, accuracy, avg_response_time_ms, total_events, repeat_errors, corrections, completion_time_ms)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (sess_id, user2_id, gt, diff, sess_time, sess_time, acc, rt, 10, errors, 2, 36000))

                c.execute("""
                    INSERT INTO adaptive_decisions (user_id, game_type, previous_difficulty, recommended_difficulty, recommendation, reason, model_used, confidence, features_json, timestamp)
                    VALUES (?, ?, ?, ?, ?, ?, 'ml', 0.82, '{}', ?)
                """, (user2_id, gt, diff, max(1, diff - 1) if rec == "decrease" else diff, rec, reason, sess_time))
        
        conn.commit()
    return {"status": "seeded_full_demo", "users_seeded": ["Rajesh Kumar (Stable)", "Sunita Devi (Recent Change)"]}
