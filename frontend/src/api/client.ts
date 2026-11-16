import type {
  Event,
  EventCreate,
  EventUpdate,
  Registration,
  RegistrationCreate,
} from '../types'
import { ApiError } from '../types'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers ?? {}),
    },
    ...options,
  })

  if (response.status === 204) {
    return undefined as T
  }

  let body: unknown = null
  const text = await response.text()
  if (text) {
    try {
      body = JSON.parse(text)
    } catch {
      body = { detail: text }
    }
  }

  if (!response.ok) {
    const detail =
      typeof body === 'object' &&
      body !== null &&
      'detail' in body &&
      typeof (body as { detail: unknown }).detail === 'string'
        ? (body as { detail: string }).detail
        : `Request failed with status ${response.status}`
    throw new ApiError(response.status, detail)
  }

  return body as T
}

export const api = {
  listEvents(upcoming = false): Promise<Event[]> {
    const query = upcoming ? '?upcoming=true' : ''
    return request<Event[]>(`/api/events${query}`)
  },

  getEvent(id: string): Promise<Event> {
    return request<Event>(`/api/events/${id}`)
  },

  createEvent(payload: EventCreate): Promise<Event> {
    return request<Event>('/api/events', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  updateEvent(id: string, payload: EventUpdate): Promise<Event> {
    return request<Event>(`/api/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  },

  deleteEvent(id: string): Promise<void> {
    return request<void>(`/api/events/${id}`, { method: 'DELETE' })
  },

  listRegistrations(eventId: string): Promise<Registration[]> {
    return request<Registration[]>(`/api/events/${eventId}/registrations`)
  },

  register(eventId: string, payload: RegistrationCreate): Promise<Registration> {
    return request<Registration>(`/api/events/${eventId}/registrations`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  unregister(eventId: string, userId: string): Promise<void> {
    return request<void>(
      `/api/events/${eventId}/registrations/${encodeURIComponent(userId)}`,
      { method: 'DELETE' },
    )
  },
}
