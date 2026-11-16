import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import { EventCreatePage } from './pages/EventCreatePage'
import { EventDetailPage } from './pages/EventDetailPage'
import { EventListPage } from './pages/EventListPage'

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <header className="topbar">
          <Link to="/" className="brand">
            Event Manager
          </Link>
          <nav>
            <Link to="/">Events</Link>
            <Link to="/events/new">New event</Link>
          </nav>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<EventListPage />} />
            <Route path="/events/new" element={<EventCreatePage />} />
            <Route path="/events/:id" element={<EventDetailPage />} />
          </Routes>
        </main>
        <footer className="footer">
          <span>In-memory demo — data resets when the API restarts.</span>
        </footer>
      </div>
    </BrowserRouter>
  )
}
