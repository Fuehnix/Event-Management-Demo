from __future__ import annotations

from datetime import datetime, timedelta, timezone

import pytest

from app.schemas import EventCreate
from app.services.events import EventService
from app.services.registrations import RegistrationService
from app.store import InMemoryStore


@pytest.fixture
def store() -> InMemoryStore:
    return InMemoryStore()


@pytest.fixture
def fixed_now() -> datetime:
    return datetime(2026, 6, 15, 12, 0, 0, tzinfo=timezone.utc)


@pytest.fixture
def event_service(store: InMemoryStore, fixed_now: datetime) -> EventService:
    return EventService(store, clock=lambda: fixed_now)


@pytest.fixture
def registration_service(
    store: InMemoryStore, fixed_now: datetime
) -> RegistrationService:
    return RegistrationService(store, clock=lambda: fixed_now)


@pytest.fixture
def future_event(event_service: EventService, fixed_now: datetime):
    return event_service.create(
        EventCreate(
            title="Tech Meetup",
            description="Monthly meetup",
            date=fixed_now + timedelta(days=7),
            max_capacity=2,
        )
    )


@pytest.fixture
def past_event(event_service: EventService, fixed_now: datetime):
    return event_service.create(
        EventCreate(
            title="Past Conference",
            description="Already happened",
            date=fixed_now - timedelta(days=1),
            max_capacity=10,
        )
    )
