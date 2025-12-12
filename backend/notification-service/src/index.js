require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { connectRabbitMQ } = require('./config/rabbitmq');
const { handleEvent } = require('./services/notificationHandler');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

// Connect to Database
connectDB();

// Connect to RabbitMQ and start consuming events
connectRabbitMQ(handleEvent);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Notification Service is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 4003;

app.listen(PORT, () => {
  console.log(`Notification Service running on port ${PORT}`);
});
