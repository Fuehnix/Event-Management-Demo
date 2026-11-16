import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Event, EventCreate } from '../types'
import { fromDatetimeLocalValue, toDatetimeLocalValue } from '../utils/format'

interface EventFormProps {
  initial?: Event
  submitLabel: string
  onSubmit: (payload: EventCreate) => Promise<void>
  onCancel?: () => void
}

function defaultDateLocal(): string {
  const d = new Date()
  d.setDate(d.getDate() + 7)
  d.setMinutes(0, 0, 0)
  return toDatetimeLocalValue(d.toISOString())
}

export function EventForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: EventFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [date, setDate] = useState(
    initial ? toDatetimeLocalValue(initial.date) : defaultDateLocal(),
  )
  const [maxCapacity, setMaxCapacity] = useState(
    String(initial?.max_capacity ?? 50),
  )
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    const capacity = Number(maxCapacity)
    if (!title.trim()) {
      setError('Title is required.')
      return
    }
    if (!date) {
      setError('Date is required.')
      return
    }
    if (!Number.isInteger(capacity) || capacity < 1) {
      setError('Max capacity must be a positive whole number.')
      return
    }

    setSaving(true)
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        date: fromDatetimeLocalValue(date),
        max_capacity: capacity,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save event.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      {error && <div className="alert alert-error">{error}</div>}

      <label className="field">
        <span>Title</span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Team offsite"
          required
        />
      </label>

      <label className="field">
        <span>Description</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="What is this event about?"
        />
      </label>

      <div className="form-row">
        <label className="field">
          <span>Date & time</span>
          <input
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </label>

        <label className="field">
          <span>Max capacity</span>
          <input
            type="number"
            min={1}
            value={maxCapacity}
            onChange={(e) => setMaxCapacity(e.target.value)}
            required
          />
        </label>
      </div>

      <div className="form-actions">
        {onCancel && (
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  )
}
