const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  discordId: { type: String, required: true, unique: true },
  minutes: { type: Number, default: 0 },
  isTracking: { type: Boolean, default: false },
  trackingStart: { type: Date, default: null }
});

module.exports = mongoose.model('User', userSchema);