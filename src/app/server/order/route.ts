import { supabase } from "features/app/shared/config/supabase";
import { Task } from "features/app/shared/model/task";

interface OrderTask {
  id: string;
  order: number;
}

export async function POST(request: Request) {
  const body: OrderTask[] = await request.json();
  
  if (!body) {
    return Response.json("Invalid request body", { status: 400 });
  }

  const errors: Error[] = [];

  body.forEach(async (task, index) => {
    const { data, error } = await supabase
      .from("tasks")
      .update({ order: index })
      .eq("id", task.id)
      .select()
      .overrideTypes<Task[], { merge: false }>();

    console.log('POST Order', { data, error });

    if (error) {
      errors.push(error);
    }
  })

  if (errors.length > 0) {
    return Response.json({
      error: errors.map((error) => error.message).join("; "),
    }, { status: 500 });
  }

  return Response.json({
    message: "Tasks reordered successfully",
  });
}
