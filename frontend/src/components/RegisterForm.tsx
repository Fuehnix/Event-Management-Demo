import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Event } from '../types'

interface RegisterFormProps {
  event: Event
  onRegister: (userId: string, userName: string) => Promise<void>
}

export function RegisterForm({ event, onRegister }: RegisterFormProps) {
  const [userId, setUserId] = useState('')
  const [userName, setUserName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const disabledReason = event.is_past
    ? 'This event has already passed.'
    : event.spots_remaining === 0
      ? 'This event is at full capacity.'
      : null

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!userId.trim() || !userName.trim()) {
      setError('User ID and name are required.')
      return
    }

    setSaving(true)
    try {
      await onRegister(userId.trim(), userName.trim())
      setSuccess(`Registered ${userName.trim()} successfully.`)
      setUserId('')
      setUserName('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h3>Register attendee</h3>

      {disabledReason && (
        <div className="alert alert-warn">{disabledReason}</div>
      )}
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="form-row">
        <label className="field">
          <span>User ID</span>
          <input
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="alice@example.com"
            disabled={!!disabledReason || saving}
            required
          />
        </label>
        <label className="field">
          <span>Name</span>
          <input
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Alice Smith"
            disabled={!!disabledReason || saving}
            required
          />
        </label>
      </div>

      <div className="form-actions">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={!!disabledReason || saving}
        >
          {saving ? 'Registering…' : 'Register'}
        </button>
      </div>
    </form>
  )
}
