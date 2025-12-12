const Notification = require('../models/Notification');
const { sendEmail } = require('./emailService');

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const handleEvent = async (routingKey, data) => {
  console.log(`Processing event: ${routingKey}`);
  
  switch (routingKey) {
    case 'appointment.created':
      await handleAppointmentCreated(data);
      break;
    case 'appointment.approved':
      await handleAppointmentApproved(data);
      break;
    case 'appointment.rejected':
      await handleAppointmentRejected(data);
      break;
    case 'appointment.completed':
      await handleAppointmentCompleted(data);
      break;
    case 'appointment.cancelled':
      await handleAppointmentCancelled(data);
      break;
    case 'user.registered':
      await handleUserRegistered(data);
      break;
    default:
      console.log(`Unknown event type: ${routingKey}`);
  }
};

const handleAppointmentCreated = async (data) => {
  // Notify doctor about new appointment request
  const doctorNotification = await Notification.create({
    userId: data.doctorId,
    userEmail: data.doctorEmail || '',
    type: 'appointment_created',
    title: 'New Appointment Request',
    message: `You have a new appointment request from ${data.patientName} for ${formatDate(data.appointmentDate)} at ${data.timeSlot}. Reason: ${data.reason}`,
    data: data
  });
  
  // Send email to doctor
  if (data.doctorEmail) {
    const emailSent = await sendEmail({
      to: data.doctorEmail,
      subject: 'New Appointment Request - Healthcare System',
      html: `
        <h2>New Appointment Request</h2>
        <p>You have received a new appointment request:</p>
        <ul>
          <li><strong>Patient:</strong> ${data.patientName}</li>
          <li><strong>Date:</strong> ${formatDate(data.appointmentDate)}</li>
          <li><strong>Time:</strong> ${data.timeSlot}</li>
          <li><strong>Reason:</strong> ${data.reason}</li>
        </ul>
        <p>Please log in to your dashboard to approve or reject this request.</p>
      `
    });
    
    if (emailSent) {
      doctorNotification.emailSent = true;
      await doctorNotification.save();
    }
  }
  
  // Notify patient about booking confirmation
  await Notification.create({
    userId: data.patientId,
    userEmail: data.patientEmail,
    type: 'appointment_created',
    title: 'Appointment Booked',
    message: `Your appointment with Dr. ${data.doctorName} on ${formatDate(data.appointmentDate)} at ${data.timeSlot} has been booked. Waiting for doctor's confirmation.`,
    data: data
  });
  
  // Send email to patient
  if (data.patientEmail) {
    await sendEmail({
      to: data.patientEmail,
      subject: 'Appointment Booked - Healthcare System',
      html: `
        <h2>Appointment Booked Successfully</h2>
        <p>Your appointment has been booked:</p>
        <ul>
          <li><strong>Doctor:</strong> Dr. ${data.doctorName}</li>
          <li><strong>Date:</strong> ${formatDate(data.appointmentDate)}</li>
          <li><strong>Time:</strong> ${data.timeSlot}</li>
          <li><strong>Status:</strong> Pending Approval</li>
        </ul>
        <p>You will be notified once the doctor confirms your appointment.</p>
      `
    });
  }
};

const handleAppointmentApproved = async (data) => {
  // Notify patient about approval
  const notification = await Notification.create({
    userId: data.patientId,
    userEmail: data.patientEmail,
    type: 'appointment_approved',
    title: 'Appointment Approved',
    message: `Great news! Your appointment with Dr. ${data.doctorName} on ${formatDate(data.appointmentDate)} at ${data.timeSlot} has been approved.`,
    data: data
  });
  
  // Send email to patient
  if (data.patientEmail) {
    const emailSent = await sendEmail({
      to: data.patientEmail,
      subject: 'Appointment Approved - Healthcare System',
      html: `
        <h2>Appointment Approved!</h2>
        <p>Great news! Your appointment has been approved:</p>
        <ul>
          <li><strong>Doctor:</strong> Dr. ${data.doctorName}</li>
          <li><strong>Date:</strong> ${formatDate(data.appointmentDate)}</li>
          <li><strong>Time:</strong> ${data.timeSlot}</li>
        </ul>
        <p>Please arrive 10 minutes before your scheduled time.</p>
      `
    });
    
    if (emailSent) {
      notification.emailSent = true;
      await notification.save();
    }
  }
};

