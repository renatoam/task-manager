"use client";
import { QueryClientProvider } from "@tanstack/react-query";
import { CreateTask } from "features/app/features/createTask/ui";
import { FilterTasks } from "features/app/features/filterTasks/ui";
import { LoadTasks } from "features/app/features/loadTasks/ui";
import { queryClient } from "features/app/shared/config/query";

export default function Content() {
  return (
    <QueryClientProvider client={queryClient}>
      <CreateTask />
      <LoadTasks />
      <FilterTasks />
    </QueryClientProvider>
  );
}
