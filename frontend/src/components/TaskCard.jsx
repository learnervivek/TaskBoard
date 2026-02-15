import React, { useContext } from 'react'
import TaskContext from '../context/TaskContext'

export default function TaskCard({ task }) {
  const { updateTask, deleteTask } = useContext(TaskContext)
  return (
    <div style={{ background: '#fff', padding: 8, marginBottom: 8, borderRadius: 6, boxShadow: '0 0 0 1px #eee' }}>
      <strong>{task.title}</strong>
      <div style={{ fontSize: 12, color: '#555' }}>{task.description}</div>
      <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
        <button onClick={() => deleteTask(task._id)} style={{ marginLeft: 'auto', color: 'red' }}>Delete</button>
      </div>
    </div>
  )
}
