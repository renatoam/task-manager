import { supabase } from "features/app/shared/config/supabase";
import { Task } from "features/app/shared/model/task";

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
    return Response.json("Invalid request body", { status: 400 });
  }

  const { source, target } = body

  const { data: targetUpdated, error: errorTarget } = await supabase
    .from("tasks")
    .update({ order: source.order })
    .eq("id", target.id)
    .select()
    .overrideTypes<Task[], { merge: false }>();

  console.log('POST Swap Target', { targetUpdated, errorTarget });
  
  if (errorTarget) {
    console.error("Error updating target task:", errorTarget);
    return Response.json("Error updating target task", { status: 500 });
  }
  
  const { data: sourceUpdated, error: errorSource } = await supabase
    .from("tasks")
    .update({ order: target.order })
    .eq("id", source.id)
    .select()
    .overrideTypes<Task[], { merge: false }>();

  console.log('POST Swap Source', { sourceUpdated, errorSource });
  
  if (errorSource) {
    console.error("Error updating source task:", errorSource);
    return Response.json("Error updating source task", { status: 500 });
  }

  console.log('POST Swap Updated', { sourceUpdated, targetUpdated });
  
  return Response.json({
    source: sourceUpdated[0],
    target: targetUpdated[0],
  });
}
