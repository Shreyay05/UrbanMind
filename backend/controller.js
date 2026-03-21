const Complaint = require('./models/Complaint');
const axios = require('axios');

// Seed CSV data once into DB (run only if collection is empty)
const seedCSV = async () => {
  const count = await Complaint.countDocuments();
  if (count > 0) return; // already seeded

  const fs = require('fs');
  const csv = require('csv-parser');
  const path = require('path');
  const rows = [];

  fs.createReadStream(path.join(__dirname, 'municipal_complaints.csv'))
    .pipe(csv())
    .on('data', (row) => {
      const text = row.complaints || '';
      rows.push({
        text,
        category: row.category || 'General',
        priority: /urgent|emergency|fire/i.test(text) ? 'High' : 'Medium',
        status: 'Resolved',
        lat: 28.6 + (Math.random() - 0.5) * 0.1,
        lng: 77.2 + (Math.random() - 0.5) * 0.1,
      });
    })
    .on('end', async () => {
      await Complaint.insertMany(rows);
      console.log(`✅ Seeded ${rows.length} complaints into MongoDB`);
    });
};

seedCSV();

exports.getAllComplaints = async (req, res) => {
  const complaints = await Complaint.find().sort({ createdAt: -1 }).lean();
  res.json(complaints.map(c => ({ ...c, id: c._id })));
};

exports.createComplaint = async (req, res) => {
  const { text, location, citizenName, lat, lng } = req.body;
  if (!text) return res.status(400).json({ error: 'Text is required' });

  let category = 'General', priority = 'Low';

  try {
    const mlRes = await axios.post('http://127.0.0.1:8000/predict', { text });
    category = mlRes.data.prediction.predicted_department;
    priority = mlRes.data.prediction.priority_level;
  } catch {
    if (/water|leak|pipe/i.test(text)) category = 'Water';
    else if (/light|power|electric/i.test(text)) category = 'Electricity';
  }

  const complaint = await Complaint.create({
    text, category, priority,
    location: location || 'Unknown',
    citizenName: citizenName || 'Anonymous',
    status: 'Pending',
    lat: lat || 28.6139,
    lng: lng || 77.2090,
  });

  res.status(201).json({ ...complaint.toObject(), id: complaint._id });
};

exports.getStats = async (req, res) => {
  const complaints = await Complaint.find().lean();
  const stats = { total: complaints.length, byCategory: {}, byPriority: { High: 0, Medium: 0, Low: 0 } };
  complaints.forEach(c => {
    stats.byCategory[c.category] = (stats.byCategory[c.category] || 0) + 1;
    if (stats.byPriority[c.priority] !== undefined) stats.byPriority[c.priority]++;
  });
  res.json(stats);
};

exports.updateComplaint = async (req, res) => {
  const { adminReply, status } = req.body;
  const update = {};
  if (adminReply !== undefined) update.adminReply = adminReply;
  if (status)                   update.status = status;
  if (status === 'Resolved')    update.closedAt = new Date();

  const complaint = await Complaint.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!complaint) return res.status(404).json({ error: 'Not found' });
  res.json({ ...complaint.toObject(), id: complaint._id });
};

exports.adminLogin = (req, res) => {
  const { password } = req.body;
  if (password === process.env.ADMIN_PASSWORD) {
    res.json({ success: true });
  } else {
    res.status(401).json({ error: 'Wrong password' });
  }
};
