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
    body: JSON.stringify({
      id: task.id,
      order: task.order,
      description: task.description,
      completed: task.completed,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to update task");
  }

  const data = await response.json();
  return data;
}

export const useUpdateTask = (task: UpdatedTask) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => updateTask(task),
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
