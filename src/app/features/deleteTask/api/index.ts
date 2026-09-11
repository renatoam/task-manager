import { useMutation, useQueryClient } from "@tanstack/react-query";

export const deleteTask = async (id: string) => {
  const response = await fetch(`/server/tasks/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    }
  });

  if (!response.ok) {
    throw new Error("Failed to delete task");
  }

  const data = await response.json();
  return data;
}

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      console.log("Task successfully deleted:", data);
      return data;
    },
    onError: (error) => {
      console.error("Error on deleting task:", error);
      return error
    },
  })
}
