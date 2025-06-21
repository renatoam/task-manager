import { createRoutingKey, exchange, queue, queueConnection } from 'features/app/shared/config/queue';
import { NextResponse } from 'next/server';
import amqp from 'amqplib';
import { supabase } from 'features/app/shared/config/supabase';
import { Task } from 'features/app/shared/model/task';

export const runtime = 'nodejs';

export async function GET() {
  const encoder = new TextEncoder();
  let consumerTag: string | undefined;
  let subscribeChannel: amqp.Channel

  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(encoder.encode('retry: 10000\n\n'));
      subscribeChannel = await queueConnection.createChannel()
      await subscribeChannel.assertExchange(exchange, 'direct', { durable: true });
      await subscribeChannel.assertQueue(queue)
      await subscribeChannel.bindQueue(queue, exchange, createRoutingKey);
      await subscribeChannel.purgeQueue(queue);
      console.log('SSE: Subscribed to queue', queue);
      
      const result = await subscribeChannel.consume(queue, async message => {
        const msg = message?.content.toString('utf-8');
        
        if (!msg) {
          console.error('SSE: Received empty message');
          return;
        }
        
        const newTask = JSON.parse(msg);        
        const { data: tasks, error: insertError } = await supabase
          .from('tasks')
          .insert([newTask])
          .select("*")
          .overrideTypes<Task[], { merge: false }>();
      
        console.log('POST New', { tasks, insertError });

        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ tasks, insertError })}\n\n`));
        subscribeChannel.ack(message!);
      });

      consumerTag = result.consumerTag;
    },
    async cancel() {
      if (consumerTag) {
        await subscribeChannel.cancel(consumerTag);
        console.log('SSE: Unsubscribed from queue', queue);
      }
    }
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive'
    }
  });
}
