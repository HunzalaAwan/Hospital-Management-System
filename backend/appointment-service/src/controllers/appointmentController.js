const Appointment = require('../models/Appointment');
const { publishEvent } = require('../config/rabbitmq');

// @desc    Create new appointment
// @route   POST /api/appointments
exports.createAppointment = async (req, res) => {
  try {
    const {
      doctorId,
      doctorName,
      doctorEmail,
      specialization,
      appointmentDate,
      timeSlot,
      reason,
      symptoms,
      consultationFee,
      patientName,
      patientEmail
    } = req.body;
    
    // Check for existing appointment at same time
    const existingAppointment = await Appointment.findOne({
      doctorId,
      appointmentDate: new Date(appointmentDate),
      timeSlot,
      status: { $in: ['pending', 'approved'] }
    });
    
    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked'
      });
    }
    
    const appointment = await Appointment.create({
      patientId: req.user.id,
      patientName,
      patientEmail,
      doctorId,
      doctorName,
      doctorEmail,
      specialization,
      appointmentDate: new Date(appointmentDate),
      timeSlot,
      reason,
      symptoms,
      consultationFee
    });
    
    // Publish appointment created event
    await publishEvent('appointment.created', {
      appointmentId: appointment._id,
      patientId: appointment.patientId,
      patientName: appointment.patientName,
      patientEmail: appointment.patientEmail,
      doctorId: appointment.doctorId,
      doctorName: appointment.doctorName,
      doctorEmail: appointment.doctorEmail,
      appointmentDate: appointment.appointmentDate,
      timeSlot: appointment.timeSlot,
      reason: appointment.reason,
      status: appointment.status
    });
    
    res.status(201).json({
      success: true,
      appointment
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating appointment'
    });
  }
};

// @desc    Get patient's appointments
// @route   GET /api/appointments/patient
exports.getPatientAppointments = async (req, res) => {
  try {
    const { status } = req.query;
    
    const query = { patientId: req.user.id };
    if (status) {
      query.status = status;
    }
    
    const appointments = await Appointment.find(query)
      .sort({ appointmentDate: -1 });
    
    res.status(200).json({
      success: true,
      count: appointments.length,
      appointments
    });
  } catch (error) {
    console.error('Get patient appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching appointments'
    });
  }
};

// @desc    Get doctor's appointments
// @route   GET /api/appointments/doctor
exports.getDoctorAppointments = async (req, res) => {
  try {
    const { status, date } = req.query;
    
    const query = { doctorId: req.user.id };
    if (status) {
      query.status = status;
    }
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query.appointmentDate = { $gte: startDate, $lte: endDate };
    }
    
    const appointments = await Appointment.find(query)
      .sort({ appointmentDate: 1 });
    
    res.status(200).json({
      success: true,
      count: appointments.length,
      appointments
    });
  } catch (error) {
    console.error('Get doctor appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching appointments'
    });
  }
};

// @desc    Get single appointment
// @route   GET /api/appointments/:id
exports.getAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    // Check if user is authorized to view this appointment
    if (appointment.patientId !== req.user.id && appointment.doctorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this appointment'
      });
    }
    
    res.status(200).json({
      success: true,
      appointment
    });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching appointment'
    });
  }
};

// @desc    Approve appointment (Doctor only)
// @route   PUT /api/appointments/:id/approve
exports.approveAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    if (appointment.doctorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to approve this appointment'
      });
    }
    
    if (appointment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending appointments can be approved'
      });
    }
    
    appointment.status = 'approved';
    appointment.notes = req.body.notes || appointment.notes;
    await appointment.save();
    
    // Publish appointment approved event
    await publishEvent('appointment.approved', {
      appointmentId: appointment._id,
      patientId: appointment.patientId,
      patientName: appointment.patientName,
      patientEmail: appointment.patientEmail,
      doctorId: appointment.doctorId,
      doctorName: appointment.doctorName,
      doctorEmail: appointment.doctorEmail,
      appointmentDate: appointment.appointmentDate,
      timeSlot: appointment.timeSlot,
      status: appointment.status
    });
    
    res.status(200).json({
      success: true,
      appointment
    });
  } catch (error) {
    console.error('Approve appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error approving appointment'
    });
  }
};

