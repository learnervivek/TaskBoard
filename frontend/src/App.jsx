import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Routes, Route, Link } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import BoardPage from './pages/BoardPage'
import Home from './pages/Home'
import Footer from './components/Footer'
import PrivateRoute from './components/PrivateRoute'
import AuthContext from './context/AuthContext'

export default function App() {
  const { user, logout } = useContext(AuthContext)

  const [q, setQ] = useState('')
  const navigate = useNavigate()

  const onSearchKey = (e) => {
    if (e.key === 'Enter') {
      const val = q.trim()
      if (val) navigate(`/dashboard?search=${encodeURIComponent(val)}`)
      else navigate('/dashboard')
    }
  }

  return (
    <div>
      <header className="site-header">
        <div className="container" style={{ display:'flex', alignItems:'center', gap:16 }}>
          <div className="site-logo">
            <Link to="/" style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:36, height:36, borderRadius:8, background:'linear-gradient(135deg,#6366f1,#06b6d4)' }}></div>
              <div style={{ fontWeight:700 }}>TaskBoard</div>
            </Link>
          </div>

          <div className="search-wrap" style={{ flex:1 }}>
            <input className="search" placeholder="Search boards, tasks..." value={q} onChange={e=>setQ(e.target.value)} onKeyDown={onSearchKey} />
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <Link to="/dashboard" className="btn btn-ghost">Dashboard</Link>
            {user ? (
              <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                <div style={{ fontSize:14, color:'#0f172a' }}>{user.name}</div>
                <button className="btn btn-ghost" onClick={logout}>Logout</button>
              </div>
            ) : (
              <div style={{ display:'flex', gap:8 }}>
                <Link to="/login" className="btn btn-ghost">Login</Link>
                <Link to="/signup" className="btn btn-primary">Signup</Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard/></PrivateRoute>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/signup" element={<Signup/>} />
          <Route path="/board/:id" element={<PrivateRoute><BoardPage/></PrivateRoute>} />
        </Routes>
      </main>

      <Footer />
    </div>
  )
}
