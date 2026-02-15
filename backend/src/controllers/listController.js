const List = require('../models/List')
const Board = require('../models/Board')
const Task = require('../models/Task')

module.exports = function(io) {
  return {
    createList: async (req, res) => {
      try {
        const { title, position } = req.body
        const { boardId } = req.params
        if (!boardId) return res.status(400).json({ error: 'boardId is required in URL' })
        if (!title) return res.status(400).json({ error: 'title is required' })

        // simple existence check (no complex permissions)
        const board = await Board.findById(boardId)
        if (!board) return res.status(404).json({ error: 'Board not found' })

        // place new list at position 0 by default for easier UX (frontend can prepend)
        const lst = new List({ title, board: boardId, position: position != null ? position : 0 })
        await lst.save()
        try {
          const Activity = require('../models/Activity')
          let actorName = undefined
          if (req.userId) {
            try { const U = require('../models/User'); const uu = await U.findById(req.userId); if (uu) actorName = uu.name || uu.email } catch(e) {}
          }
          const a = new Activity({ board: boardId, list: lst._id, actor: req.userId, actorName, type: 'list:created', data: { title: lst.title } })
          await a.save()
          try { io.to(String(boardId)).emit('activity:created', a) } catch(e) { io.emit('activity:created', a) }
        } catch(e) {}
        try { io.to(String(boardId)).emit('list:created', lst) } catch(e) { io.emit('list:created', lst) }
        res.status(201).json({ list: lst })
      } catch (err) {
        res.status(500).json({ error: err.message })
      }
    },

    getListsForBoard: async (req, res) => {
      try {
        const { boardId } = req.params
        if (!boardId) return res.status(400).json({ error: 'boardId is required in URL' })

        // allow access if authenticated OR if a valid share token is provided
        const board = await Board.findById(boardId)
        if (!board) return res.status(404).json({ error: 'Board not found' })

        const provided = req.query.share || req.query.shareToken
        const ok = req.userId || (provided && board.shareToken && String(provided) === String(board.shareToken) && (!board.shareExpires || board.shareExpires > new Date()))
        if (!ok) return res.status(401).json({ error: 'unauthorized' })

        const lists = await List.find({ board: boardId }).sort({ position: 1, createdAt: 1 })
        res.json({ lists })
      } catch (err) {
        res.status(500).json({ error: err.message })
      }
    },

    deleteList: async (req, res) => {
      try {
        const { boardId, listId } = req.params
        if (!boardId || !listId) return res.status(400).json({ error: 'boardId and listId required' })

        const list = await List.findOneAndDelete({ _id: listId, board: boardId })
        if (!list) return res.status(404).json({ error: 'List not found' })

        // remove tasks that belonged to this list (simple cleanup)
        await Task.deleteMany({ list: listId })
        try {
          const Activity = require('../models/Activity')
          let actorName = undefined
          if (req.userId) {
            try { const U = require('../models/User'); const uu = await U.findById(req.userId); if (uu) actorName = uu.name || uu.email } catch(e) {}
          }
          const a = new Activity({ board: boardId, list: listId, actor: req.userId, actorName, type: 'list:deleted', data: { id: listId, title: list.title } })
          await a.save()
          try { io.to(String(boardId)).emit('activity:created', a) } catch(e) { io.emit('activity:created', a) }
        } catch(e) {}
        try { io.to(String(boardId)).emit('list:deleted', { id: listId }) } catch(e) { io.emit('list:deleted', { id: listId }) }

        res.json({ id: listId })
      } catch (err) {
        res.status(500).json({ error: err.message })
      }
    }
  }
}
