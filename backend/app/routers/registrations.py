from __future__ import annotations

from fastapi import APIRouter, status

from app.schemas import RegistrationCreate, RegistrationResponse
from app.services.registrations import RegistrationService
from app.store import store

router = APIRouter(prefix="/api/events", tags=["registrations"])
registration_service = RegistrationService(store)


@router.post(
    "/{event_id}/registrations",
    response_model=RegistrationResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(event_id: str, payload: RegistrationCreate) -> RegistrationResponse:
    return registration_service.register(event_id, payload)


@router.get("/{event_id}/registrations", response_model=list[RegistrationResponse])
def list_registrations(event_id: str) -> list[RegistrationResponse]:
    return registration_service.list_for_event(event_id)


@router.delete(
    "/{event_id}/registrations/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def unregister(event_id: str, user_id: str) -> None:
    registration_service.unregister(event_id, user_id)
