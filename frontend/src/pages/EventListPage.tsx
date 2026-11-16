import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { EventList } from '../components/EventList'
import type { Event } from '../types'

export function EventListPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [upcomingOnly, setUpcomingOnly] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await api.listEvents(upcomingOnly)
        if (!cancelled) setEvents(data)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load events.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [upcomingOnly])

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h1>Events</h1>
          <p className="muted">Create events and manage attendee registrations.</p>
        </div>
        <Link className="btn btn-primary" to="/events/new">
          New event
        </Link>
      </div>

      <label className="filter-toggle">
        <input
          type="checkbox"
          checked={upcomingOnly}
          onChange={(e) => setUpcomingOnly(e.target.checked)}
        />
        Show upcoming only
      </label>

      {error && <div className="alert alert-error">{error}</div>}
      <EventList events={events} loading={loading} />
    </section>
  )
}
