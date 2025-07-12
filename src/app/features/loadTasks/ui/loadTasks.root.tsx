"use client";
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { syncOfflineTasks } from '../../createTask/api';
import UpdateTask from '../../updateTask/ui/updateTask.root';
import { useLoadTasks } from '../api';
import styles from './loadTasks.module.scss';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragOverlay
} from '@dnd-kit/core';
import {
  restrictToVerticalAxis,
  restrictToWindowEdges
} from '@dnd-kit/modifiers';
import Container from './fragments/container';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Task } from 'features/app/shared/model/task';
import { useReorderTasks } from '../../updateTask/api/reorderTasks';

type TaskFilter = "all" | "active" | "completed";

export default function TasksList() {
  const params = useSearchParams();
  const filter = params.get('filter') as TaskFilter || "all";
  const { tasks, isLoading, isError } = useLoadTasks(filter)
  const [tasksList, setTasksList] = useState<Task[]>(tasks || []);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const tasksRef = useRef<Task[]>(null);
  const { mutate: reorderMutate } = useReorderTasks()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const onDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeId = Number(active.id);
    const activeTask = tasksList.find((task) => task.order === activeId);
    setActiveTask(activeTask || null);
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = Number(active.id);
    const overId = Number(over.id);

    if (activeId === overId) return;

    const activeTask = tasksList.find((task) => task.order === activeId);
    const overTask = tasksList.find((task) => task.order === overId);

    if (!activeTask || !overTask) return;

    const activeIndex = tasksList.findIndex((task) => task.order === activeId);
    const overIndex = tasksList.findIndex((task) => task.order === overId);
    const newTaskList = arrayMove(tasksList, activeIndex, overIndex);
    
    setTasksList(newTaskList);
    reorderMutate(newTaskList)
  }

  useEffect(() => {
    if (tasks.length > 0 && (!tasksRef.current || tasksRef.current.length === 0)) {
      setTasksList(tasks);
      tasksRef.current = tasks;
    }
  }, [tasks])

  useEffect(() => {
    syncOfflineTasks()
  }, [])

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
        items={tasksList.map(task => task.order)}
        strategy={verticalListSortingStrategy}
      >
        <Container>
          {tasksList.length === 0 && (<li className={styles.empty}>No {filter} tasks available.</li>)}
          {tasksList.map((task) => <UpdateTask key={task.id} task={task} />)}
        </Container>
      </SortableContext>
      <DragOverlay>
        {activeTask ? <UpdateTask task={activeTask} overlay /> : null}
      </DragOverlay>
    </DndContext>
  )
}
