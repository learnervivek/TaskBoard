import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import AuthContext from '../context/AuthContext'

export default function Home(){
  const { user } = useContext(AuthContext)

  return (
    <div className="hero">
      <div className="hero-inner container">
        <div>
          <h1 className="hero-title">Collaborative Task Boards, in real-time</h1>
          <p className="hero-sub">Plan, track and discuss work across teams. Simple, fast, and built for realtime collaboration.</p>
          <div style={{ marginTop:18, display:'flex', gap:12 }}>
            {user ? (
              <Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
            ) : (
              <>
                <Link to="/signup" className="btn btn-primary">Get Started — Free</Link>
                <Link to="/login" className="btn btn-ghost">Sign in</Link>
              </>
            )}
          </div>
        </div>

        <div className="hero-visual">
          <div className="card-preview"> 
            <div className="card-row"><span className="pill">To Do</span><div className="task">Design header</div></div>
            <div className="card-row"><span className="pill">In Progress</span><div className="task">Implement sockets</div></div>
            <div className="card-row"><span className="pill">Done</span><div className="task">Scaffold app</div></div>
          </div>
        </div>
      </div>
      <div className="container">
        <section className="features">
          <div className="feature">
            <h3>Real-time</h3>
            <p>Instant updates via WebSockets — everyone stays in sync.</p>
          </div>
          <div className="feature">
            <h3>Simple</h3>
            <p>Clear boards, lists and tasks — no bloat, just productivity.</p>
          </div>
          <div className="feature">
            <h3>Secure</h3>
            <p>JWT-based auth and per-board rooms for scoped updates.</p>
          </div>
        </section>
      </div>
    </div>
  )
}
