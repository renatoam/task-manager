import { supabase, TASK_CREATED } from 'features/app/shared/config/supabase';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  const encoder = new TextEncoder();
  const taskDbChannel = supabase.channel(TASK_CREATED);

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode('retry: 10000\n\n'));

      console.log(`SSE subscribed to ${taskDbChannel.topic} channel`);

      taskDbChannel.on('broadcast', {
        event: TASK_CREATED,
      }, message => {
        console.log('SSE received the message: ', message)
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ task: message.payload?.task })}\n\n`));
      })
      .subscribe();
    },
    cancel() {
      taskDbChannel.unsubscribe();
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
