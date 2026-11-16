from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field, field_validator


class EventCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(default="", max_length=5000)
    date: datetime
    max_capacity: int = Field(..., gt=0)

    @field_validator("title")
    @classmethod
    def title_not_blank(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise ValueError("title must not be blank")
        return stripped


class EventUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=5000)
    date: datetime | None = None
    max_capacity: int | None = Field(default=None, gt=0)

    @field_validator("title")
    @classmethod
    def title_not_blank(cls, value: str | None) -> str | None:
        if value is None:
            return value
        stripped = value.strip()
        if not stripped:
            raise ValueError("title must not be blank")
        return stripped


class EventResponse(BaseModel):
    id: str
    title: str
    description: str
    date: datetime
    max_capacity: int
    registered_count: int
    spots_remaining: int
    is_past: bool


class RegistrationCreate(BaseModel):
    user_id: str = Field(..., min_length=1, max_length=200)
    user_name: str = Field(..., min_length=1, max_length=200)

    @field_validator("user_id", "user_name")
    @classmethod
    def not_blank(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise ValueError("must not be blank")
        return stripped


class RegistrationResponse(BaseModel):
    id: str
    event_id: str
    user_id: str
    user_name: str
    registered_at: datetime
