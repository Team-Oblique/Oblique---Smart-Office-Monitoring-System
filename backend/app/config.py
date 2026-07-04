"""
Shared configuration constants for the backend.
"""

# --- Alert engine ---
OFFICE_HOURS_START = 9    # 9 AM
OFFICE_HOURS_END = 17     # 5 PM
STUCK_ON_THRESHOLD_HOURS = 2
ALERT_CHECK_INTERVAL_SECONDS = 15

# --- Simulator ---
SIMULATOR_TICK_SECONDS = 8
SIMULATOR_MAX_FLIPS_PER_TICK = 3

# --- CORS (wide open for hackathon/dev scope) ---
CORS_ALLOW_ORIGINS = ["*"]
