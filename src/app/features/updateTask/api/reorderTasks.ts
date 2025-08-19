import { useMutation, useQueryClient } from "@tanstack/react-query";

type TaskFilter = "all" | "active" | "completed";

interface OrderTask {
  id: string;
  order: number;  
}

export const reorderTasks = async (tasks: OrderTask[]) => {
  const response = await fetch("/server/order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(tasks),
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  const data = await response.json();
  return data;
}

export const useReorderTasks = (filter: TaskFilter) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tasks: OrderTask[]) => reorderTasks(tasks),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tasks", filter] });
      console.log("Tasks reordered successfully:", data);
      return data;
    },
    onError: (error) => {
      console.error("Error reordering tasks:", error);
      return error;
    },
  });
}
