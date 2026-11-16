from __future__ import annotations

import threading
from collections import defaultdict

from app.models import Event, Registration


class InMemoryStore:
    """Thread-safe in-memory storage with O(1) capacity and duplicate checks."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self.events: dict[str, Event] = {}
        self.registrations: dict[str, Registration] = {}
        self.regs_by_event: dict[str, set[str]] = defaultdict(set)
        self.user_event_index: set[tuple[str, str]] = set()

    @property
    def lock(self) -> threading.Lock:
        return self._lock

    def clear(self) -> None:
        with self._lock:
            self.events.clear()
            self.registrations.clear()
            self.regs_by_event.clear()
            self.user_event_index.clear()


# Shared application store
store = InMemoryStore()
