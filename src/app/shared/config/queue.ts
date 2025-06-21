import amqp from 'amqplib';

export const queueConnection = await amqp.connect(process.env.RABBIT_URL ?? 'amqp://localhost');
export const queue = 'tasks'
export const exchange = 'tasks.exchange';
export const createRoutingKey = 'tasks.create';
export const updateRoutingKey = 'tasks.update';
export const deleteRoutingKey = 'tasks.delete';
export const swapRoutingKey = 'tasks.swap';
