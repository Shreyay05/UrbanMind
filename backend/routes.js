const express = require('express');
const router = express.Router();
const controller = require('./controller');
const complaintsController = require('./controller');
// GET /api/complaints - Fetch all complaints
router.get('/complaints', controller.getAllComplaints);

// POST /api/complaints - Submit a new complaint
router.post('/complaints', controller.createComplaint);
router.get('/stats', complaintsController.getStats);

module.exports = router;