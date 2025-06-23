const mongoose = require('mongoose');

const patrolSchema = new mongoose.Schema({
  hostId: { type: String, required: true },
  channelId: { type: String, required: true },
  scheduledTime: { type: Date, required: true },
  attendees: { type: [String], default: [] },
  ended: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Patrol', patrolSchema);
