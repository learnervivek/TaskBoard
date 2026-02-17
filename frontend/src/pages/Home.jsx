import React, { useContext, useState } from 'react'
import { Link } from 'react-router-dom'
import AuthContext from '../context/AuthContext'

export default function Home(){
  const { user } = useContext(AuthContext)
  const [activeStep, setActiveStep] = useState(1)

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
            <h3>⚡ Real-time</h3>
            <p>Instant updates via WebSockets — everyone stays in sync.</p>
          </div>
          <div className="feature">
            <h3>🎯 Simple</h3>
            <p>Clear boards, lists and tasks — no bloat, just productivity.</p>
          </div>
          <div className="feature">
            <h3>🔒 Secure</h3>
            <p>JWT-based auth and per-board rooms for scoped updates.</p>
          </div>
        </section>
      </div>

      {/* How to Use Section */}
      <div className="container" style={{ marginTop: 60 }}>
        <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: 40 }}>How to Use TaskBoard</h2>
        
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          {/* Step Navigation */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 30, flexWrap: 'wrap' }}>
            {[1, 2, 3, 4, 5].map(step => (
              <button 
                key={step}
                onClick={() => setActiveStep(step)}
                style={{
                  padding: '10px 20px',
                  border: activeStep === step ? '2px solid #3b82f6' : '1px solid #ddd',
                  borderRadius: 8,
                  background: activeStep === step ? '#3b82f6' : 'white',
                  color: activeStep === step ? 'white' : '#333',
                  cursor: 'pointer',
                  fontWeight: activeStep === step ? '600' : '400',
                  transition: 'all 0.3s'
                }}
              >
                Step {step}
              </button>
            ))}
          </div>

          {/* Step Content */}
          <div style={{ 
            background: 'white', 
            padding: 40, 
            borderRadius: 12, 
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            minHeight: 300
          }}>
            {activeStep === 1 && (
              <div>
                <h3 style={{ fontSize: '1.8rem', marginBottom: 20, color: '#3b82f6' }}>
                  📝 Step 1: Create Your Account
                </h3>
                <div style={{ lineHeight: 1.8, fontSize: '1.1rem' }}>
                  <p style={{ marginBottom: 15 }}>Getting started is easy and free!</p>
                  <ol style={{ paddingLeft: 25 }}>
                    <li style={{ marginBottom: 10 }}>Click the <strong>"Get Started — Free"</strong> button above</li>
                    <li style={{ marginBottom: 10 }}>Enter your name, email, and password</li>
                    <li style={{ marginBottom: 10 }}>Click <strong>"Sign Up"</strong></li>
                    <li style={{ marginBottom: 10 }}>You'll be automatically logged in and redirected to your dashboard</li>
                  </ol>
                  <div style={{ 
                    background: '#f0f9ff', 
                    padding: 15, 
                    borderRadius: 8, 
                    marginTop: 20,
                    borderLeft: '4px solid #3b82f6'
                  }}>
                    <strong>💡 Tip:</strong> Already have an account? Click "Sign in" instead!
                  </div>
                </div>
              </div>
            )}

            {activeStep === 2 && (
              <div>
                <h3 style={{ fontSize: '1.8rem', marginBottom: 20, color: '#3b82f6' }}>
                  📋 Step 2: Create Your First Board
                </h3>
                <div style={{ lineHeight: 1.8, fontSize: '1.1rem' }}>
                  <p style={{ marginBottom: 15 }}>Boards help you organize different projects or teams:</p>
                  <ol style={{ paddingLeft: 25 }}>
                    <li style={{ marginBottom: 10 }}>From your dashboard, look for the <strong>"Create New Board"</strong> button</li>
                    <li style={{ marginBottom: 10 }}>Enter a board name (e.g., "Marketing Campaign", "Website Redesign")</li>
                    <li style={{ marginBottom: 10 }}>Click <strong>"Create"</strong></li>
                    <li style={{ marginBottom: 10 }}>Three default lists are automatically created for you:
                      <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                        <li>📌 To Do</li>
                        <li>🚀 In Progress</li>
                        <li>✅ Done</li>
                      </ul>
                    </li>
                  </ol>
                  <div style={{ 
                    background: '#f0fdf4', 
                    padding: 15, 
                    borderRadius: 8, 
                    marginTop: 20,
                    borderLeft: '4px solid #10b981'
                  }}>
                    <strong>✨ Pro Tip:</strong> You can create as many boards as you need - one for each project!
                  </div>
                </div>
              </div>
            )}

            {activeStep === 3 && (
              <div>
                <h3 style={{ fontSize: '1.8rem', marginBottom: 20, color: '#3b82f6' }}>
                  ✏️ Step 3: Add Tasks to Your Lists
                </h3>
                <div style={{ lineHeight: 1.8, fontSize: '1.1rem' }}>
                  <p style={{ marginBottom: 15 }}>Tasks are the work items you need to complete:</p>
                  <ol style={{ paddingLeft: 25 }}>
                    <li style={{ marginBottom: 10 }}>Click on a board to open it</li>
                    <li style={{ marginBottom: 10 }}>You'll see the task creation form at the top</li>
                    <li style={{ marginBottom: 10 }}>Enter a <strong>task title</strong> (e.g., "Write blog post")</li>
                    <li style={{ marginBottom: 10 }}>Add a <strong>description</strong> (optional but helpful)</li>
                    <li style={{ marginBottom: 10 }}>Select which <strong>list</strong> to add it to (To Do, In Progress, or Done)</li>
                    <li style={{ marginBottom: 10 }}>Click <strong>"Add Task"</strong></li>
                  </ol>
                  <div style={{ 
                    background: '#fef3c7', 
                    padding: 15, 
                    borderRadius: 8, 
                    marginTop: 20,
                    borderLeft: '4px solid #f59e0b'
                  }}>
                    <strong>⚡ Quick Tip:</strong> Tasks appear instantly for all team members viewing the board!
                  </div>
                </div>
              </div>
            )}

            {activeStep === 4 && (
              <div>
                <h3 style={{ fontSize: '1.8rem', marginBottom: 20, color: '#3b82f6' }}>
                  🔄 Step 4: Move Tasks & Track Progress
                </h3>
                <div style={{ lineHeight: 1.8, fontSize: '1.1rem' }}>
                  <p style={{ marginBottom: 15 }}>Update task status as work progresses:</p>
                  <div style={{ marginBottom: 20 }}>
                    <h4 style={{ color: '#6366f1', marginBottom: 10 }}>Method 1: Drag & Drop</h4>
                    <ul style={{ paddingLeft: 25 }}>
                      <li style={{ marginBottom: 8 }}>Click and hold a task card</li>
                      <li style={{ marginBottom: 8 }}>Drag it to a different list</li>
                      <li style={{ marginBottom: 8 }}>Release to drop it there</li>
                    </ul>
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <h4 style={{ color: '#6366f1', marginBottom: 10 }}>Method 2: Move Dropdown</h4>
                    <ul style={{ paddingLeft: 25 }}>
                      <li style={{ marginBottom: 8 }}>Click the "Move to..." dropdown on any task</li>
                      <li style={{ marginBottom: 8 }}>Select the destination list</li>
                    </ul>
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <h4 style={{ color: '#6366f1', marginBottom: 10 }}>Other Actions:</h4>
                    <ul style={{ paddingLeft: 25 }}>
                      <li style={{ marginBottom: 8 }}><strong>Assign tasks</strong> to team members</li>
                      <li style={{ marginBottom: 8 }}><strong>Delete tasks</strong> when no longer needed</li>
                      <li style={{ marginBottom: 8 }}><strong>Create custom lists</strong> for your workflow</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeStep === 5 && (
              <div>
                <h3 style={{ fontSize: '1.8rem', marginBottom: 20, color: '#3b82f6' }}>
                  👥 Step 5: Collaborate with Your Team
                </h3>
                <div style={{ lineHeight: 1.8, fontSize: '1.1rem' }}>
                  <p style={{ marginBottom: 15 }}>Share boards and work together in real-time:</p>
                  <div style={{ marginBottom: 20 }}>
                    <h4 style={{ color: '#6366f1', marginBottom: 10 }}>Share a Board:</h4>
                    <ol style={{ paddingLeft: 25 }}>
                      <li style={{ marginBottom: 8 }}>Open the board you want to share</li>
                      <li style={{ marginBottom: 8 }}>Click the <strong>"Share"</strong> button</li>
                      <li style={{ marginBottom: 8 }}>A shareable link is copied to your clipboard</li>
                      <li style={{ marginBottom: 8 }}>Send this link to your team members</li>
                      <li style={{ marginBottom: 8 }}>They can view and collaborate on the board</li>
                    </ol>
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <h4 style={{ color: '#6366f1', marginBottom: 10 }}>Real-time Magic:</h4>
                    <ul style={{ paddingLeft: 25 }}>
                      <li style={{ marginBottom: 8 }}>See changes instantly as teammates work</li>
                      <li style={{ marginBottom: 8 }}>No page refresh needed</li>
                      <li style={{ marginBottom: 8 }}>Everyone stays synchronized</li>
                      <li style={{ marginBottom: 8 }}>View activity history for full transparency</li>
                    </ul>
                  </div>
                  <div style={{ 
                    background: '#f5f3ff', 
                    padding: 15, 
                    borderRadius: 8, 
                    marginTop: 20,
                    borderLeft: '4px solid #8b5cf6'
                  }}>
                    <strong>🎉 You're all set!</strong> Start organizing your projects and collaborating with your team.
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Arrows */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 30, paddingTop: 20, borderTop: '1px solid #eee' }}>
              <button 
                onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
                disabled={activeStep === 1}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: 6,
                  background: activeStep === 1 ? '#e5e7eb' : '#3b82f6',
                  color: activeStep === 1 ? '#9ca3af' : 'white',
                  cursor: activeStep === 1 ? 'not-allowed' : 'pointer',
                  fontWeight: '600'
                }}
              >
                ← Previous
              </button>
              <span style={{ color: '#6b7280', fontSize: '0.9rem', alignSelf: 'center' }}>
                {activeStep} of 5
              </span>
              <button 
                onClick={() => setActiveStep(Math.min(5, activeStep + 1))}
                disabled={activeStep === 5}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: 6,
                  background: activeStep === 5 ? '#e5e7eb' : '#3b82f6',
                  color: activeStep === 5 ? '#9ca3af' : 'white',
                  cursor: activeStep === 5 ? 'not-allowed' : 'pointer',
                  fontWeight: '600'
                }}
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Start Guide */}
      <div className="container" style={{ marginTop: 60, marginBottom: 60 }}>
        <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: 30 }}>Quick Reference</h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: 20,
          maxWidth: 1000,
          margin: '0 auto'
        }}>
          <div className="quick-ref-card" style={{ background: 'white', padding: 20, borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h4 style={{ color: '#3b82f6', marginBottom: 10 }}>🎨 Create Lists</h4>
            <p style={{ fontSize: '0.95rem', color: '#666' }}>
              Custom lists beyond To Do, In Progress, Done? Just use the "Create list" form to add your own!
            </p>
          </div>
          <div className="quick-ref-card" style={{ background: 'white', padding: 20, borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h4 style={{ color: '#3b82f6', marginBottom: 10 }}>👤 Assign Tasks</h4>
            <p style={{ fontSize: '0.95rem', color: '#666' }}>
              Use the assignee dropdown on each task to assign work to specific team members.
            </p>
          </div>
          <div className="quick-ref-card" style={{ background: 'white', padding: 20, borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h4 style={{ color: '#3b82f6', marginBottom: 10 }}>🔗 Share Links</h4>
            <p style={{ fontSize: '0.95rem', color: '#666' }}>
              Share links expire after 7 days for security. Generate a new one if needed!
            </p>
          </div>
          <div className="quick-ref-card" style={{ background: 'white', padding: 20, borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h4 style={{ color: '#3b82f6', marginBottom: 10 }}>📊 Activity Log</h4>
            <p style={{ fontSize: '0.95rem', color: '#666' }}>
              View all board activities on the right side - see who did what and when.
            </p>
          </div>
        </div>
      </div>

    </div>
  )
}
