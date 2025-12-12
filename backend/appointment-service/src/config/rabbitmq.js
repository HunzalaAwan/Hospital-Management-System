const amqp = require('amqplib');

let channel = null;
let connection = null;
let isConnected = false;
let retryCount = 0;
const MAX_RETRIES = 3;

const connectRabbitMQ = async () => {
  if (retryCount >= MAX_RETRIES) {
    console.log('RabbitMQ: Max retries reached. Running without message queue (notifications disabled).');
    return null;
  }
  
  try {
    connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();
    
    // Declare exchanges
    await channel.assertExchange('appointment_events', 'topic', { durable: true });
    
    isConnected = true;
    retryCount = 0;
    console.log('RabbitMQ Connected');
    
    connection.on('close', () => {
      isConnected = false;
      console.log('RabbitMQ connection closed. Reconnecting...');
      setTimeout(connectRabbitMQ, 5000);
    });
    
    return channel;
  } catch (error) {
    retryCount++;
    console.error(`RabbitMQ Connection Error (attempt ${retryCount}/${MAX_RETRIES}):`, error.message);
    // Retry after 5 seconds
    setTimeout(connectRabbitMQ, 5000);
  }
};

const publishEvent = async (routingKey, message) => {
  if (!isConnected || !channel) {
    console.log(`Event skipped (RabbitMQ not connected): ${routingKey}`);
    return;
  }
  
  try {
    channel.publish(
      'appointment_events',
      routingKey,
      Buffer.from(JSON.stringify(message)),
      { persistent: true }
    );
    console.log(`Event published: ${routingKey}`, message);
  } catch (error) {
    console.error('Error publishing event:', error.message);
  }
};

const getChannel = () => channel;
const isRabbitMQConnected = () => isConnected;

module.exports = { connectRabbitMQ, publishEvent, getChannel, isRabbitMQConnected };
