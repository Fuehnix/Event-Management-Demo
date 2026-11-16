import { useState } from 'react'
import type { Registration } from '../types'
import { formatEventDate } from '../utils/format'

interface AttendeeListProps {
  attendees: Registration[]
  loading: boolean
  onUnregister: (userId: string) => Promise<void>
}

export function AttendeeList({
  attendees,
  loading,
  onUnregister,
}: AttendeeListProps) {
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleUnregister(userId: string, userName: string) {
    if (!window.confirm(`Unregister ${userName}?`)) return
    setError(null)
    setBusyId(userId)
    try {
      await onUnregister(userId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unregister.')
    } finally {
      setBusyId(null)
    }
  }

  if (loading) {
    return <p className="muted">Loading attendees…</p>
  }

  return (
    <div>
      <h3>Attendees ({attendees.length})</h3>
      {error && <div className="alert alert-error">{error}</div>}

      {attendees.length === 0 ? (
        <div className="empty-state empty-state-compact">
          <p>No attendees registered yet.</p>
        </div>
      ) : (
        <ul className="attendee-list">
          {attendees.map((a) => (
            <li key={a.id} className="attendee-row">
              <div>
                <strong>{a.user_name}</strong>
                <p className="muted">
                  {a.user_id} · registered {formatEventDate(a.registered_at)}
                </p>
              </div>
              <button
                type="button"
                className="btn btn-danger"
                disabled={busyId === a.user_id}
                onClick={() => handleUnregister(a.user_id, a.user_name)}
              >
                {busyId === a.user_id ? 'Removing…' : 'Unregister'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
