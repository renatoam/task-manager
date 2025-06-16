import path from "path";
import fs from "fs/promises";
import { NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { Task } from "features/app/shared/model/task";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const filter = params.get('filter') ?? 'all';
  const filePath = path.join(process.cwd(), 'tasks.json');
  const rawData = await fs.readFile(filePath, 'utf-8');
  const data = JSON.parse(rawData);
  console.log({ data, filter });

  if (filter === 'active') {
    const activeTasks = data.filter((task: Task) => !task.completed);
    return Response.json({
      tasks: activeTasks as Task[],
      remaining: activeTasks.length,
    });
  } else if (filter === 'completed') {
    const completedTasks = data.filter((task: Task) => task.completed);
    return Response.json({
      tasks: completedTasks as Task[],
      remaining: completedTasks.length,
    });
  }

  return Response.json({
    tasks: data as Task[],
    remaining: data.filter((task: Task) => !task.completed).length,
  });
}

export async function POST(request: NextRequest) {
  const filePath = path.join(process.cwd(), 'tasks.json');
  const rawData = await fs.readFile(filePath, 'utf-8');
  const data = JSON.parse(rawData);

  const body = await request.json();

  if (body.clear) {
    const activeTasks = data.filter((task: Task) => !task.completed);
    await fs.writeFile(filePath, JSON.stringify(activeTasks, null, 2));
    return Response.json({
      tasks: activeTasks as Task[],
      remaining: activeTasks.length,
    });
  }

  const newTask: Task = {
    id: randomUUID(),
    description: body.description,
    completed: false,
  };

  data.push(newTask);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  return Response.json({
    tasks: data as Task[],
    remaining: data.filter((task: Task) => !task.completed).length,
  });
}

export async function PUT(request: NextRequest) {
  const filePath = path.join(process.cwd(), 'tasks.json');
  const rawData = await fs.readFile(filePath, 'utf-8');
  const data = JSON.parse(rawData);
  const body = await request.json();
  const taskId = body.id;
  const updatedTasks = data.map((task: Task) => {
    if (task.id === taskId) {
      return {
        ...task,
        completed: !task.completed,
      };
    }
    return task;
  }
  );
  await fs.writeFile(filePath, JSON.stringify(updatedTasks, null, 2));
  return Response.json({
    tasks: updatedTasks as Task[],
    remaining: updatedTasks.filter((task: Task) => !task.completed).length,
  });
}
