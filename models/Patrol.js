const mongoose = require('mongoose');

const patrolSchema = new mongoose.Schema({
  patrolNumber: { type: Number, unique: true },
  hostId: String,
  channelId: String,
  scheduledTime: Date,
  attendees: [String],
  ended: { type: Boolean, default: false }
});

module.exports = mongoose.model('Patrol', patrolSchema);
