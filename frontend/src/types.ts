export interface Event {
  id: string
  title: string
  description: string
  date: string
  max_capacity: number
  registered_count: number
  spots_remaining: number
  is_past: boolean
}

export interface EventCreate {
  title: string
  description: string
  date: string
  max_capacity: number
}

export interface EventUpdate {
  title?: string
  description?: string
  date?: string
  max_capacity?: number
}

export interface Registration {
  id: string
  event_id: string
  user_id: string
  user_name: string
  registered_at: string
}

export interface RegistrationCreate {
  user_id: string
  user_name: string
}

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}
