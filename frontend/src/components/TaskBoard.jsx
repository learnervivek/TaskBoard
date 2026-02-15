import React, { useContext } from 'react'
import TaskContext from '../context/TaskContext'
import TaskCard from './TaskCard'

const STATUSES = ['todo', 'in-progress', 'done']

export default function TaskBoard() {
  const { state } = useContext(TaskContext)

  return (
    <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
      {STATUSES.map(status => (
        <div key={status} style={{ flex: 1, padding: 8, border: '1px solid #ddd', borderRadius: 6 }}>
          <h4 style={{ textTransform: 'capitalize' }}>{status.replace('-', ' ')}</h4>
          {state.tasks.filter(t => t.status === status).map(task => (
            <TaskCard key={task._id} task={task} />
          ))}
        </div>
      ))}
    </div>
  )
}
