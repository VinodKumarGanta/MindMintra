"""
grover.py — Grover's Algorithm demonstration for difficulty-level search.

IMPORTANT DISCLAIMER:
  This code runs entirely on a CLASSICAL computer via Qiskit's Aer AerSimulator
  (statevector simulation). It correctly demonstrates Grover's algorithm but
  provides NO quantum speedup because there is no physical quantum hardware
  involved. The quadratic speedup O(√N) that Grover's algorithm provides
  over classical O(N) search is only achievable on real quantum hardware.

  Included purely as a quantum-computing research demonstration for the
  MindMitra hackathon project — NOT part of the production adaptive engine.
"""

import math
from typing import List, Dict, Any, Optional

from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister
from qiskit_aer import AerSimulator


# ---------------------------------------------------------------------------
# Oracle Construction
# ---------------------------------------------------------------------------

def _build_grover_oracle(n_qubits: int, target_state: int) -> QuantumCircuit:
    """
    Build a phase-kickback oracle that marks `target_state` by flipping
    the phase of that particular basis state.

    For a search space of 2^n_qubits items, this oracle applies -1 phase
    to the state |target_state⟩ and leaves all others unchanged.
    """
    qr = QuantumRegister(n_qubits, name='q')
    qc = QuantumCircuit(qr)

    # Flip qubits that are 0 in the target binary string
    # (so the all-|1⟩ multi-controlled Z hits exactly |target_state⟩)
    target_bits = format(target_state, f'0{n_qubits}b')
    for i, bit in enumerate(reversed(target_bits)):
        if bit == '0':
            qc.x(qr[i])

    # Multi-controlled Z gate  (phase flip on |11...1⟩)
    if n_qubits == 1:
        qc.z(qr[0])
    elif n_qubits == 2:
        qc.cz(qr[0], qr[1])
    else:
        # Decompose as H + MCX + H on last qubit
        qc.h(qr[-1])
        qc.mcx(list(range(n_qubits - 1)), qr[-1])
        qc.h(qr[-1])

    # Undo the bit flips
    for i, bit in enumerate(reversed(target_bits)):
        if bit == '0':
            qc.x(qr[i])

    return qc


def _build_diffuser(n_qubits: int) -> QuantumCircuit:
    """
    Grover diffuser (inversion-about-average operator):
      H^⊗n · (2|0⟩⟨0| - I) · H^⊗n
    """
    qr = QuantumRegister(n_qubits, name='q')
    qc = QuantumCircuit(qr)

    qc.h(qr)
    qc.x(qr)

    if n_qubits == 1:
        qc.z(qr[0])
    elif n_qubits == 2:
        qc.cz(qr[0], qr[1])
    else:
        qc.h(qr[-1])
        qc.mcx(list(range(n_qubits - 1)), qr[-1])
        qc.h(qr[-1])

    qc.x(qr)
    qc.h(qr)

    return qc


# ---------------------------------------------------------------------------
# Main Grover Search
# ---------------------------------------------------------------------------

def run_grover_difficulty_search(
    difficulty_levels: List[int],
    target_accuracy: float,
    user_accuracy_map: Optional[Dict[int, float]] = None,
) -> Dict[str, Any]:
    """
    Demonstrate Grover's algorithm to find the difficulty level in
    `difficulty_levels` whose predicted accuracy is closest to `target_accuracy`.

    Parameters
    ----------
    difficulty_levels : list of ints, e.g. [1, 2, 3, 4]
    target_accuracy   : float in [0, 1], e.g. 0.75 means "find level closest to 75% accuracy"
    user_accuracy_map : optional dict {level: predicted_accuracy}.
                        If None, uses a hardcoded demo mapping.

    Returns
    -------
    dict with Grover result, classical verification, and disclaimer.
    """

    # -----------------------------------------------------------------------
    # Step 1: Determine oracle target via classical pre-computation
    # (Grover's requires classical preprocessing to identify the target index)
    # -----------------------------------------------------------------------
    if user_accuracy_map is None:
        # Demo mapping: predicted accuracy per difficulty level
        user_accuracy_map = {1: 0.90, 2: 0.78, 3: 0.65, 4: 0.50}

    # Find which level has accuracy closest to target
    best_level = min(
        difficulty_levels,
        key=lambda lvl: abs(user_accuracy_map.get(lvl, 1.0) - target_accuracy),
    )
    predicted_accuracy = user_accuracy_map.get(best_level, 0.0)

    # Map best_level to its index in difficulty_levels (Grover works on indices)
    target_index = difficulty_levels.index(best_level)

    # -----------------------------------------------------------------------
    # Step 2: Determine qubit count — must cover entire search space
    # -----------------------------------------------------------------------
    n_items = len(difficulty_levels)
    n_qubits = math.ceil(math.log2(n_items)) if n_items > 1 else 1
    n_qubits = max(n_qubits, 1)  # at least 1 qubit

    # Optimal Grover iterations: π/4 · √N
    n_iterations = max(1, round((math.pi / 4) * math.sqrt(2 ** n_qubits)))

    # -----------------------------------------------------------------------
    # Step 3: Build and run Grover's circuit on Aer simulator
    # -----------------------------------------------------------------------
    qr = QuantumRegister(n_qubits, name='q')
    cr = ClassicalRegister(n_qubits, name='c')
    circuit = QuantumCircuit(qr, cr)

    # Initialize superposition
    circuit.h(qr)

    oracle   = _build_grover_oracle(n_qubits, target_index)
    diffuser = _build_diffuser(n_qubits)

    for _ in range(n_iterations):
        circuit.compose(oracle,   inplace=True)
        circuit.compose(diffuser, inplace=True)

    circuit.measure(qr, cr)

    # Simulate on classical hardware via Aer
    simulator = AerSimulator()
    job = simulator.run(circuit, shots=1024)
    result = job.result()
    counts = result.get_counts()

    # Most probable outcome (should be target_index with high probability)
    measured_binary = max(counts, key=counts.get)
    measured_index  = int(measured_binary, 2)
    # Clamp to valid range in case we have states beyond our list
    measured_index  = min(measured_index, n_items - 1)
    measured_level  = difficulty_levels[measured_index]
    probability     = counts.get(measured_binary, 0) / 1024

    return {
        "algorithm":  "Grover's Search",
        "result": {
            "recommended_difficulty_level": measured_level,
            "target_accuracy_sought":       round(target_accuracy, 3),
            "predicted_accuracy_at_level":  round(user_accuracy_map.get(measured_level, 0.0), 3),
            "grover_probability":           round(probability, 3),
            "grover_iterations":            n_iterations,
            "qubits_used":                  n_qubits,
            "search_space_size":            n_items,
            "shot_counts":                  counts,
        },
        "classical_verification": {
            "classical_best_level":    best_level,
            "classical_best_accuracy": round(predicted_accuracy, 3),
            "match":                   (measured_level == best_level),
        },
        "quantum_advantage_honest_assessment": (
            "SIMULATED ON CLASSICAL HARDWARE via Qiskit Aer AerSimulator. "
            "This correctly demonstrates Grover's algorithm, which achieves "
            "O(√N) quantum speedup over classical O(N) search — but ONLY on "
            "physical quantum hardware. Running on a classical simulator "
            "provides NO actual speedup. Included as an educational "
            "quantum-computing demonstration, not a production optimization."
        ),
        "disclaimer": (
            "This endpoint is part of the MindMitra Quantum Research Module "
            "(experimental). It does NOT influence the production adaptive "
            "difficulty engine (RandomForest + fallback rules in main.py). "
            "Classical pipeline results are always authoritative."
        ),
    }
