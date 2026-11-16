from __future__ import annotations

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.errors import ConflictError, DomainError, NotFoundError, ValidationError
from app.routers import events, registrations

app = FastAPI(
    title="Event Management API",
    description="REST API for managing events and attendee registrations",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(events.router)
app.include_router(registrations.router)


@app.exception_handler(NotFoundError)
async def not_found_handler(_request: Request, exc: NotFoundError) -> JSONResponse:
    return JSONResponse(status_code=404, content={"detail": exc.message})


@app.exception_handler(ValidationError)
async def validation_handler(_request: Request, exc: ValidationError) -> JSONResponse:
    return JSONResponse(status_code=400, content={"detail": exc.message})


@app.exception_handler(ConflictError)
async def conflict_handler(_request: Request, exc: ConflictError) -> JSONResponse:
    return JSONResponse(status_code=409, content={"detail": exc.message})


@app.exception_handler(DomainError)
async def domain_handler(_request: Request, exc: DomainError) -> JSONResponse:
    return JSONResponse(status_code=400, content={"detail": exc.message})


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
