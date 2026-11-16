from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime


@dataclass
class Event:
    id: str
    title: str
    description: str
    date: datetime
    max_capacity: int


@dataclass
class Registration:
    id: str
    event_id: str
    user_id: str
    user_name: str
    registered_at: datetime
