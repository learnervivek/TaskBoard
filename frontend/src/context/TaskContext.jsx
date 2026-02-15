import React, { createContext, useReducer, useEffect } from 'react'
import requests from '../api/requests'

const TaskContext = createContext()

const initialState = { tasks: [] }

function reducer(state, action) {
  switch (action.type) {
    case 'SET_TASKS':
      return { ...state, tasks: action.payload }
    case 'ADD_TASK': {
        // avoid duplicates if task already exists
        if (state.tasks.find(t => String(t._id) === String(action.payload._id))) return state
        return { ...state, tasks: [action.payload, ...state.tasks] }
      if (exists) return state
      return { ...state, tasks: [action.payload, ...state.tasks] }
    }
    case 'UPDATE_TASK':
      return { ...state, tasks: state.tasks.map(t => (t._id === action.payload._id ? action.payload : t)) }
    case 'REMOVE_TASK':
      return { ...state, tasks: state.tasks.filter(t => t._id !== action.payload) }
    default:
      return state
  }
}

export function TaskProvider({ children, socket }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    async function load() {
      const res = await requests.get('/tasks')
      dispatch({ type: 'SET_TASKS', payload: res.data })
    }
    load()
  }, [])

  useEffect(() => {
    if (!socket) return
    socket.on('task:created', task => dispatch({ type: 'ADD_TASK', payload: task }))
    socket.on('task:updated', task => dispatch({ type: 'UPDATE_TASK', payload: task }))
    socket.on('task:deleted', ({ id }) => dispatch({ type: 'REMOVE_TASK', payload: id }))
    return () => {
      socket.off('task:created')
      socket.off('task:updated')
      socket.off('task:deleted')
    }
  }, [socket])

  const createTask = async (payload) => {
    const { share, shareToken, ...body } = payload || {}
    const headers = {}
    if (share || shareToken) headers['X-Share-Token'] = share || shareToken
    const res = await requests.post('/tasks', body, { headers })
    // update local state immediately with created task
    if (res && res.data) dispatch({ type: 'ADD_TASK', payload: res.data })
    return res && res.data
  }

  const updateTask = async (id, payload) => {
    const { share, shareToken, ...body } = payload || {}
    const headers = {}
    if (share || shareToken) headers['X-Share-Token'] = share || shareToken
    await requests.put(`/tasks/${id}`, body, { headers })
  }

  const deleteTask = async (id, options = {}) => {
    const headers = {}
    const share = options.share || options.shareToken
    if (share) headers['X-Share-Token'] = share
    await requests.delete(`/tasks/${id}`, { headers })
  }

  const moveTask = async (id, listId) => {
    // allow passing third param as share token: moveTask(id, listId, share)
    let headers = {}
    // caller may set a global `share` variable in payload; we'll accept listId as object sometimes
    if (typeof listId === 'object' && listId !== null) {
      const { list, share } = listId
      if (share) headers['X-Share-Token'] = share
      await requests.post(`/tasks/${id}/move`, { list }, { headers })
      return
    }
    await requests.post(`/tasks/${id}/move`, { list: listId }, { headers })
  }

  const joinBoard = (boardId) => {
    if (!socket || !boardId) return
    socket.emit('joinBoard', boardId)
  }

  const leaveBoard = (boardId) => {
    if (!socket || !boardId) return
    socket.emit('leaveBoard', boardId)
  }

  return (
    <TaskContext.Provider value={{ state, dispatch, createTask, updateTask, deleteTask, moveTask, joinBoard, leaveBoard, socket }}>
      {children}
    </TaskContext.Provider>
  )
}

export default TaskContext
