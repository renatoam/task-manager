import { useUpdateTask } from '../api/updateTask';
import styles from './updateTask.module.scss';
import { GripVertical, PenBoxIcon } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { useEffect, useRef, useState } from 'react';

interface Task {
  id: string;
  description: string;
  completed: boolean;
  order: number;
}

export default function UpdateTask(props: Readonly<{ task: Task, overlay?: boolean }> ) {
  const [currentTask, setCurrentTask] = useState<Task>(props.task);
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { id, description, completed, order } = currentTask;
  const { mutate, isPending } = useUpdateTask();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: order,
    data: {
      id,
      order,
    },
  });

  useEffect(() => {
    setCurrentTask(props.task);
  }, [props.task]);

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    transition,
    opacity: isDragging ? "0.4" : "1",
    borderTop: isDragging ? "2px solid var(--color-primary)" : "none",
  } : undefined;
  
  const toggleTaskCompletion = () => {
    const updatedTask = { ...currentTask, completed: !currentTask.completed };
    setCurrentTask(updatedTask);
    mutate(updatedTask);
  }

  const updateDescription = () => {
    const updatedTask = { ...currentTask, description: inputRef.current?.value || "" };
    setCurrentTask(updatedTask);
    setIsEditing(false);

    mutate(updatedTask);
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const updatedTask = { ...currentTask, description: inputRef.current?.value || "" };
      setCurrentTask(updatedTask);
      setIsEditing(false);

      mutate(updatedTask);
    }
  }

  if (props.overlay) {
    return (
      <li
        id={id}
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={styles.task}
      />
    )
  }

  return (
    <li
      id={id}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={styles.task}
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
      <input
        type="text"
        defaultValue={description}
        className={`${styles.task_description} ${isEditing ? styles.editing : ''}`}
        onBlur={updateDescription}
        onKeyDown={handleKeyDown}
        disabled={isPending || !isEditing}
        ref={inputRef}
      />
      <button onClick={() => setIsEditing(!isEditing)} className={styles.task_edit}>
        <PenBoxIcon />
      </button>
    </li>
  )
}
