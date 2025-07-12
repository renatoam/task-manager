"use client";
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { syncOfflineTasks } from '../../createTask/api';
import UpdateTask from '../../updateTask/ui/updateTask.root';
import { useLoadTasks } from '../api';
import styles from './loadTasks.module.scss';

type TaskFilter = "all" | "active" | "completed";

export default function TasksList() {
  const params = useSearchParams();
  const filter = params.get('filter') as TaskFilter || "all";
  const { tasks, isLoading, isError } = useLoadTasks(filter)

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
    <ul
      id="tasks"
      className={styles.tasks}
    >
      {tasks.length === 0 && (<li className={styles.empty}>No {filter} tasks available.</li>)}
      {tasks.map((task) => <UpdateTask key={task.id} task={task} />)}
    </ul>
  )
}
