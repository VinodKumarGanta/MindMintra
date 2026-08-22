# MindMitra
## AI-Powered Cognitive Gaming & Memory Assistance Platform for Elderly Users

> **"Your AI-powered cognitive companion."**

MindMitra observes HOW an elderly user interacts with cognitive games, learns their individual behavioral patterns, dynamically adapts difficulty, tracks longitudinal changes against the user's own baseline, and converts structured observations into understandable caregiver-facing explanations.

> ⚠️ **Disclaimer**: MindMitra is a prototype for AI-assisted cognitive engagement and caregiver support — NOT a medical diagnostic system. All insights are behavioral observations, not medical diagnoses.

---

## Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+
- npm or yarn

### 1. Backend Setup
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
uvicorn main:app --reload --port 8000
```

### 2. ML Pipeline
```bash
cd ml
python synthetic_data.py --samples 5000
python train.py
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Open the App
Navigate to http://localhost:3000

---

## Architecture

```
┌─────────────────┐     ┌──────────────┐     ┌──────────────┐
│   React + Vite  │────▶│   FastAPI     │────▶│   SQLite     │
│   TypeScript    │     │   Python      │     │   Local DB   │
│   Tailwind CSS  │     │              │     └──────────────┘
│   Recharts      │     │   Gemini API  │
└─────────────────┘     │   ML Model   │
                        └──────────────┘
```

### Frontend
- React 18 + TypeScript + Vite
- Tailwind CSS for styling
- Framer Motion for animations
- Recharts for analytics
- Offline-first with IndexedDB/localStorage

### Backend
- Python FastAPI + SQLite
- RESTful API endpoints
- Gemini API integration (with template fallback)

### ML Pipeline
- scikit-learn RandomForestClassifier
- Synthetic gameplay data (5000+ samples)
- 90% accuracy on prototype evaluation
- Deterministic fallback rules

---

## Features

### P0 — Core
1. ✅ Elderly-friendly UI (large buttons, high contrast, calm design)
2. ✅ Three cognitive games (Memory Match, Daily Routine, Object Recognition)
3. ✅ Gameplay telemetry capture
4. ✅ Adaptive difficulty engine (ML + fallback)
5. ✅ Personal baseline tracking
6. ✅ Longitudinal trends
7. ✅ Caregiver dashboard
8. ✅ Explainable insights
9. ✅ Gemini explanation layer
10. ✅ Offline-first persistence

### P1 — Important
11. ✅ Voice interaction (Web Speech API)
12. ✅ English + Hindi
13. ✅ Reminders (medication, hydration, appointments)
14. ✅ Demo mode
15. ✅ Polished charts & UX

---

## Quantum Research Module (Experimental)

> ⚠️ **Fully isolated from the production adaptive engine.** These endpoints demonstrate quantum algorithm concepts alongside MindMitra as exploratory research — they do NOT modify, replace, or influence the RandomForest adaptive difficulty pipeline or any analytics baseline logic.

### What This Module Demonstrates

MindMitra includes a self-contained **Quantum Research Module** (`backend/quantum/`) that implements two canonical quantum algorithms using open-source simulators:

#### 1. Grover's Algorithm — Difficulty Level Search
**Endpoint:** `GET /quantum/grover-difficulty-search?target_accuracy=0.75`

Demonstrates Grover's unstructured search algorithm to find the difficulty level (from 1–4) whose predicted user accuracy is closest to a given target. The algorithm constructs:
- A **Phase-Kickback Oracle** that marks the target state
- A **Grover Diffuser** (inversion-about-average operator)
- Runs `⌈π/4 · √N⌉` oracle-diffuser iterations on 2 qubits

**Honest Limitation:** The circuit runs on Qiskit's **AerSimulator** (classical statevector simulation). Grover's O(√N) speedup over classical O(N) is only achievable on *physical quantum hardware*. On a classical simulator, it is strictly slower than a direct lookup.

#### 2. QUBO Annealing — Multi-Game Schedule Optimizer
**Endpoint:** `GET /quantum/annealing-schedule-optimizer?alpha=0.6&beta=0.4`

Formulates a **Quadratic Unconstrained Binary Optimization (QUBO)** problem:
- 4 games × 4 difficulty levels = **16 binary decision variables**
- Competing cost terms: `α · (1 − engagement) + β · frustration + γ · one_hot_penalty`
- Solved by **dimod's SimulatedAnnealingSampler** (classical CPU)

The QUBO formulation is mathematically equivalent to what would be submitted to a **D-Wave quantum annealer** — demonstrating how real quantum annealing hardware would approach combinatorial cognitive-scheduling optimization.

**Honest Limitation:** Uses classical simulated annealing, not a D-Wave machine. Real quantum annealing exploits quantum tunneling to escape local optima — a property unavailable in classical simulation.

### Running the Quantum Module

No additional setup needed. The module starts automatically with the backend:
```bash
cd backend
uvicorn main:app --reload --port 8000
# Then visit: http://localhost:8000/quantum/info
```

| Endpoint | Description |
|---|---|
| `GET /quantum/info` | Module overview, disclaimers, limitations |
| `GET /quantum/grover-difficulty-search` | Grover's algorithm demo |
| `GET /quantum/annealing-schedule-optimizer` | QUBO annealing demo |
| Full docs | `http://localhost:8000/docs#/Quantum Research Module (Experimental)` |

### Dependencies
```
qiskit          # Quantum circuit construction
qiskit-aer      # AerSimulator classical backend
dimod           # QUBO/BQM formulation & SimulatedAnnealingSampler
```

---


## Datasets

### Primary: MindMitra Gameplay Dataset
- Synthetic gameplay data for adaptive difficulty model training
- Generated via `ml/synthetic_data.py`
- NOT a clinical dataset

### Reference Datasets (if present)
1. Alzheimer's Disease Dataset (~2,149 records)
2. Dementia Dataset (~373 records)
3. Cognitive Impairment Dataset (~1,200+ records)

> These datasets are used for research/reference only and are NOT used to claim clinical diagnosis or validation.

---

## Demo Mode

Navigate to `/demo` to run the complete demonstration scenario:
1. Seed demo data with historical sessions
2. View stable and changing performance patterns
3. Play cognitive games with adaptive difficulty
4. View caregiver dashboard with trends
5. See AI-generated explanations
6. Test offline/sync functionality

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | Google Gemini API key for caregiver explanations |

---

## Ethical & Medical Disclaimer

MindMitra is a **prototype** for AI-assisted cognitive engagement and caregiver support. It is NOT a medical diagnostic system.

- ❌ Does NOT diagnose dementia, Alzheimer's, or any medical condition
- ❌ Does NOT provide clinically validated cognitive decline detection
- ❌ Does NOT offer medical risk predictions
- ✅ Provides cognitive engagement activities
- ✅ Tracks behavioral performance against personal baselines
- ✅ Offers caregiver-friendly explanations of observed changes
- ✅ Recommends consulting healthcare professionals for persistent concerns

---

## License
Hackathon prototype — not for clinical use.