// @desc    Reject appointment (Doctor only)
// @route   PUT /api/appointments/:id/reject
exports.rejectAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    if (appointment.doctorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reject this appointment'
      });
    }
    
    if (appointment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending appointments can be rejected'
      });
    }
    
    appointment.status = 'rejected';
    appointment.rejectionReason = req.body.reason || 'No reason provided';
    await appointment.save();
    
    // Publish appointment rejected event
    await publishEvent('appointment.rejected', {
      appointmentId: appointment._id,
      patientId: appointment.patientId,
      patientName: appointment.patientName,
      patientEmail: appointment.patientEmail,
      doctorId: appointment.doctorId,
      doctorName: appointment.doctorName,
      doctorEmail: appointment.doctorEmail,
      appointmentDate: appointment.appointmentDate,
      timeSlot: appointment.timeSlot,
      status: appointment.status,
      rejectionReason: appointment.rejectionReason
    });
    
    res.status(200).json({
      success: true,
      appointment
    });
  } catch (error) {
    console.error('Reject appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error rejecting appointment'
    });
  }
};

// @desc    Complete appointment (Doctor only)
// @route   PUT /api/appointments/:id/complete
exports.completeAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    if (appointment.doctorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to complete this appointment'
      });
    }
    
    if (appointment.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Only approved appointments can be completed'
      });
    }
    
    appointment.status = 'completed';
    appointment.prescription = req.body.prescription;
    appointment.notes = req.body.notes || appointment.notes;
    await appointment.save();
    
    // Publish appointment completed event
    await publishEvent('appointment.completed', {
      appointmentId: appointment._id,
      patientId: appointment.patientId,
      patientName: appointment.patientName,
      patientEmail: appointment.patientEmail,
      doctorId: appointment.doctorId,
      doctorName: appointment.doctorName,
      doctorEmail: appointment.doctorEmail,
      appointmentDate: appointment.appointmentDate,
      status: appointment.status,
      prescription: appointment.prescription
    });
    
    res.status(200).json({
      success: true,
      appointment
    });
  } catch (error) {
    console.error('Complete appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error completing appointment'
    });
  }
};

// @desc    Cancel appointment (Patient only)
// @route   PUT /api/appointments/:id/cancel
exports.cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    if (appointment.patientId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this appointment'
      });
    }
    
    if (!['pending', 'approved'].includes(appointment.status)) {
      return res.status(400).json({
        success: false,
        message: 'This appointment cannot be cancelled'
      });
    }
    
    appointment.status = 'cancelled';
    await appointment.save();
    
    // Publish appointment cancelled event
    await publishEvent('appointment.cancelled', {
      appointmentId: appointment._id,
      patientId: appointment.patientId,
      patientName: appointment.patientName,
      patientEmail: appointment.patientEmail,
      doctorId: appointment.doctorId,
      doctorName: appointment.doctorName,
      doctorEmail: appointment.doctorEmail,
      appointmentDate: appointment.appointmentDate,
      timeSlot: appointment.timeSlot,
      status: appointment.status
    });
    
    res.status(200).json({
      success: true,
      appointment
    });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error cancelling appointment'
    });
  }
};

// @desc    Get doctor's booked slots for a date
// @route   GET /api/appointments/slots/:doctorId
exports.getBookedSlots = async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required'
      });
    }
    
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    
    const appointments = await Appointment.find({
      doctorId: req.params.doctorId,
      appointmentDate: { $gte: startDate, $lte: endDate },
      status: { $in: ['pending', 'approved'] }
    }).select('timeSlot');
    
    const bookedSlots = appointments.map(apt => apt.timeSlot);
    
    res.status(200).json({
      success: true,
      bookedSlots
    });
  } catch (error) {
    console.error('Get booked slots error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching booked slots'
    });
  }
};
