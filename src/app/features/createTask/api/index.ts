import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Task } from "features/app/shared/model/task";

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
    onMutate: (newTask: NewTask) => {
      // Cancel any ongoing queries to prevent stale data
      queryClient.cancelQueries({ queryKey: ['tasks'] });
      // Get the current tasks from the cache
      const previousTasks = queryClient.getQueryData<Task[]>(['tasks']) ?? [];
      // Create a temporary task ID for optimistic UI updates
      // This ID will be replaced with the actual ID from the server response
      // This is useful for optimistic updates to the UI
      // This allows the UI to immediately reflect the new task without waiting for the server response
      const optimisticTask: Task = {
        ...newTask,
        id: `temp-${previousTasks.length + 1}`,
        order: previousTasks.length + 1,
        completed: newTask.completed ?? false,
      }
      
      const optimisticUpdatedTasks = [...(previousTasks ?? []), optimisticTask];
      // Optimistically update the cache      
      queryClient.setQueryData(['tasks'], optimisticUpdatedTasks);
      return {
        previousTasks,
        optimisticTask,
      };
    },
    onError: (error, newTask, context) => {
      console.error({ error, newTask})
      // If the mutation fails, roll back to the previous tasks
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks'], context.previousTasks);
      }
    },
    onSuccess: (data: { task: Task, published: boolean }) => {
      console.log('Task created successfully', data);
      // Invalidate the tasks query to refetch the latest data
      // queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}
