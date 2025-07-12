import { useMutation, useQueryClient } from "@tanstack/react-query";

export const clearCompletedTasks = async () => {
  const response = await fetch('/server/clear', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to clear completed tasks');
  }

  const data = await response.json();
  return data;
}

export const useClearCompletedTasks = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: clearCompletedTasks,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks']});
    },
    onError: (error) => {
      console.error('Error clearing completed tasks:', error);
    },
  });
}
