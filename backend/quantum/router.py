"""
router.py — FastAPI router for the MindMitra Quantum Research Module.

All endpoints are prefixed /quantum/ and are clearly labeled as experimental.
They are isolated from the production adaptive engine in main.py.

DISCLAIMER: All quantum computations here are SIMULATED ON CLASSICAL HARDWARE.
No actual quantum hardware is used. This module exists to demonstrate quantum
algorithm concepts as exploratory research alongside the MindMitra platform.
"""

from fastapi import APIRouter, Query
from typing import Optional
from pydantic import BaseModel, Field

from quantum.grover import run_grover_difficulty_search
from quantum.annealing import run_qubo_annealing

router = APIRouter(
    prefix="/quantum",
    tags=["Quantum Research Module (Experimental)"],
)


# ---------------------------------------------------------------------------
# Endpoint 1 — Grover's Algorithm: Difficulty Level Search
# ---------------------------------------------------------------------------

@router.get(
    "/grover-difficulty-search",
    summary="Grover's Unstructured Search — Find optimal difficulty level",
    description=(
        "Demonstrates Grover's quantum search algorithm to identify the "
        "difficulty level (from 1–4) whose predicted user accuracy is closest "
        "to a specified target accuracy. "
        "**IMPORTANT**: Simulated on classical hardware via Qiskit AerSimulator. "
        "No real quantum speedup is achieved."
    ),
)
def grover_difficulty_search(
    target_accuracy: float = Query(
        default=0.75,
        ge=0.0,
        le=1.0,
        description="Target predicted accuracy (0.0–1.0). Grover searches for the level closest to this.",
    ),
    memory_match_accuracy: Optional[float] = Query(default=None, description="Override predicted accuracy for memory_match at level 2"),
    daily_routine_accuracy: Optional[float] = Query(default=None, description="Override predicted accuracy for daily_routine at level 3"),
):
    """
    Grover's Search endpoint.

    Given difficulty levels [1, 2, 3, 4] and a target predicted accuracy,
    uses Grover's algorithm to identify the correct level with O(√N) oracle
    queries — demonstrated on a Qiskit Aer simulator.

    The oracle is constructed classically (Grover's requires knowing the target
    in advance for demo purposes), then the full quantum circuit is simulated.
    """
    # Build optional user accuracy map from query overrides
    user_accuracy_map = {1: 0.90, 2: 0.78, 3: 0.65, 4: 0.50}
    if memory_match_accuracy is not None:
        user_accuracy_map[2] = memory_match_accuracy
    if daily_routine_accuracy is not None:
        user_accuracy_map[3] = daily_routine_accuracy

    result = run_grover_difficulty_search(
        difficulty_levels=[1, 2, 3, 4],
        target_accuracy=target_accuracy,
        user_accuracy_map=user_accuracy_map,
    )

    return {
        "module": "MindMitra Quantum Research (Experimental)",
        "endpoint": "grover-difficulty-search",
        **result,
    }


# ---------------------------------------------------------------------------
# Endpoint 2 — Quantum Annealing: Multi-Game Schedule Optimizer
# ---------------------------------------------------------------------------

class AnnealingRequest(BaseModel):
    alpha: float = Field(default=0.6, ge=0.0, le=1.0, description="Weight for engagement optimization (0–1)")
    beta:  float = Field(default=0.4, ge=0.0, le=1.0, description="Weight for frustration minimization (0–1)")
    current_levels: Optional[dict] = Field(
        default=None,
        description="Optional current difficulty per game, e.g. {\"memory_match\": 2, \"daily_routine\": 1}",
    )


@router.get(
    "/annealing-schedule-optimizer",
    summary="QUBO Annealing — Optimize difficulty across all 4 cognitive games",
    description=(
        "Formulates a QUBO optimization problem that balances user engagement "
        "vs. frustration across the 4 cognitivegames simultaneously, then "
        "solves it with a classical simulated annealer (dimod). "
        "**IMPORTANT**: Simulated on classical hardware. No D-Wave or real "
        "quantum annealer is used."
    ),
)
def annealing_schedule_optimizer(
    alpha: float = Query(default=0.6, ge=0.0, le=1.0, description="Weight for engagement (0=ignore engagement, 1=fully optimize engagement)"),
    beta:  float = Query(default=0.4, ge=0.0, le=1.0, description="Weight for frustration (0=ignore frustration, 1=fully minimize frustration)"),
    memory_match_current: Optional[int]       = Query(default=None, ge=1, le=4),
    daily_routine_current: Optional[int]      = Query(default=None, ge=1, le=4),
    object_recognition_current: Optional[int] = Query(default=None, ge=1, le=4),
    pattern_recall_current: Optional[int]     = Query(default=None, ge=1, le=4),
):
    """
    QUBO Annealing endpoint.

    Formulates the difficulty scheduling as:
      Minimize: α·Σ(1 - engagement) + β·frustration + γ·one_hot_penalty

    The QUBO is solved via classical Simulated Annealing (not actual quantum
    annealing hardware). This demonstrates how a D-Wave quantum annealer
    WOULD be used to solve this kind of combinatorial optimization.
    """
    current_levels = {}
    if memory_match_current is not None:
        current_levels["memory_match"]       = memory_match_current
    if daily_routine_current is not None:
        current_levels["daily_routine"]      = daily_routine_current
    if object_recognition_current is not None:
        current_levels["object_recognition"] = object_recognition_current
    if pattern_recall_current is not None:
        current_levels["pattern_recall"]     = pattern_recall_current

    result = run_qubo_annealing(
        alpha=alpha,
        beta=beta,
        current_levels=current_levels if current_levels else None,
    )

    return {
        "module": "MindMitra Quantum Research (Experimental)",
        "endpoint": "annealing-schedule-optimizer",
        **result,
    }


# ---------------------------------------------------------------------------
# Info endpoint
# ---------------------------------------------------------------------------

@router.get("/info", summary="Quantum module info and disclaimer")
def quantum_info():
    """
    Returns information about the Quantum Research Module, its scope,
    and an honest assessment of what it demonstrates.
    """
    return {
        "module": "MindMitra Quantum Research Module (Experimental)",
        "status": "Active — runs alongside production system as isolated demo",
        "endpoints": {
            "/quantum/grover-difficulty-search":     "Grover's algorithm for difficulty-level search",
            "/quantum/annealing-schedule-optimizer": "QUBO-based multi-game schedule optimization",
        },
        "honest_limitations": [
            "All algorithms run on classical hardware (Qiskit Aer + dimod SA)",
            "No real quantum speedup is achieved in any endpoint",
            "Qiskit Aer is a statevector simulator — exponential memory on large circuits",
            "Practical Grover advantage requires ~10^6+ item search spaces on real hardware",
            "This module does NOT modify or replace the RandomForest adaptive engine",
        ],
        "research_value": [
            "Correct quantum circuit construction (Oracle + Diffuser) for Grover's",
            "Correct QUBO formulation for combinatorial scheduling optimization",
            "Demonstrates how these algorithms would translate to real hardware",
            "Educational bridge between classical ML and quantum-computing approaches",
        ],
        "dependencies": {
            "qiskit": "Circuit construction and classical simulation",
            "qiskit-aer": "AerSimulator statevector backend",
            "dimod": "QUBO/BQM formulation and SimulatedAnnealingSampler",
        },
    }
