import { supabase } from "features/app/shared/config/supabase";
import { Task } from "features/app/shared/model/task";

export async function POST() {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('completed', true)
    .select('*')
    .overrideTypes<Task[], { merge: false }>();
  
  console.log('POST Clear', { error });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ status: 204 });
}
