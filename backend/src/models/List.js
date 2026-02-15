const mongoose = require('mongoose')

const ListSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  board: { type: mongoose.Schema.Types.ObjectId, ref: 'Board', required: true },
  position: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
})

// index to get lists for a board in order
ListSchema.index({ board: 1, position: 1 })

module.exports = mongoose.model('List', ListSchema)
