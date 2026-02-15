import React, { useContext, useEffect, useState } from 'react'
import TaskContext from '../context/TaskContext'
import requests from '../api/requests'

export default function BoardView({ initialBoardId }) {
  const { state, joinBoard, leaveBoard } = useContext(TaskContext)
  const [boardIdInput, setBoardIdInput] = useState(initialBoardId || '')
  const [openBoardId, setOpenBoardId] = useState('')
  const [lists, setLists] = useState([])

  useEffect(() => {
    if (!openBoardId) return
    // join socket room
    joinBoard(openBoardId)
    // fetch lists for board
    let mounted = true
    requests.get(`/boards/${openBoardId}/lists`).then(r => {
      if (mounted) setLists(r.data.lists || [])
    }).catch(() => {})
    return () => {
      mounted = false
      leaveBoard(openBoardId)
    }
  }, [openBoardId])

  const tasksForList = (listId) => state.tasks.filter(t => String(t.board) === String(openBoardId) && String(t.list) === String(listId))

  const openBoard = () => {
    if (!boardIdInput) return
    setOpenBoardId(boardIdInput)
  }

  const closeBoard = () => {
    if (openBoardId) leaveBoard(openBoardId)
    setOpenBoardId('')
    setLists([])
  }

  return (
    <div style={{ marginTop: 20 }}>
      <h3>Board View</h3>
      <div style={{ marginBottom: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
        <input placeholder="Enter boardId" value={boardIdInput} onChange={e=>setBoardIdInput(e.target.value)} />
        <button onClick={openBoard}>Open</button>
        {openBoardId && <button onClick={closeBoard}>Close</button>}
      </div>

      {openBoardId ? (
        <div>
          <div style={{ display: 'flex', gap: 12 }}>
            {lists.map(list => (
              <div key={list._id} style={{ minWidth: 200, padding: 8, border: '1px solid #ddd', borderRadius: 6 }}>
                <h4>{list.title}</h4>
                {tasksForList(list._id).map(t => (
                  <div key={t._id} style={{ padding: 6, marginBottom: 6, background: '#fff' }}>{t.title}</div>
                ))}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ color: '#666' }}>No board opened. Enter an id and click "Open".</div>
      )}
    </div>
  )
}
