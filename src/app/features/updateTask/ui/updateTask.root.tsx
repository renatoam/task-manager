import { useUpdateTask } from '../api/updateTask';
import styles from './updateTask.module.scss';
import { GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';

interface Task {
  id: string;
  description: string;
  completed: boolean;
  order: number;
}

export default function UpdateTask(props: Readonly<{ task: Task }> ) {
  const { id, description, completed, order } = props.task
  const { mutate, isPending } = useUpdateTask(props.task);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({
    id: order,
    data: {
      id,
      order,
    },
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    transition,
    opacity: isDragging ? "0.4" : "1",
    borderTop: isOver ? "2px solid var(--color-primary)" : "none",
  } : undefined;
  
  const toggleTaskCompletion = () => mutate()

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
      <p className={styles.task_description}>{description}</p>
    </li>
  )
}
