import React, { useState, useContext } from 'react'
import TaskContext from '../context/TaskContext'

export default function TaskForm() {
  const { createTask } = useContext(TaskContext)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    if (!title) return
    await createTask({ title, description })
    setTitle('')
    setDescription('')
  }

  return (
    <form onSubmit={submit} style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
      <input placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
      <input placeholder="Description" value={description} onChange={e=>setDescription(e.target.value)} />
      <button type="submit">Add</button>
    </form>
  )
}
