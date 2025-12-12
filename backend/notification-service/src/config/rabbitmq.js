const amqp = require('amqplib');

let channel = null;
let connection = null;
let isConnected = false;
let retryCount = 0;
const MAX_RETRIES = 3;

const connectRabbitMQ = async (messageHandler) => {
  if (retryCount >= MAX_RETRIES) {
    console.log('RabbitMQ: Max retries reached. Notification service running without message queue.');
    console.log('Note: Notifications will not be generated without RabbitMQ.');
    return null;
  }
  
  try {
    connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();
    
    // Declare exchanges
    await channel.assertExchange('appointment_events', 'topic', { durable: true });
    await channel.assertExchange('user_events', 'topic', { durable: true });
    
    // Create queue for notification service
    const notificationQueue = await channel.assertQueue('notification_queue', { durable: true });
    
    // Bind to appointment events
    await channel.bindQueue(notificationQueue.queue, 'appointment_events', 'appointment.*');
    
    // Bind to user events
    await channel.bindQueue(notificationQueue.queue, 'user_events', 'user.*');
    
    isConnected = true;
    retryCount = 0;
    console.log('RabbitMQ Connected - Listening for events');
    
    connection.on('close', () => {
      isConnected = false;
      console.log('RabbitMQ connection closed. Reconnecting...');
      setTimeout(() => connectRabbitMQ(messageHandler), 5000);
    });
    
    // Start consuming messages
    channel.consume(notificationQueue.queue, async (msg) => {
      if (msg) {
        try {
          const routingKey = msg.fields.routingKey;
          const content = JSON.parse(msg.content.toString());
          
          console.log(`Received event: ${routingKey}`, content);
          
          await messageHandler(routingKey, content);
          
          channel.ack(msg);
        } catch (error) {
          console.error('Error processing message:', error);
          channel.nack(msg, false, false);
        }
      }
    });
    
    return channel;
  } catch (error) {
    retryCount++;
    console.error(`RabbitMQ Connection Error (attempt ${retryCount}/${MAX_RETRIES}):`, error.message);
    // Retry after 5 seconds
    setTimeout(() => connectRabbitMQ(messageHandler), 5000);
  }
};

const getChannel = () => channel;
const isRabbitMQConnected = () => isConnected;

module.exports = { connectRabbitMQ, getChannel, isRabbitMQConnected };
