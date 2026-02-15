import React from 'react'
import { Link } from 'react-router-dom'

export default function BoardCard({ board, onDelete }){
  return (
    <div className="board-card">
      <div className="board-card-header">
        <div className="board-title">{board.title}</div>
      </div>
      <div className="board-card-body">
        <div className="board-meta">{board.description || 'No description'}</div>
      </div>
      <div className="board-card-footer">
        <Link to={`/board/${board._id}`} className="btn btn-primary">Open</Link>
        <button className="btn btn-ghost" onClick={()=>onDelete && onDelete(board._id)}>Delete</button>
      </div>
    </div>
  )
}
