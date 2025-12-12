const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: [true, 'Patient ID is required']
  },
  patientName: {
    type: String,
    required: [true, 'Patient name is required']
  },
  patientEmail: {
    type: String,
    required: [true, 'Patient email is required']
  },
  doctorId: {
    type: String,
    required: [true, 'Doctor ID is required']
  },
  doctorName: {
    type: String,
    required: [true, 'Doctor name is required']
  },
  doctorEmail: {
    type: String
  },
  specialization: {
    type: String
  },
  appointmentDate: {
    type: Date,
    required: [true, 'Appointment date is required']
  },
  timeSlot: {
    type: String,
    required: [true, 'Time slot is required']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },
  reason: {
    type: String,
    required: [true, 'Reason for appointment is required']
  },
  symptoms: {
    type: String
  },
  notes: {
    type: String
  },
  prescription: {
    type: String
  },
  consultationFee: {
    type: Number
  },
  rejectionReason: {
    type: String
  }
}, {
  timestamps: true
});

// Index for efficient queries
appointmentSchema.index({ patientId: 1, appointmentDate: -1 });
appointmentSchema.index({ doctorId: 1, appointmentDate: -1 });
appointmentSchema.index({ status: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
