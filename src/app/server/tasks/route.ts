import { createRoutingKey, exchange, queueConnection } from "features/app/shared/config/queue";
import { supabase } from "features/app/shared/config/supabase";
import { Task } from "features/app/shared/model/task";
import { NextRequest } from "next/server";
import { randomUUID } from "node:crypto";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const filter = params.get('filter') ?? 'all';

  if (filter === 'active') {
    const { data: tasks, count: remaining } = await supabase
      .from("tasks")
      .select("*", { count: 'exact' })
      .is('completed', false)
      .overrideTypes<Task[], { merge: false }>();

    console.log('GET Active', { tasks, remaining });

    if (!tasks) {
      return Response.json({
        tasks: [],
        remaining: 0,
      });
    }

    return Response.json({
      tasks,
      remaining,
    });
  } else if (filter === 'completed') {
    const { data: tasks, count: remaining } = await supabase
      .from("tasks")
      .select("*", { count: 'exact' })
      .is('completed', true)
      .overrideTypes<Task[], { merge: false }>();

    console.log('GET Completed', { tasks, remaining });

    return Response.json({
      tasks,
      remaining,
    });
  }

  const { data: tasks, count: remaining } = await supabase
    .from("tasks")
    .select("*", { count: 'exact' })
    .overrideTypes<Task[], { merge: false }>();
  
  console.log('GET All', { tasks, remaining });

  return Response.json({
    tasks,
    remaining,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { count, error } = await supabase
    .from('tasks')
    .select("*", { count: 'exact', head: true })

  console.log('POST New Count', { error, count });

  if (error || count === undefined || count === null) {
    return Response.json({ error }, { status: 500 });
  }

  const remaining = count + 1

  const newTask: Task = {
    id: randomUUID(),
    description: body.description,
    completed: false,
    order: remaining
  };

  const publishChannel = await queueConnection.createChannel();
  const sent = publishChannel.publish(exchange, createRoutingKey, Buffer.from(JSON.stringify(newTask)));

  return Response.json({
    published: sent,
    task: newTask,
  });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const taskId = body.id;
  
  // TODO: refactor to update the whole task instead of just the completed status
  const { data: task, error } = await supabase
    .from('tasks')
    .update({ completed: !body.completed })
    .eq('id', taskId)
    .select("*")
    .overrideTypes<Task[], { merge: false }>();
  
  console.log('PUT', { task, error });

  if (error || !task) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({
    task,
  });
}
