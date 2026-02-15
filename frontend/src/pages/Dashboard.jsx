import React, { useEffect, useState, useContext, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import requests from '../api/requests'
import { Link } from 'react-router-dom'
import AuthContext from '../context/AuthContext'
import BoardCard from '../components/BoardCard'

export default function Dashboard(){
  const [boards, setBoards] = useState([])
  const [title, setTitle] = useState('')
  const { user } = useContext(AuthContext)
  const { search } = useLocation()
  const q = new URLSearchParams(search).get('search') || ''

  const filtered = useMemo(() => {
    if (!q) return boards
    const s = q.toLowerCase()
    return boards.filter(b => (b.title || '').toLowerCase().includes(s) || (b.description || '').toLowerCase().includes(s))
  }, [boards, q])

  useEffect(()=>{
    requests.get('/boards').then(r=>setBoards(r.data.boards)).catch(()=>{})
  },[])

  const create = async (e)=>{
    e.preventDefault()
    if(!title) return
    const res = await requests.post('/boards', { title })
    setBoards([res.data.board, ...boards])
    setTitle('')
  }

  return (
    <div className="container">
      <header className="dashboard-header">
        <div>
          <div className="dashboard-title">Welcome{user ? `, ${user.name}` : ''}</div>
          <div style={{ color:'#475569', marginTop:4 }}>Manage your boards and collaborate in real-time</div>
        </div>
        <div className="toolbar">
          <form onSubmit={create} style={{ display:'flex', gap:8 }}>
            <input placeholder="New board title" value={title} onChange={e=>setTitle(e.target.value)} />
            <button type="submit" className="btn btn-primary">Create</button>
          </form>
        </div>
      </header>

      <h2 style={{ marginTop:20 }}>Your Boards</h2>

      <div className="board-grid">
        {filtered.map(b=> (
          <BoardCard key={b._id} board={b} onDelete={async (boardId)=>{
            try{
              await requests.delete(`/boards/${boardId}`)
              setBoards(prev => prev.filter(x=> x._id !== boardId))
            }catch(e){alert(e.response?.data?.error || e.message)}
          }} />
        ))}
      </div>
    </div>
  )
}
