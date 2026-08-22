"""
annealing.py — Quantum Annealing (QUBO) inspired scheduling demo.

IMPORTANT DISCLAIMER:
  This module uses D-Wave's `dimod` library with a pure CLASSICAL Simulated
  Annealing sampler to solve a QUBO problem. It does NOT connect to a real
  D-Wave quantum annealer. Real quantum annealing requires expensive D-Wave
  cloud hardware access; this simulation runs on a conventional CPU.

  The QUBO formulation here is mathematically equivalent to what would be
  submitted to a D-Wave machine — but the solving is done classically.
  Included as a quantum-inspired research demonstration for MindMitra's
  hackathon submission — NOT part of the production adaptive engine.
"""

import itertools
from typing import Dict, Any, Optional

import dimod

# ---------------------------------------------------------------------------
# QUBO Problem Formulation
# ---------------------------------------------------------------------------
# Decision variables (binary):
#   x_{g,l} = 1 means game g is assigned difficulty level l
#
# For simplicity we encode each of 4 games as 2 binary vars that select
# from 4 difficulty levels (1-4), using a one-hot constraint.
#
# Cost function:
#   Minimize:
#     α · Σ_g engagement_loss(g, l)     (avoid boredom — too easy)
#   + β · Σ_g frustration_cost(g, l)    (avoid frustration — too hard)
#   + γ · Σ_g one_hot_penalty(g)        (exactly one level per game)
#
# Where both α and β are tunable, reflecting the caregiver's preference
# between keeping the user engaged vs. keeping them comfortable.
# ---------------------------------------------------------------------------

GAMES = ["memory_match", "daily_routine", "object_recognition", "pattern_recall"]
LEVELS = [1, 2, 3, 4]

# Engagement score: higher level → more engaging (normalized)
ENGAGEMENT = {1: 0.40, 2: 0.65, 3: 0.85, 4: 0.95}

# Frustration score: higher level → more frustrating (normalized)
FRUSTRATION = {1: 0.05, 2: 0.20, 3: 0.55, 4: 0.90}


def _var(game: str, level: int) -> str:
    """Variable name for binary decision variable x_{game}_{level}."""
    return f"{game}_lvl{level}"


def build_qubo(
    alpha: float = 0.6,
    beta:  float = 0.4,
    gamma: float = 5.0,
    current_levels: Optional[Dict[str, int]] = None,
    bias_toward_current: float = 0.1,
) -> Dict[tuple, float]:
    """
    Build the QUBO coefficient dictionary for the 4-game scheduling problem.

    Parameters
    ----------
    alpha         : weight for engagement cost (want to maximize → minimize loss)
    beta          : weight for frustration cost (want to minimize)
    gamma         : penalty weight for one-hot constraint violation
    current_levels: optional {game: current_level} to bias near-current solutions
    bias_toward_current: small negative bias rewarding staying near current level

    Returns
    -------
    Q : dict of {(var_i, var_j): coefficient} in QUBO form
    """
    Q: Dict[tuple, float] = {}

    def add_Q(v1: str, v2: str, val: float):
        key = (v1, v2) if v1 <= v2 else (v2, v1)
        Q[key] = Q.get(key, 0.0) + val

    for game in GAMES:
        vars_for_game = [_var(game, lvl) for lvl in LEVELS]

        for lvl in LEVELS:
            v = _var(game, lvl)

            # Engagement loss: we WANT high engagement, so cost = α · (1 - engagement)
            engagement_loss = alpha * (1.0 - ENGAGEMENT[lvl])

            # Frustration cost: we WANT low frustration, so cost = β · frustration
            frustration_cost = beta * FRUSTRATION[lvl]

            # One-hot diagonal: -gamma per variable (encourages selection)
            one_hot_diag = -gamma

            # Optional: small negative bias to penalize large jumps from current level
            if current_levels and game in current_levels:
                dist = abs(lvl - current_levels[game])
                jump_cost = bias_toward_current * dist
            else:
                jump_cost = 0.0

            add_Q(v, v, engagement_loss + frustration_cost + one_hot_diag + jump_cost)

        # One-hot cross terms: +2γ for every pair within the same game
        # (penalizes choosing more than one level)
        for v1, v2 in itertools.combinations(vars_for_game, 2):
            add_Q(v1, v2, 2.0 * gamma)

    return Q


