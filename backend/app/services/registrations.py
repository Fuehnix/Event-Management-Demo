from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Callable

from app.errors import ConflictError, NotFoundError, ValidationError
from app.models import Registration
from app.schemas import RegistrationCreate, RegistrationResponse
from app.services.events import _ensure_aware
from app.store import InMemoryStore


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def to_registration_response(registration: Registration) -> RegistrationResponse:
    return RegistrationResponse(
        id=registration.id,
        event_id=registration.event_id,
        user_id=registration.user_id,
        user_name=registration.user_name,
        registered_at=registration.registered_at,
    )


class RegistrationService:
    def __init__(
        self,
        store: InMemoryStore,
        clock: Callable[[], datetime] | None = None,
    ) -> None:
        self.store = store
        self.clock = clock or _utcnow

    def register(
        self, event_id: str, payload: RegistrationCreate
    ) -> RegistrationResponse:
        with self.store.lock:
            event = self.store.events.get(event_id)
            if event is None:
                raise NotFoundError(f"Event '{event_id}' not found")

            now = self.clock()
            if _ensure_aware(event.date) < now:
                raise ValidationError("Cannot register for a past event")

            if (payload.user_id, event_id) in self.store.user_event_index:
                raise ConflictError(
                    f"User '{payload.user_id}' is already registered for this event"
                )

            registered_count = len(self.store.regs_by_event.get(event_id, set()))
            if registered_count >= event.max_capacity:
                raise ConflictError("Event is at full capacity")

            registration = Registration(
                id=str(uuid.uuid4()),
                event_id=event_id,
                user_id=payload.user_id,
                user_name=payload.user_name,
                registered_at=now,
            )
            self.store.registrations[registration.id] = registration
            self.store.regs_by_event[event_id].add(registration.id)
            self.store.user_event_index.add((payload.user_id, event_id))
            return to_registration_response(registration)

    def list_for_event(self, event_id: str) -> list[RegistrationResponse]:
        with self.store.lock:
            if event_id not in self.store.events:
                raise NotFoundError(f"Event '{event_id}' not found")
            reg_ids = self.store.regs_by_event.get(event_id, set())
            registrations = [
                self.store.registrations[rid]
                for rid in reg_ids
                if rid in self.store.registrations
            ]
        registrations.sort(key=lambda r: r.registered_at)
        return [to_registration_response(r) for r in registrations]

    def unregister(self, event_id: str, user_id: str) -> None:
        with self.store.lock:
            if event_id not in self.store.events:
                raise NotFoundError(f"Event '{event_id}' not found")

            if (user_id, event_id) not in self.store.user_event_index:
                raise NotFoundError(
                    f"User '{user_id}' is not registered for event '{event_id}'"
                )

            target_id: str | None = None
            for reg_id in self.store.regs_by_event.get(event_id, set()):
                registration = self.store.registrations.get(reg_id)
                if registration is not None and registration.user_id == user_id:
                    target_id = reg_id
                    break

            if target_id is None:
                raise NotFoundError(
                    f"User '{user_id}' is not registered for event '{event_id}'"
                )

            del self.store.registrations[target_id]
            self.store.regs_by_event[event_id].discard(target_id)
            self.store.user_event_index.discard((user_id, event_id))
