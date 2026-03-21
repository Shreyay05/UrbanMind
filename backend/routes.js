const express = require('express');
const router = express.Router();
const {
  getAllComplaints,
  createComplaint,
  getStats,
  updateComplaint,
  adminLogin,
} = require('./controller');

router.get('/complaints',       getAllComplaints);
router.post('/complaints',      createComplaint);
router.patch('/complaints/:id', updateComplaint);
router.get('/stats',            getStats);
router.post('/admin/login',     adminLogin);

module.exports = router;