import { supabase } from "features/app/shared/config/supabase"
import { NextRequest } from "next/server"

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  console.log({ id })

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)

  if (error) {
    return Response.json('Tasks wasn\'t deleted.')
  }

  return Response.json('Task deleted.')
}
