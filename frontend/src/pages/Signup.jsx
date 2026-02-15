import React, { useState, useContext } from 'react'
import AuthContext from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'

export default function Signup() {
  const { signup } = useContext(AuthContext)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    try {
      await signup(name, email, password)
      navigate('/dashboard')
    } catch (err) {
      alert(err.response?.data?.error || err.message)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-left">
          <h1>Create account</h1>
          <p className="muted">Start collaborating with your team in seconds.</p>
        </div>

        <div className="auth-form">
          <form onSubmit={submit} className="form-grid">
            <label className="label">Full name</label>
            <input className="input" placeholder="Your name" value={name} onChange={e=>setName(e.target.value)} />

            <label className="label">Email</label>
            <input className="input" placeholder="you@company.com" value={email} onChange={e=>setEmail(e.target.value)} />

            <label className="label">Password</label>
            <input className="input" type="password" placeholder="Choose a password" value={password} onChange={e=>setPassword(e.target.value)} />

            <button className="btn btn-primary" type="submit">Create account</button>
            <div className="row muted" style={{ justifyContent: 'center' }}>
              Already have an account? <Link to="/login" style={{ marginLeft:8 }}>Sign in</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
