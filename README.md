# Event Management API

Full-stack take-home exercise: a REST API for events and attendee registrations (FastAPI, in-memory storage) plus a React (Vite) SPA to manage them.

Authentication is out of scope. Identify attendees with a free-form **User ID** (for example an email) when registering.

> **Note:** All data lives in memory and is lost when the API process restarts.

## Prerequisites

- Python 3.11+
- Node.js 20+
- npm

## Project layout

```
Event-Management-Demo/
  backend/     FastAPI + pytest
  frontend/    React + Vite + TypeScript
  README.md
```

## Run the backend

```bash
cd backend
python -m venv .venv

# Windows
.\.venv\Scripts\activate

# macOS / Linux
# source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

API base URL: `http://localhost:8000`  
Interactive docs: `http://localhost:8000/docs`

### Run unit tests

```bash
cd backend
# with venv activated
pytest
```

Tests cover the business rules: past events, capacity limits, duplicate registration, unregister freeing capacity, and capacity updates.

## Run the frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. The SPA calls the API at `http://localhost:8000` by default.

To point at a different API host:

```bash
# Windows PowerShell
$env:VITE_API_URL="http://localhost:8000"; npm run dev
```

## API overview

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/events` | Create event |
| `GET` | `/api/events` | List events (`?upcoming=true` optional) |
| `GET` | `/api/events/{id}` | Get event (includes counts / past flag) |
| `PUT` | `/api/events/{id}` | Update event |
| `DELETE` | `/api/events/{id}` | Delete event (cascades registrations) |
| `POST` | `/api/events/{id}/registrations` | Register attendee |
| `GET` | `/api/events/{id}/registrations` | List attendees |
| `DELETE` | `/api/events/{id}/registrations/{user_id}` | Unregister attendee |

### Example: create an event

```bash
curl -X POST http://localhost:8000/api/events \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Tech Meetup\",\"description\":\"Monthly talk\",\"date\":\"2026-12-01T18:00:00Z\",\"max_capacity\":50}"
```

### Example: register

```bash
curl -X POST http://localhost:8000/api/events/{event_id}/registrations \
  -H "Content-Type: application/json" \
  -d "{\"user_id\":\"alice@example.com\",\"user_name\":\"Alice\"}"
```

## Business rules

- Cannot register for past events
- Cannot exceed event capacity
- Cannot double-register the same user for the same event
- Cannot lower `max_capacity` below the current registration count

## Frontend features

- List / create / edit / delete events
- Capacity progress and past/full badges
- Register and unregister attendees
- Disabled registration with clear messaging when an event is past or full
- Empty states and inline API error messages
