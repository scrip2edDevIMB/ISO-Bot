const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  discordId: { type: String, required: true, unique: true },
  minutes: { type: Number, default: 0 },
  isTracking: { type: Boolean, default: false },
  lastStart: { type: Date, default: null },
  patrols: { type: Number, default: 0 },
});

module.exports = mongoose.model('User', userSchema);
