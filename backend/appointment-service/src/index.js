require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const { connectRabbitMQ } = require('./config/rabbitmq');
const appointmentRoutes = require('./routes/appointmentRoutes');

const app = express();

// Connect to Database
connectDB();

// Connect to RabbitMQ
connectRabbitMQ();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/appointments', appointmentRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Appointment Service is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 4002;

app.listen(PORT, () => {
  console.log(`Appointment Service running on port ${PORT}`);
});
