import React, { useState, useContext } from 'react'
import AuthContext from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'

export default function Login() {
  const { login } = useContext(AuthContext)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      alert(err.response?.data?.error || err.message)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-left">
          <h1>Welcome back</h1>
          <p className="muted">Sign in to continue to your collaborative boards.</p>
        </div>

        <div className="auth-form">
          <form onSubmit={submit} className="form-grid">
            <label className="label">Email</label>
            <input className="input" placeholder="you@company.com" value={email} onChange={e=>setEmail(e.target.value)} />

            <label className="label">Password</label>
            <input className="input" type="password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} />

            <button className="btn btn-primary" type="submit">Sign in</button>
            <div className="row muted" style={{ justifyContent: 'center' }}>
              Don’t have an account? <Link to="/signup" style={{ marginLeft:8 }}>Create one</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
