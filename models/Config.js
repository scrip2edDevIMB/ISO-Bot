const mongoose = require('mongoose');

const configSchema = new mongoose.Schema({
  weeklyRequirement: { type: Number, default: 100 } // Example: 100 minutes
});

module.exports = mongoose.model('Config', configSchema);