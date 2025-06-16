import { KeyboardEvent } from 'react';
import { useCreateTask } from '../api';
import styles from './createTaskInput.module.scss';

export default function CreateTaskInput() {
  const { mutate } = useCreateTask();

  const createNewTask = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;

    const target = (event.target as HTMLInputElement)
    const value = target.value.trim();

    mutate({
      description: value,
      completed: false,
    })

    target.value = ""; // Clear input after adding task
  }

  return (
    <section id="createTask" className={styles.create_task}>
      <span id="createTaskIcon" className={styles.create_task_icon}></span>
      <label
        id="createTaskInputLabel"
        htmlFor="createTaskInput"
        className={styles.create_task_input_label}
      >Create a new task...</label>
      <input
        type="text"
        id="createTaskInput"
        className={styles.create_task_input}
        placeholder="Create a new task..."
        onKeyDown={createNewTask}
      />
    </section>
  )
}
