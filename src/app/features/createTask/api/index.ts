import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryClient } from "features/app/shared/config/query";
import { Task } from "features/app/shared/model/task";

interface NewTask {
  description: string;
  completed?: boolean;
}

export const syncOfflineTasks = async () => {
  if (!window || !window?.navigator.onLine) return

  const storage = localStorage.getItem('offlineTasks') ?? '[]'
  const queue = JSON.parse(storage) as Task[]
  const stillPending = []

  for (const task of queue) {
    try {
      await createTask(task)
    } catch {
      stillPending.push(task)
    }
  }

  localStorage.setItem('offlineTasks', JSON.stringify(stillPending))
  queryClient.invalidateQueries({ queryKey: ['tasks']})
}

export const createOfflineTask = async (task: NewTask) => {
  const storage = localStorage.getItem('offlineTasks') ?? '[]'
  const queue = JSON.parse(storage) as Partial<Task>[]
  queue.push(task)
  localStorage.setItem('offlineTasks', JSON.stringify(queue))
  return false
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
    mutationFn: (data) => {
      const isOnline = window.navigator.onLine

      if (!isOnline) {
        return createOfflineTask(data.newTask)
      }

      return createTask(data.newTask)
    },
    onMutate: (variables: { newTask: NewTask, filter: string }) => {
      const { newTask, filter } = variables
      // Cancel any ongoing queries to prevent stale data
      queryClient.cancelQueries({ queryKey: ['tasks', filter] });
      // Get the current tasks from the cache
      const previousTasks = queryClient.getQueryData<Task[]>(['tasks', filter]) ?? [];
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

      console.log('onMutate', { previousTasks, optimisticTask })
      
      const optimisticUpdatedTasks = [...(previousTasks ?? []), optimisticTask];
      // Optimistically update the cache      
      queryClient.setQueryData(['tasks', filter], optimisticUpdatedTasks);
      return {
        previousTasks,
        optimisticTask,
      };
    },
    onError: (error, variables, context) => {
      console.error({ error })
      // If the mutation fails, roll back to the previous tasks
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks', variables.filter], [...context.previousTasks, context.optimisticTask]);
      }
    },
    onSuccess: (data: { task: Task, published: boolean }, variables) => {
      console.log('Task created successfully', data, variables);
      // Invalidate the tasks query to refetch the latest data
      queryClient.invalidateQueries({ queryKey: ['tasks', variables.filter] });
    },
  });
}
