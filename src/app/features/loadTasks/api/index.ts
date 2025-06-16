import { useQuery } from "@tanstack/react-query";

interface Task {
  id: string;
  description: string;
  completed: boolean;
  order: number;
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
  const { data, ...rest } = useQuery<Task[]>({
    queryKey: ["tasks", filter],
    queryFn: () => loadTasks(filter),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  const sortedTasks = data?.sort((a, b) => a.order - b.order);

  return {
    tasks: sortedTasks || [],
    ...rest,
  };
}
