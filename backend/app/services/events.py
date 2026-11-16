from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Callable

from app.errors import NotFoundError, ValidationError
from app.models import Event
from app.schemas import EventCreate, EventResponse, EventUpdate
from app.store import InMemoryStore


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _ensure_aware(dt: datetime) -> datetime:
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def to_event_response(
    event: Event,
    store: InMemoryStore,
    *,
    now: datetime | None = None,
) -> EventResponse:
    current = now or _utcnow()
    registered_count = len(store.regs_by_event.get(event.id, set()))
    return EventResponse(
        id=event.id,
        title=event.title,
        description=event.description,
        date=event.date,
        max_capacity=event.max_capacity,
        registered_count=registered_count,
        spots_remaining=max(0, event.max_capacity - registered_count),
        is_past=_ensure_aware(event.date) < current,
    )


class EventService:
    def __init__(
        self,
        store: InMemoryStore,
        clock: Callable[[], datetime] | None = None,
    ) -> None:
        self.store = store
        self.clock = clock or _utcnow

    def create(self, payload: EventCreate) -> EventResponse:
        event = Event(
            id=str(uuid.uuid4()),
            title=payload.title,
            description=payload.description,
            date=_ensure_aware(payload.date),
            max_capacity=payload.max_capacity,
        )
        with self.store.lock:
            self.store.events[event.id] = event
            return to_event_response(event, self.store, now=self.clock())

    def list(self, *, upcoming_only: bool = False) -> list[EventResponse]:
        now = self.clock()
        with self.store.lock:
            events = list(self.store.events.values())
            responses = [
                to_event_response(event, self.store, now=now) for event in events
            ]
        if upcoming_only:
            responses = [r for r in responses if not r.is_past]
        responses.sort(key=lambda r: r.date)
        return responses

    def get(self, event_id: str) -> EventResponse:
        with self.store.lock:
            event = self.store.events.get(event_id)
            if event is None:
                raise NotFoundError(f"Event '{event_id}' not found")
            return to_event_response(event, self.store, now=self.clock())

    def update(self, event_id: str, payload: EventUpdate) -> EventResponse:
        with self.store.lock:
            event = self.store.events.get(event_id)
            if event is None:
                raise NotFoundError(f"Event '{event_id}' not found")

            if payload.max_capacity is not None:
                registered_count = len(self.store.regs_by_event.get(event_id, set()))
                if payload.max_capacity < registered_count:
                    raise ValidationError(
                        f"Cannot set capacity to {payload.max_capacity}; "
                        f"{registered_count} attendees already registered"
                    )
                event.max_capacity = payload.max_capacity

            if payload.title is not None:
                event.title = payload.title
            if payload.description is not None:
                event.description = payload.description
            if payload.date is not None:
                event.date = _ensure_aware(payload.date)

            return to_event_response(event, self.store, now=self.clock())

    def delete(self, event_id: str) -> None:
        with self.store.lock:
            if event_id not in self.store.events:
                raise NotFoundError(f"Event '{event_id}' not found")

            reg_ids = list(self.store.regs_by_event.get(event_id, set()))
            for reg_id in reg_ids:
                registration = self.store.registrations.pop(reg_id, None)
                if registration is not None:
                    self.store.user_event_index.discard(
                        (registration.user_id, event_id)
                    )
            self.store.regs_by_event.pop(event_id, None)
            del self.store.events[event_id]
