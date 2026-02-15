import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { TaskProvider } from './context/TaskContext'
import { AuthProvider } from './context/AuthContext'
import { io } from 'socket.io-client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'

const socket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000')

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <TaskProvider socket={socket}>
          <App />
        </TaskProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
