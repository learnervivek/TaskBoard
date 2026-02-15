const mongoose = require('mongoose')

const ActivitySchema = new mongoose.Schema({
  board: { type: mongoose.Schema.Types.ObjectId, ref: 'Board', required: true },
  list: { type: mongoose.Schema.Types.ObjectId, ref: 'List' },
  task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  actorName: { type: String },
  type: { type: String, required: true }, // e.g. 'task:created', 'task:updated', 'task:deleted', 'list:created', 'list:deleted', 'board:deleted', 'task:assigned'
  data: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now }
})

ActivitySchema.index({ board: 1, createdAt: -1 })

module.exports = mongoose.model('Activity', ActivitySchema)
