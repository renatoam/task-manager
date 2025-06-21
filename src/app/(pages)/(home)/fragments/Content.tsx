"use client";
import { QueryClientProvider } from "@tanstack/react-query";
import { CreateTask } from "features/app/features/createTask/ui";
import { FilterTasks } from "features/app/features/filterTasks/ui";
import { LoadTasks } from "features/app/features/loadTasks/ui";
import { queryClient } from "features/app/shared/config/query";
import { Suspense, useEffect } from "react";

export default function Content() {
  useEffect(() => {
    const source = new EventSource('/server/sse');

    source.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('SSE Message:', data);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    };

    source.onerror = (error) => {
      console.error('SSE Error:', error);
      source.close();
    };

    return () => {
      source.close();
    };
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<div>Loading...</div>}>
        <CreateTask />
        <LoadTasks />
        <FilterTasks />
      </Suspense>
    </QueryClientProvider>
  );
}
