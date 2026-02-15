const mongoose = require('mongoose')

const BoardSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  // optional public share token (allows temporal/unlisted access)
  shareToken: { type: String, default: null },
  shareExpires: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
})

// quick lookup of boards for a user
BoardSchema.index({ owner: 1 })

module.exports = mongoose.model('Board', BoardSchema)
