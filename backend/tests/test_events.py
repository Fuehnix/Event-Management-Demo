from __future__ import annotations

from datetime import timedelta

import pytest

from app.errors import NotFoundError, ValidationError
from app.schemas import EventCreate, EventUpdate, RegistrationCreate
from app.services.events import EventService
from app.services.registrations import RegistrationService


def test_create_and_list_events(event_service: EventService, fixed_now):
    first = event_service.create(
        EventCreate(
            title="Alpha",
            description="First",
            date=fixed_now + timedelta(days=3),
            max_capacity=5,
        )
    )
    second = event_service.create(
        EventCreate(
            title="Beta",
            description="Second",
            date=fixed_now + timedelta(days=1),
            max_capacity=10,
        )
    )

    listed = event_service.list()
    assert len(listed) == 2
    assert listed[0].id == second.id
    assert listed[1].id == first.id
    assert listed[0].registered_count == 0
    assert listed[0].spots_remaining == 10
    assert listed[0].is_past is False


def test_list_upcoming_only(event_service: EventService, past_event, future_event):
    upcoming = event_service.list(upcoming_only=True)
    assert len(upcoming) == 1
    assert upcoming[0].id == future_event.id


def test_update_capacity_below_count_rejected(
    event_service: EventService,
    registration_service: RegistrationService,
    future_event,
):
    registration_service.register(
        future_event.id,
        RegistrationCreate(user_id="u1", user_name="Alice"),
    )
    registration_service.register(
        future_event.id,
        RegistrationCreate(user_id="u2", user_name="Bob"),
    )

    with pytest.raises(ValidationError, match="Cannot set capacity"):
        event_service.update(
            future_event.id,
            EventUpdate(max_capacity=1),
        )


def test_update_event_fields(event_service: EventService, future_event, fixed_now):
    updated = event_service.update(
        future_event.id,
        EventUpdate(
            title="Updated Title",
            description="New description",
            max_capacity=20,
            date=fixed_now + timedelta(days=14),
        ),
    )
    assert updated.title == "Updated Title"
    assert updated.description == "New description"
    assert updated.max_capacity == 20
    assert updated.date == fixed_now + timedelta(days=14)


def test_delete_event_cascades_registrations(
    event_service: EventService,
    registration_service: RegistrationService,
    future_event,
):
    registration_service.register(
        future_event.id,
        RegistrationCreate(user_id="u1", user_name="Alice"),
    )
    event_service.delete(future_event.id)

    with pytest.raises(NotFoundError):
        event_service.get(future_event.id)

    assert registration_service.store.registrations == {}
    assert future_event.id not in registration_service.store.regs_by_event
