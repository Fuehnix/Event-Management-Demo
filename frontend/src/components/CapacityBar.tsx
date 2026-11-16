import type { Event } from '../types'

interface CapacityBarProps {
  event: Event
}

export function CapacityBar({ event }: CapacityBarProps) {
  const pct =
    event.max_capacity === 0
      ? 0
      : Math.min(100, (event.registered_count / event.max_capacity) * 100)

  let tone = 'ok'
  if (event.is_past) tone = 'past'
  else if (event.spots_remaining === 0) tone = 'full'
  else if (pct >= 80) tone = 'warn'

  return (
    <div className="capacity">
      <div className="capacity-meta">
        <span>
          {event.registered_count} / {event.max_capacity} registered
        </span>
        <span>
          {event.is_past
            ? 'Past event'
            : event.spots_remaining === 0
              ? 'Full'
              : `${event.spots_remaining} spots left`}
        </span>
      </div>
      <div className="capacity-track" aria-hidden="true">
        <div
          className={`capacity-fill capacity-fill--${tone}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