const handleAppointmentRejected = async (data) => {
  // Notify patient about rejection
  const notification = await Notification.create({
    userId: data.patientId,
    userEmail: data.patientEmail,
    type: 'appointment_rejected',
    title: 'Appointment Rejected',
    message: `Unfortunately, your appointment with Dr. ${data.doctorName} on ${formatDate(data.appointmentDate)} at ${data.timeSlot} has been rejected. Reason: ${data.rejectionReason}`,
    data: data
  });
  
  // Send email to patient
  if (data.patientEmail) {
    const emailSent = await sendEmail({
      to: data.patientEmail,
      subject: 'Appointment Update - Healthcare System',
      html: `
        <h2>Appointment Not Approved</h2>
        <p>Unfortunately, your appointment request could not be approved:</p>
        <ul>
          <li><strong>Doctor:</strong> Dr. ${data.doctorName}</li>
          <li><strong>Date:</strong> ${formatDate(data.appointmentDate)}</li>
          <li><strong>Time:</strong> ${data.timeSlot}</li>
          <li><strong>Reason:</strong> ${data.rejectionReason}</li>
        </ul>
        <p>Please try booking a different time slot or another doctor.</p>
      `
    });
    
    if (emailSent) {
      notification.emailSent = true;
      await notification.save();
    }
  }
};

const handleAppointmentCompleted = async (data) => {
  // Notify patient about completion
  const notification = await Notification.create({
    userId: data.patientId,
    userEmail: data.patientEmail,
    type: 'appointment_completed',
    title: 'Appointment Completed',
    message: `Your appointment with Dr. ${data.doctorName} has been completed. ${data.prescription ? 'Prescription has been added.' : ''}`,
    data: data
  });
  
  // Send email to patient with prescription if available
  if (data.patientEmail) {
    const emailSent = await sendEmail({
      to: data.patientEmail,
      subject: 'Appointment Completed - Healthcare System',
      html: `
        <h2>Appointment Completed</h2>
        <p>Your appointment has been marked as completed:</p>
        <ul>
          <li><strong>Doctor:</strong> Dr. ${data.doctorName}</li>
          <li><strong>Date:</strong> ${formatDate(data.appointmentDate)}</li>
        </ul>
        ${data.prescription ? `<h3>Prescription:</h3><p>${data.prescription}</p>` : ''}
        <p>Thank you for using our Healthcare System. We wish you good health!</p>
      `
    });
    
    if (emailSent) {
      notification.emailSent = true;
      await notification.save();
    }
  }
};

const handleAppointmentCancelled = async (data) => {
  // Notify doctor about cancellation
  const doctorNotification = await Notification.create({
    userId: data.doctorId,
    userEmail: data.doctorEmail || '',
    type: 'appointment_cancelled',
    title: 'Appointment Cancelled',
    message: `Appointment with ${data.patientName} on ${formatDate(data.appointmentDate)} at ${data.timeSlot} has been cancelled by the patient.`,
    data: data
  });
  
  // Send email to doctor
  if (data.doctorEmail) {
    const emailSent = await sendEmail({
      to: data.doctorEmail,
      subject: 'Appointment Cancelled - Healthcare System',
      html: `
        <h2>Appointment Cancelled</h2>
        <p>An appointment has been cancelled:</p>
        <ul>
          <li><strong>Patient:</strong> ${data.patientName}</li>
          <li><strong>Date:</strong> ${formatDate(data.appointmentDate)}</li>
          <li><strong>Time:</strong> ${data.timeSlot}</li>
        </ul>
        <p>The time slot is now available for other patients.</p>
      `
    });
    
    if (emailSent) {
      doctorNotification.emailSent = true;
      await doctorNotification.save();
    }
  }
  
  // Notify patient about cancellation confirmation
  await Notification.create({
    userId: data.patientId,
    userEmail: data.patientEmail,
    type: 'appointment_cancelled',
    title: 'Cancellation Confirmed',
    message: `Your appointment with Dr. ${data.doctorName} on ${formatDate(data.appointmentDate)} at ${data.timeSlot} has been cancelled successfully.`,
    data: data
  });
};

const handleUserRegistered = async (data) => {
  // Create welcome notification
  const notification = await Notification.create({
    userId: data.userId,
    userEmail: data.email,
    type: 'user_registered',
    title: 'Welcome to Healthcare System',
    message: `Welcome ${data.name}! Your account has been created successfully. ${data.role === 'doctor' ? 'You can now manage appointments from your dashboard.' : 'You can now book appointments with our doctors.'}`,
    data: data
  });
  
  // Send welcome email
  if (data.email) {
    const emailSent = await sendEmail({
      to: data.email,
      subject: 'Welcome to Healthcare System',
      html: `
        <h2>Welcome to Healthcare System!</h2>
        <p>Hello ${data.name},</p>
        <p>Your account has been created successfully.</p>
        ${data.role === 'doctor' 
          ? '<p>As a doctor, you can now manage your appointments, set your availability, and connect with patients through your dashboard.</p>'
          : '<p>As a patient, you can now browse our doctors, book appointments, and manage your health records through your dashboard.</p>'
        }
        <p>Thank you for joining us!</p>
      `
    });
    
    if (emailSent) {
      notification.emailSent = true;
      await notification.save();
    }
  }
};

module.exports = { handleEvent };
