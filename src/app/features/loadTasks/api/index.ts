import { useQuery } from "@tanstack/react-query";
import { useAuth } from "features/app/shared/contexts/auth.context";

interface Task {
  id: string;
  description: string;
  completed: boolean;
  order: number;
}

export const loadOfflineTasks = async () => {
  const offlineTasks = localStorage.getItem('offlineTasks') ?? '[]';
  const tasks = JSON.parse(offlineTasks) as Task[];
  return tasks;
}

export const loadTasks = async (filter: "all" | "active" | "completed") => {
  const response = await fetch(`/server/tasks?filter=${filter}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to load tasks");
  }

  const data = await response.json();
  return data.tasks;
}

export const useLoadTasks = (filter: "all" | "active" | "completed") => {
  const { isAuthenticated } = useAuth();
  const { data, ...rest } = useQuery<Task[]>({
    queryKey: ["tasks", filter],
    queryFn: async () => {
      if (isAuthenticated) return loadTasks(filter);

      const offlineTasks = await loadOfflineTasks();

      if (filter === "all") {
        return offlineTasks;
      }

      if (filter === "active") {
        return offlineTasks.filter((task) => !task.completed);
      }

      const tasks = offlineTasks.filter((task) => task.completed === (filter === "completed"));
      return tasks;      
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  const sortedTasks = data?.sort((a, b) => a.order - b.order);

  return {
    tasks: sortedTasks || [],
    ...rest,
  };
}
