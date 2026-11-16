from __future__ import annotations

import pytest

from app.errors import ConflictError, NotFoundError, ValidationError
from app.schemas import RegistrationCreate
from app.services.events import EventService
from app.services.registrations import RegistrationService


def test_register_rejects_past_event(
    registration_service: RegistrationService, past_event
):
    with pytest.raises(ValidationError, match="past event"):
        registration_service.register(
            past_event.id,
            RegistrationCreate(user_id="u1", user_name="Alice"),
        )


def test_register_rejects_when_full(
    registration_service: RegistrationService, future_event
):
    registration_service.register(
        future_event.id,
        RegistrationCreate(user_id="u1", user_name="Alice"),
    )
    registration_service.register(
        future_event.id,
        RegistrationCreate(user_id="u2", user_name="Bob"),
    )

    with pytest.raises(ConflictError, match="full capacity"):
        registration_service.register(
            future_event.id,
            RegistrationCreate(user_id="u3", user_name="Carol"),
        )


def test_register_rejects_duplicate_user(
    registration_service: RegistrationService, future_event
):
    registration_service.register(
        future_event.id,
        RegistrationCreate(user_id="u1", user_name="Alice"),
    )

    with pytest.raises(ConflictError, match="already registered"):
        registration_service.register(
            future_event.id,
            RegistrationCreate(user_id="u1", user_name="Alice Again"),
        )


def test_unregister_frees_capacity(
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

    registration_service.unregister(future_event.id, "u1")

    event = event_service.get(future_event.id)
    assert event.registered_count == 1
    assert event.spots_remaining == 1

    # Capacity freed — another user can register
    registration_service.register(
        future_event.id,
        RegistrationCreate(user_id="u3", user_name="Carol"),
    )
    event = event_service.get(future_event.id)
    assert event.registered_count == 2


def test_unregister_missing_user(
    registration_service: RegistrationService, future_event
):
    with pytest.raises(NotFoundError, match="not registered"):
        registration_service.unregister(future_event.id, "nobody")


def test_list_registrations(
    registration_service: RegistrationService, future_event
):
    registration_service.register(
        future_event.id,
        RegistrationCreate(user_id="u1", user_name="Alice"),
    )
    registration_service.register(
        future_event.id,
        RegistrationCreate(user_id="u2", user_name="Bob"),
    )

    attendees = registration_service.list_for_event(future_event.id)
    assert len(attendees) == 2
    assert {a.user_id for a in attendees} == {"u1", "u2"}
