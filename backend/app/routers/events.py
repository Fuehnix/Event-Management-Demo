from __future__ import annotations

from fastapi import APIRouter, Query, status

from app.schemas import EventCreate, EventResponse, EventUpdate
from app.services.events import EventService
from app.store import store

router = APIRouter(prefix="/api/events", tags=["events"])
event_service = EventService(store)


@router.post("", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
def create_event(payload: EventCreate) -> EventResponse:
    return event_service.create(payload)


@router.get("", response_model=list[EventResponse])
def list_events(
    upcoming: bool = Query(default=False, description="Only return upcoming events"),
) -> list[EventResponse]:
    return event_service.list(upcoming_only=upcoming)


@router.get("/{event_id}", response_model=EventResponse)
def get_event(event_id: str) -> EventResponse:
    return event_service.get(event_id)


@router.put("/{event_id}", response_model=EventResponse)
def update_event(event_id: str, payload: EventUpdate) -> EventResponse:
    return event_service.update(event_id, payload)


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(event_id: str) -> None:
    event_service.delete(event_id)
