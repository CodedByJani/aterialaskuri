const mongoose = require('mongoose')

const ActivityLogSchema = new mongoose.Schema({
    email: { type: String, required: true },
    action: { type: String, required: true },
    details: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now }
})

module.exports = mongoose.model('ActivityLog', ActivityLogSchema)