import React, { useEffect, useState, useContext } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import requests from '../api/requests'
import TaskContext from '../context/TaskContext'
import AuthContext from '../context/AuthContext'

export default function BoardPage() {
  const { id } = useParams()
  const { search } = useLocation()
  const share = new URLSearchParams(search).get('share')
  const { state, createTask, moveTask, dispatch, joinBoard, leaveBoard, updateTask, deleteTask } = useContext(TaskContext)
  const { socket } = useContext(TaskContext)
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const [lists, setLists] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [boardUsers, setBoardUsers] = useState([])
  const [activities, setActivities] = useState([])
  const [selectedList, setSelectedList] = useState('')
  const [newListTitle, setNewListTitle] = useState('')
  const [isSaved, setIsSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [boardOwnerId, setBoardOwnerId] = useState(null)

  // Check if user is already a collaborator on this board
  useEffect(() => {
    if (share && user && boardUsers.length > 0) {
      const isCollaborator = boardUsers.some(u => String(u._id) === String(user._id))
      setIsSaved(isCollaborator)
    }
  }, [boardUsers, user, share])

  // User can assign if they are owner or collaborator (just check if they are in the board users)
  const userRole = boardUsers.find(u => String(u._id) === String(user?._id))
  const canAssign = userRole && (userRole.role === 'owner' || userRole.role === 'collaborator')

  // Debug log
  useEffect(() => {
    console.log('Debug - boardUsers:', boardUsers)
    console.log('Debug - user._id:', user?._id)
    console.log('Debug - userRole:', userRole)
    console.log('Debug - canAssign:', canAssign)
  }, [user, boardUsers, userRole, canAssign])


  useEffect(() => {
    if (!id) return

    // load activities from localStorage first (cached data)
    const cachedActivities = localStorage.getItem(`activities_${id}`)
    if (cachedActivities) {
      try {
        setActivities(JSON.parse(cachedActivities))
      } catch (e) { }
    }

    const q = share ? `?share=${encodeURIComponent(share)}` : ''
    requests.get(`/boards/${id}/lists${q}`).then(r => {
      setLists(r.data.lists)
      if (r.data.lists[0]) setSelectedList(r.data.lists[0]._id)
    }).catch(() => { })
    // load board users (owner + collaborators)
    requests.get(`/boards/${id}/users${q}`).then(r => {
      setBoardUsers(r.data.users || [])
      // set owner ID from response
      if (r.data.ownerId) setBoardOwnerId(r.data.ownerId)
    }).catch(() => { })
    requests.get(`/boards/${id}/activities${q}`).then(r => {
      // save to localStorage when fetched from API
      localStorage.setItem(`activities_${id}`, JSON.stringify(r.data.activities || []))
      setActivities(r.data.activities || [])
    }).catch(() => { })
  }, [id])

  useEffect(() => {
    if (!id) return
    joinBoard(id)
    let cleanup = () => { }
    if (socket) {
      const onCreated = (lst) => { if (String(lst.board) !== String(id)) return; setLists(prev => [lst, ...prev]) }
      const onDeleted = ({ id: listId }) => { setLists(prev => prev.filter(l => l._id !== listId)); const tasksToRemove = state.tasks.filter(t => String(t.list) === String(listId)); tasksToRemove.forEach(t => dispatch({ type: 'REMOVE_TASK', payload: t._id })) }
      const onBoardDeleted = ({ boardId }) => { if (String(boardId) !== String(id)) return; alert('This board was deleted'); navigate('/') }
      const onActivity = (act) => {
        if (String(act.board) !== String(id)) return
        setActivities(prev => {
          const updated = [act, ...prev]
          // save to localStorage when activity is received
          localStorage.setItem(`activities_${id}`, JSON.stringify(updated))
          return updated
        })
      }
      socket.on('list:created', onCreated)
      socket.on('list:deleted', onDeleted)
      socket.on('board:deleted', onBoardDeleted)
      socket.on('activity:created', onActivity)
      cleanup = () => {
        socket.off('list:created', onCreated)
        socket.off('list:deleted', onDeleted)
        socket.off('board:deleted', onBoardDeleted)
        socket.off('activity:created', onActivity)
      }
    }

    return () => { cleanup(); leaveBoard(id) }
  }, [id])

  const submit = async (e) => {
    e.preventDefault()
    if (!title) return alert('Please enter a task title')
    if (!selectedList) return alert('Please select a list or create one first')
    try {
      await createTask({ title, description, board: id, list: selectedList, share })
    } catch (err) {
      alert(err.response?.data?.error || err.message)
    }
    setTitle('')
    setDescription('')
  }

  const createList = async (e) => {
    e.preventDefault()
    if (!newListTitle) return
    try {
      const res = await requests.post(`/boards/${id}/lists`, { title: newListTitle, position: 0 })
      const created = res.data.list
      // let socket event handle state update to avoid duplicates
      setSelectedList(created._id)
      setNewListTitle('')
    } catch (err) {
      alert(err.response?.data?.error || err.message)
    }
  }

  const handleMove = async (taskId, newListId) => {
    await moveTask(taskId, newListId, share)
  }

  // Native drag handlers
  const onDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', taskId)
  }

  const onDragOver = (e) => {
    e.preventDefault()
  }

  const onDrop = async (e, destListId) => {
    e.preventDefault()
    const taskId = e.dataTransfer.getData('text/plain')
    if (!taskId) return
    await moveTask(taskId, destListId)
  }

  const tasksForList = (listId) => state.tasks.filter(t => String(t.board) === String(id) && String(t.list) === String(listId))

  const deleteList = async (listId) => {
    if (!confirm('Delete this list and its tasks?')) return
    try {
      await requests.delete(`/boards/${id}/lists/${listId}`)
      setLists(prev => prev.filter(l => l._id !== listId))
      // remove tasks from context state
      const tasksToRemove = state.tasks.filter(t => String(t.list) === String(listId))
      tasksToRemove.forEach(t => dispatch({ type: 'REMOVE_TASK', payload: t._id }))
      if (selectedList === listId) setSelectedList(lists[0]?._id || '')
    } catch (err) {
      alert(err.response?.data?.error || err.message)
    }
  }

  const saveSharedBoard = async () => {
    if (!share) return alert('No share token found')
    setIsSaving(true)
    try {
      await requests.post(`/boards/${id}/save`, { share })
      setIsSaved(true)
      alert('Board saved to your profile!')
    } catch (err) {
      alert(err.response?.data?.error || err.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Board</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          {share && !isSaved && (
            <button onClick={saveSharedBoard} disabled={isSaving} style={{ background: '#10b981', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: isSaving ? 'not-allowed' : 'pointer' }}>
              {isSaving ? 'Saving...' : 'Save to my boards'}
            </button>
          )}
          {share && isSaved && (
            <span style={{ color: '#10b981', fontWeight: 600 }}>✓ Saved</span>
          )}
          {!share && (
            <button onClick={async () => {
              try {
                const res = await requests.post(`/boards/${id}/share`)
                const path = res.data.sharePath || res.data.shareUrl
                const url = window.location.origin + path
                await navigator.clipboard.writeText(url)
                alert('Share link copied to clipboard: ' + url)
              } catch (e) { alert(e.response?.data?.error || e.message) }
            }}>Share</button>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}>
          {/* Create list form (placed above task form per request) */}
          <div style={{ marginBottom: 12 }}>
            <form onSubmit={createList} style={{ display: 'flex', gap: 8 }}>
              <input placeholder="New list title" value={newListTitle} onChange={e => setNewListTitle(e.target.value)} />
              <button type="submit">Create list</button>
            </form>
          </div>

          {/* Task form now below create-list */}
          <form onSubmit={submit} style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <input placeholder="Task title" value={title} onChange={e => setTitle(e.target.value)} />
            <input placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
            <select value={selectedList} onChange={e => setSelectedList(e.target.value)}>
              {lists.map(l => <option key={l._id} value={l._id}>{l.title}</option>)}
            </select>
            <button type="submit">Add Task</button>
          </form>

          <div style={{ display: 'flex', gap: 12 }}>
            {lists.map(list => (
              <div key={list._id} onDragOver={onDragOver} onDrop={(e) => onDrop(e, list._id)} style={{ minWidth: 220, background: '#fff', padding: 8, border: '1px solid #eee', borderRadius: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ margin: 0 }}>{list.title}</h4>
                  <button onClick={() => deleteList(list._id)} style={{ color: 'red' }}>Delete</button>
                </div>
                {tasksForList(list._id).map((t) => (
                  <div key={t._id} draggable onDragStart={(e) => onDragStart(e, t._id)} style={{ padding: 6, marginBottom: 6, border: '1px solid #f0f0f0' }}>
                    <div style={{ fontWeight: 600 }}>{t.title}</div>
                    <div style={{ fontSize: 12, color: '#666' }}>{t.description}</div>
                    <div style={{ marginTop: 6, display: 'flex', gap: 8 }}>
                      <button onClick={async () => { if (!confirm('Delete task?')) return; await deleteTask(t._id, { share }) }}>Delete</button>
                      <select onChange={e => handleMove(t._id, e.target.value)} defaultValue="">
                        <option value="">Move to...</option>
                        {lists.filter(l => l._id !== list._id).map(l2 => (
                          <option key={l2._id} value={l2._id}>{l2.title}</option>
                        ))}
                      </select>
                      {canAssign ? (
                        <select value={t.assignee || ''} onChange={async (e) => {
                          const val = e.target.value || null
                          try {
                            await updateTask(t._id, { assignee: val })
                          } catch (err) { alert(err.response?.data?.error || err.message) }
                        }}>
                          <option value="">Unassigned</option>
                          {boardUsers.map(u => (
                            <option key={u._id} value={u._id}>{u.name || u.email}</option>
                          ))}
                        </select>
                      ) : (
                        <span style={{ fontSize: 12, color: '#999' }}>Assigned to: {t.assignee ? boardUsers.find(u => String(u._id) === String(t.assignee))?.name || 'Unknown' : 'Unassigned'}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
          {/* Activity feed */}
          <div style={{ marginLeft: 16, minWidth: 260 }}>
            <h4>Activity</h4>
            <div style={{ maxHeight: 400, overflowY: 'auto', background: '#fff', padding: 8, border: '1px solid #eee', borderRadius: 6 }}>
              {activities.length === 0 && <div style={{ color: '#666' }}>No recent activity</div>}
              {activities.map(a => (
                <div key={a._id} style={{ padding: 6, borderBottom: '1px solid #f4f4f4' }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{a.type}</div>
                  <div style={{ fontSize: 12, color: '#444' }}>{a.actorName || (a.actor || '').toString()}</div>
                  <div style={{ fontSize: 12, color: '#666' }}>{new Date(a.createdAt).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
