import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api/client'
import { AttendeeList } from '../components/AttendeeList'
import { CapacityBar } from '../components/CapacityBar'
import { EventForm } from '../components/EventForm'
import { RegisterForm } from '../components/RegisterForm'
import type { Event, EventCreate, Registration } from '../types'
import { formatEventDate } from '../utils/format'

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [event, setEvent] = useState<Event | null>(null)
  const [attendees, setAttendees] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [attendeesLoading, setAttendeesLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)

  const loadEvent = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const data = await api.getEvent(id)
      setEvent(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load event.')
      setEvent(null)
    } finally {
      setLoading(false)
    }
  }, [id])

  const loadAttendees = useCallback(async () => {
    if (!id) return
    setAttendeesLoading(true)
    try {
      const data = await api.listRegistrations(id)
      setAttendees(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load attendees.')
    } finally {
      setAttendeesLoading(false)
    }
  }, [id])

  useEffect(() => {
    void loadEvent()
    void loadAttendees()
  }, [loadEvent, loadAttendees])

  async function handleUpdate(payload: EventCreate) {
    if (!id) return
    const updated = await api.updateEvent(id, payload)
    setEvent(updated)
    setEditing(false)
  }

  async function handleDelete() {
    if (!id || !event) return
    if (!window.confirm(`Delete "${event.title}"? This removes all registrations.`)) {
      return
    }
    try {
      await api.deleteEvent(id)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete event.')
    }
  }

  async function handleRegister(userId: string, userName: string) {
    if (!id) return
    await api.register(id, { user_id: userId, user_name: userName })
    await Promise.all([loadEvent(), loadAttendees()])
  }

  async function handleUnregister(userId: string) {
    if (!id) return
    await api.unregister(id, userId)
    await Promise.all([loadEvent(), loadAttendees()])
  }

  if (loading) {
    return (
      <section className="page">
        <p className="muted">Loading event…</p>
      </section>
    )
  }

  if (!event) {
    return (
      <section className="page">
        <div className="alert alert-error">{error ?? 'Event not found.'}</div>
        <Link to="/">Back to events</Link>
      </section>
    )
  }

  return (
    <section className="page">
      <p className="breadcrumb">
        <Link to="/">Events</Link> / {event.title}
      </p>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="page-header">
        <div>
          <div className="event-row-heading">
            <h1>{event.title}</h1>
            {event.is_past && <span className="badge badge-muted">Past</span>}
            {!event.is_past && event.spots_remaining === 0 && (
              <span className="badge badge-warn">Full</span>
            )}
          </div>
          <p className="muted">{formatEventDate(event.date)}</p>
        </div>
        <div className="header-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setEditing((v) => !v)}
          >
            {editing ? 'Close editor' : 'Edit'}
          </button>
          <button type="button" className="btn btn-danger" onClick={handleDelete}>
            Delete
          </button>
        </div>
      </div>

      {event.description && <p className="event-description">{event.description}</p>}
      <CapacityBar event={event} />

      {editing && (
        <div className="panel">
          <h3>Edit event</h3>
          <EventForm
            initial={event}
            submitLabel="Save changes"
            onSubmit={handleUpdate}
            onCancel={() => setEditing(false)}
          />
        </div>
      )}

      <div className="detail-grid">
        <div className="panel">
          <RegisterForm event={event} onRegister={handleRegister} />
        </div>
        <div className="panel">
          <AttendeeList
            attendees={attendees}
            loading={attendeesLoading}
            onUnregister={handleUnregister}
          />
        </div>
      </div>
    </section>
  )
}
