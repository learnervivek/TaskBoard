
const mongoose = require('mongoose')

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  board: { type: mongoose.Schema.Types.ObjectId, ref: 'Board', required: true },
  list: { type: mongoose.Schema.Types.ObjectId, ref: 'List', required: true },
  assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['todo', 'in-progress', 'done'], default: 'todo' },
  position: { type: Number, default: 0 },
  dueDate: { type: Date }
}, { timestamps: true })

// indexes for common queries
TaskSchema.index({ board: 1, list: 1, position: 1 })
TaskSchema.index({ assignee: 1 })
TaskSchema.index({ board: 1, status: 1 })

module.exports = mongoose.model('Task', TaskSchema)