def run_qubo_annealing(
    alpha:  float = 0.6,
    beta:   float = 0.4,
    gamma:  float = 5.0,
    current_levels: Optional[Dict[str, int]] = None,
    num_reads: int = 200,
) -> Dict[str, Any]:
    """
    Solve the difficulty-scheduling QUBO via Simulated Annealing (classical).

    Parameters
    ----------
    alpha          : engagement weight
    beta           : frustration weight
    gamma          : one-hot constraint penalty
    current_levels : optional {game: current_level} to bias solution
    num_reads      : number of annealing restarts for robust sampling

    Returns
    -------
    dict with optimized levels, energy, and disclaimer.
    """
    Q = build_qubo(alpha, beta, gamma, current_levels)

    bqm = dimod.BinaryQuadraticModel.from_qubo(Q)

    # Simulated Annealing sampler (classical CPU — no quantum hardware)
    sampler    = dimod.SimulatedAnnealingSampler()
    sampleset  = sampler.sample(bqm, num_reads=num_reads, num_sweeps=1000)
    best_sample = sampleset.first.sample
    best_energy = sampleset.first.energy

    # Decode: find which level is selected for each game
    recommended: Dict[str, int] = {}
    for game in GAMES:
        selected_levels = [lvl for lvl in LEVELS if best_sample.get(_var(game, lvl), 0) == 1]
        if selected_levels:
            recommended[game] = selected_levels[0]
        else:
            # Fallback: pick level with minimum cost if one-hot fails
            min_lvl = min(
                LEVELS,
                key=lambda l: alpha * (1.0 - ENGAGEMENT[l]) + beta * FRUSTRATION[l],
            )
            recommended[game] = min_lvl

    # Compute per-game metrics for transparency
    per_game_analysis = {}
    for game, lvl in recommended.items():
        per_game_analysis[game] = {
            "recommended_level":   lvl,
            "engagement_score":    ENGAGEMENT[lvl],
            "frustration_score":   FRUSTRATION[lvl],
            "net_cost_estimate":   round(
                alpha * (1.0 - ENGAGEMENT[lvl]) + beta * FRUSTRATION[lvl], 4
            ),
        }

    return {
        "algorithm": "Quantum Annealing (QUBO) — Classical SA Simulation",
        "result": {
            "recommended_difficulty_levels": recommended,
            "qubo_energy":                  round(best_energy, 4),
            "num_annealing_reads":           num_reads,
            "optimization_weights": {
                "alpha_engagement":  alpha,
                "beta_frustration":  beta,
                "gamma_one_hot":     gamma,
            },
            "per_game_analysis": per_game_analysis,
        },
        "qubo_details": {
            "num_variables":   len(set(v for pair in Q for v in pair)),
            "num_couplers":    sum(1 for (v1, v2) in Q if v1 != v2),
            "problem_size":    f"{len(GAMES)} games × {len(LEVELS)} levels = {len(GAMES)*len(LEVELS)} binary variables",
            "formulation":     (
                "Minimize: α·Σ(1-engagement) + β·frustration + γ·one_hot_penalty. "
                "Competing cost terms balance user engagement with frustration prevention."
            ),
        },
        "quantum_advantage_honest_assessment": (
            "CLASSICAL SIMULATION via dimod SimulatedAnnealingSampler. "
            "Real D-Wave quantum annealers exploit quantum tunneling to "
            "escape local optima — a property unavailable on classical hardware. "
            "This simulation uses classical simulated annealing, which is "
            "mathematically equivalent in formulation but not in execution. "
            "No quantum speedup is achieved here. Included to demonstrate "
            "how a quantum-annealing approach to multi-game scheduling WOULD "
            "be formulated if real quantum annealing hardware were available."
        ),
        "disclaimer": (
            "This endpoint is part of the MindMitra Quantum Research Module "
            "(experimental). It does NOT influence the production adaptive "
            "difficulty engine (RandomForest + fallback rules in main.py). "
            "Classical pipeline results are always authoritative."
        ),
    }
