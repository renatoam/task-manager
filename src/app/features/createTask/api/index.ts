import { useMutation, useQueryClient } from "@tanstack/react-query";

interface NewTask {
  description: string;
  completed?: boolean;
}

export const createTask = async (task: NewTask) => {
  const response = await fetch('/server/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(task),
  });

  if (!response.ok) {
    throw new Error('Failed to create task');
  }

  const data = await response.json();
  return data;
}

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}
