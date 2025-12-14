const amqplib = require('amqplib');


let channel, connection;

// Connect Function *******************************************************************
async function connect() {

    if (connection) return connection;

    try {
        connection = await amqplib.connect(process.env.RABBIT_URL);
        console.log('Connected to RabbitMQ');
        channel = await connection.createChannel();
        // console.log("Channel is => " , channel);
        
    }
    catch (error) {
        console.error('Error connecting to RabbitMQ:', error);
    }

}

// publishToQueue Function *******************************************************************
async function publishToQueue(queueName, data = {}) {
    if (!channel || !connection) await connect();

    await channel.assertQueue(queueName, {
        durable: true
    });

    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)));
    console.log('Message sent to queue:', queueName, data);
}

// subscribeToQueue Function *******************************************************************
async function subscribeToQueue(queueName, callback) {

    if (!channel || !connection) await connect();

    await channel.assertQueue(queueName, {
        durable: true
    });

    channel.consume(queueName, async (msg) => {
        if (msg !== null) {
            const data = JSON.parse(msg.content.toString());
            await callback(data);
            channel.ack(msg);
        }
    })

}




module.exports = {
    channel,
    connection,
    connect,
    publishToQueue,
    subscribeToQueue
}