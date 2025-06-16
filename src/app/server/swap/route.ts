import path from "path";
import fs from "fs/promises";

interface SwapTask {
  id: string;
  order: number;
}

interface SwapBody {
  source: SwapTask;
  target: SwapTask;
}

export async function POST(request: Request) {
  const body: SwapBody = await request.json();
  
  if (!body.source || !body.target) {
    return new Response("Invalid request body", { status: 400 });
  }

  const filePath = path.join(process.cwd(), 'tasks.json');
  const rawData = await fs.readFile(filePath, 'utf-8');
  const data = JSON.parse(rawData);
  const sourceTask = data.find((task: SwapTask) => task.id === body.source.id);
  const targetTask = data.find((task: SwapTask) => task.id === body.target.id);
  
  if (!sourceTask || !targetTask) {
    return new Response("Tasks not found", { status: 404 });
  }

  const tempOrder = sourceTask.order;
  sourceTask.order = targetTask.order;
  targetTask.order = tempOrder;
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));

  return new Response(JSON.stringify({ data }), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });  
}
