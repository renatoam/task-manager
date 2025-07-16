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
  const { count: remaining, error } = await supabase
    .from('tasks')
    .select("*", { count: 'exact', head: true })

  console.log('POST New Count', { error, remaining });

  if (error || remaining === undefined || remaining === null) {
    return Response.json({ error }, { status: 500 });
  }

  const newTask: Task = {
    id: randomUUID(),
    description: body.description,
    completed: false,
    order: remaining
  };

  // const relayURL = process.env.RELAY_URL ?? 'http://localhost:4000'
  const relayURL = 'http://localhost:4000'
  const response = await fetch(`${relayURL}/producer`, {
    method: 'POST',
    body: JSON.stringify(newTask),
    headers: {
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    return Response.json({
      published: false,
      task: newTask,
    }, { status: 500 });
  }

  const data = (await response.json()) as { sent: boolean, task: Task }

  return Response.json({
    published: data.sent,
    task: newTask,
  });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const taskId = body.id;
  
  const { data: task, error } = await supabase
    .from('tasks')
    .update(body)
    .eq('id', taskId)
    .select("*")
    .overrideTypes<Task[], { merge: false }>();
  
  if (error || !task) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  console.log('PUT', { task, error });

  return Response.json({
    task,
  });
}
