import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UpdatedTask {
  id: string;
  order: number;
  description: string;
  completed: boolean;
}

export const updateTask = async (task: UpdatedTask) => {
  const response = await fetch("/server/tasks", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(task),
  });

  if (!response.ok) {
    throw new Error("Failed to update task");
  }

  const data = await response.json();
  return data;
}

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (task: UpdatedTask) => updateTask(task),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      console.log("Task updated successfully:", data);
      return data;
    },
    onError: (error) => {
      console.error("Error updating task:", error);
      return error
    },
  })
}
