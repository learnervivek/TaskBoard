import React, { useContext } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import AuthContext from '../context/AuthContext'

export default function PrivateRoute({ children }) {
  const { user, loading } = useContext(AuthContext)
  const { search } = useLocation()
  const share = new URLSearchParams(search).get('share')

  // Wait for auth to load from localStorage
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>

  // allow access if logged in OR a share token is present in the URL
  if (!user && !share) return <Navigate to="/login" replace />
  return children
}
