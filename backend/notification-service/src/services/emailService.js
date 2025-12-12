const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  // For development, we'll use console logging instead of actual email
  if (process.env.NODE_ENV !== 'production') {
    return {
      sendMail: async (options) => {
        console.log('=== EMAIL NOTIFICATION (Dev Mode) ===');
        console.log('To:', options.to);
        console.log('Subject:', options.subject);
        console.log('Body:', options.text || options.html);
        console.log('=====================================');
        return { messageId: 'dev-mode-' + Date.now() };
      }
    };
  }
  
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const transporter = createTransporter();
    
    const info = await transporter.sendMail({
      from: process.env.FROM_EMAIL || 'noreply@healthcare.com',
      to,
      subject,
      text,
      html
    });
    
    console.log('Email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
};

module.exports = { sendEmail };
