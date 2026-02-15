const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String },
  createdAt: { type: Date, default: Date.now }
})

// index for quick lookup by email
UserSchema.index({ email: 1 })

module.exports = mongoose.model('User', UserSchema)
