import { supabase } from "features/app/shared/config/supabase";

export async function GET() {
  const { count: remaining } = await supabase
    .from("users")
    .select("*", { count: 'exact' })

  console.log('Supabase users count: ', remaining);

  return Response.json({ status: 'Task Manager FE and DB are running' });
}
