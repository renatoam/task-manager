import { useState } from 'react';
import { useSwapTasks } from '../api/swapTasks';
import { useUpdateTask } from '../api/updateTask';
import styles from './updateTask.module.scss';
import { GripVertical } from 'lucide-react';

interface Task {
  id: string;
  description: string;
  completed: boolean;
  order: number;
}

let draggingItem: Task | undefined = undefined

export default function UpdateTask(props: Readonly<{ task: Task }> ) {
  const { id, description, completed, order } = props.task
  const { mutate, isPending } = useUpdateTask(props.task);
  const { mutate: swapMutate } = useSwapTasks()
  const [over, setOver] = useState<boolean | null>(null);
  
  const toggleTaskCompletion = () => mutate()

  const swapTasks = () => {
    if (!draggingItem || draggingItem.order === order) return;
    
    const swap = {
      source: draggingItem,
      target: props.task,
    }

    swapMutate(swap)

    draggingItem = undefined; // Reset dragging item after swap
    setOver(false);
  }

  return (
    <li
      id={id}
      className={`${styles.task} ${over ? styles.task_over : ''}`}
      key={id}
      draggable={true}
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move';
        draggingItem = props.task;
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setOver(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        console.log('Drop event:', {
          id,
          order,
          target: e.target,
          external: draggingItem,
        });
        swapTasks()
      }}
    >
      {isPending ? <span className={styles.task_loading}></span> : (
        <>
          <GripVertical />
          <input
            id={`taskCheck-${id}`}
            type="checkbox"
            className={styles.task_check}
            onChange={toggleTaskCompletion}
            checked={completed}
          />
          <label htmlFor={`taskCheck-${id}`} className={styles.task_label}>
            <span>check</span>
          </label>
        </>
      )}
      <p className={styles.task_description}>{description}</p>
    </li>
  )
}
