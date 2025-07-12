import { PropsWithChildren } from 'react';
import styles from '../loadTasks.module.scss';
import { useDroppable } from '@dnd-kit/core';

export default function Container(props: PropsWithChildren) {
  const { setNodeRef } = useDroppable({
    id: 'tasks',
  });

  return (
    <ul
        id="tasks"
        className={styles.tasks}
        ref={setNodeRef}
      >
        {props.children}
    </ul>
  )
}
