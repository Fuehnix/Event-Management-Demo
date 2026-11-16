import { Link } from 'react-router-dom'
import type { Event } from '../types'
import { formatEventDate } from '../utils/format'
import { CapacityBar } from './CapacityBar'

interface EventListProps {
  events: Event[]
  loading: boolean
}

export function EventList({ events, loading }: EventListProps) {
  if (loading) {
    return <p className="muted">Loading events…</p>
  }

  if (events.length === 0) {
    return (
      <div className="empty-state">
        <h2>No events yet</h2>
        <p>Create your first event to start taking registrations.</p>
        <Link className="btn btn-primary" to="/events/new">
          Create event
        </Link>
      </div>
    )
  }

  return (
    <ul className="event-list">
      {events.map((event) => (
        <li key={event.id} className="event-row">
          <div className="event-row-main">
            <div className="event-row-heading">
              <Link to={`/events/${event.id}`} className="event-title-link">
                {event.title}
              </Link>
              {event.is_past && <span className="badge badge-muted">Past</span>}
              {!event.is_past && event.spots_remaining === 0 && (
                <span className="badge badge-warn">Full</span>
              )}
            </div>
            <p className="muted event-date">{formatEventDate(event.date)}</p>
            {event.description && (
              <p className="event-snippet">{event.description}</p>
            )}
            <CapacityBar event={event} />
          </div>
          <Link className="btn btn-secondary" to={`/events/${event.id}`}>
            View
          </Link>
        </li>
      ))}
    </ul>
  )
}
