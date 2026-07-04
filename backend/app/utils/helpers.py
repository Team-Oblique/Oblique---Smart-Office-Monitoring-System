"""
Small shared helpers. Kept separate from models/services so both the
data layer and the API layer can import without circular dependencies.

Rooms are plain strings throughout the backend (see models/schemas.py),
not an enum -- these helpers exist mainly for the Discord bot, which
needs to translate loose user input (e.g. "work1") into the exact
canonical room string used everywhere else ("Work Room 1").
"""

from __future__ import annotations

VALID_ROOMS: list[str] = ["Drawing Room", "Work Room 1", "Work Room 2"]

# Loose aliases -> canonical room string. Keys are lowercased and
# stripped of spaces before lookup, so "Work 1", "work1", "WorkRoom1"
# all resolve the same way.
ROOM_ALIASES: dict[str, str] = {
    "drawing": "Drawing Room",
    "drawingroom": "Drawing Room",
    "work1": "Work Room 1",
    "workroom1": "Work Room 1",
    "work2": "Work Room 2",
    "workroom2": "Work Room 2",
}


def normalize_room(user_input: str) -> str | None:
    """
    Translate loose user input into the canonical room string, or None
    if it doesn't match anything. Used by the Discord bot's !room command.
    """
    key = user_input.strip().lower().replace(" ", "")
    if key in ROOM_ALIASES:
        return ROOM_ALIASES[key]
    for room in VALID_ROOMS:
        if room.lower().replace(" ", "") == key:
            return room
    return None