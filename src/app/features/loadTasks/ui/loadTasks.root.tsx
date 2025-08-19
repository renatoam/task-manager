"use client";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  restrictToVerticalAxis,
  restrictToWindowEdges
} from '@dnd-kit/modifiers';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useQueryClient } from '@tanstack/react-query';
import { Task } from 'features/app/shared/model/task';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { syncOfflineTasks } from '../../createTask/api';
import { useReorderTasks } from '../../updateTask/api/reorderTasks';
import UpdateTask from '../../updateTask/ui/updateTask.root';
import { useLoadTasks } from '../api';
import Container from './fragments/container';
import styles from './loadTasks.module.scss';

type TaskFilter = "all" | "active" | "completed";

export default function TasksList() {
  const params = useSearchParams();
  const queryClient = useQueryClient();
  const filter = params.get('filter') as TaskFilter || "all";
  const { tasks, isLoading, isError } = useLoadTasks(filter)
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const { mutate: reorderMutate } = useReorderTasks(filter)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 1,
      },
    })
  );

  const onDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeId = Number(active.id);
    const activeTask = tasks.find((task) => task.order === activeId);
    setActiveTask(activeTask || null);
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = Number(active.id);
    const overId = Number(over.id);

    if (activeId === overId) return;

    const activeTask = tasks.find((task) => task.order === activeId);
    const overTask = tasks.find((task) => task.order === overId);

    if (!activeTask || !overTask) return;

    const activeIndex = tasks.findIndex((task) => task.order === activeId);
    const overIndex = tasks.findIndex((task) => task.order === overId);
    const newTaskList = arrayMove(tasks, activeIndex, overIndex);
    const newReorderedTasks = newTaskList.map((task) => {
      if (task.order === activeId) {
        return { ...task, order: overId };
      }
      if (task.order === overId) {
        return { ...task, order: activeId };
      }
      return task;
    });
    
    reorderMutate(newReorderedTasks)
  }

  useEffect(() => {
    syncOfflineTasks()
  }, [])

  useEffect(() => {
    const source = new EventSource('/server/sse');

    source.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('SSE Message:', data);
      queryClient.invalidateQueries({ queryKey: ['tasks', filter] });
    };

    source.onerror = (error) => {
      console.error('SSE Error:', error);
      source.close();
    };

    return () => {
      source.close();
    };
  }, [filter, queryClient]);

  if (isLoading) {
    return <p className={styles.loading}>Loading tasks...</p>;
  }

  if (isError) {
    return <p className={styles.error}>Failed to load tasks.</p>;
  }

  if (!tasks || tasks.length === 0) {
    return <p className={styles.error}>No tasks found.</p>;
  }

  return (
    <DndContext
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
    >
      <SortableContext
        items={tasks.map(task => task.order)}
        strategy={verticalListSortingStrategy}
      >
        <Container>
          {tasks.length === 0 && (<li className={styles.empty}>No {filter} tasks available.</li>)}
          {tasks.map((task) => <UpdateTask key={task.id} task={task} />)}
        </Container>
      </SortableContext>
      <DragOverlay>
        {activeTask ? <UpdateTask task={activeTask} overlay /> : null}
      </DragOverlay>
    </DndContext>
  )
}
