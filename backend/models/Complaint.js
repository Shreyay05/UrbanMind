const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  text:        { type: String, required: true },
  category:    { type: String, default: 'General' },
  priority:    { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
  location:    { type: String, default: 'Unknown' },
  citizenName: { type: String, default: 'Anonymous' },
  status:      { type: String, default: 'Pending' },
  lat:         { type: Number },
  lng:         { type: Number },
  adminReply:  { type: String, default: '' },
  closedAt:    { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);