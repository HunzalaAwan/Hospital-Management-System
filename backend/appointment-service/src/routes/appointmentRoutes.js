const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  getAppointment,
  approveAppointment,
  rejectAppointment,
  completeAppointment,
  cancelAppointment,
  getBookedSlots
} = require('../controllers/appointmentController');

// All routes are protected
router.use(protect);

// Patient routes
router.post('/', createAppointment);
router.get('/patient', getPatientAppointments);
router.put('/:id/cancel', cancelAppointment);

// Doctor routes
router.get('/doctor', getDoctorAppointments);
router.put('/:id/approve', approveAppointment);
router.put('/:id/reject', rejectAppointment);
router.put('/:id/complete', completeAppointment);

// Shared routes
router.get('/slots/:doctorId', getBookedSlots);
router.get('/:id', getAppointment);

module.exports = router;
