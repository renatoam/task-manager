import { useMutation, useQueryClient } from "@tanstack/react-query";

interface SwapTask {
  id: string;
  order: number;  
}

interface SwapBody {
  source: SwapTask;
  target: SwapTask;
}

export const swapTasks = async (source: SwapTask, target: SwapTask) => {
  const response = await fetch("/server/swap", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      source,
      target,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to swap tasks");
  }

  const data = await response.json();
  return data;
}

export const useSwapTasks = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: SwapBody) => swapTasks(body.source, body.target),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      console.log("Tasks swapped successfully:", data);
      return data;
    },
    onError: (error) => {
      console.error("Error swapping tasks:", error);
      return error;
    },
  });
}
