import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { EventForm } from '../components/EventForm'
import type { EventCreate } from '../types'

export function EventCreatePage() {
  const navigate = useNavigate()

  async function handleCreate(payload: EventCreate) {
    const created = await api.createEvent(payload)
    navigate(`/events/${created.id}`)
  }

  return (
    <section className="page page-narrow">
      <div className="page-header">
        <div>
          <h1>Create event</h1>
          <p className="muted">Add a new event and set its capacity.</p>
        </div>
      </div>
      <EventForm
        submitLabel="Create event"
        onSubmit={handleCreate}
        onCancel={() => navigate('/')}
      />
    </section>
  )
}
