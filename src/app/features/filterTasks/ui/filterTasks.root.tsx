"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import FilterButton from './filterButton';
import styles from './filterTasks.module.scss';
import { useLoadTasks } from '../../loadTasks/api';
import { useClearCompletedTasks } from '../api';

type TaskFilter = "all" | "active" | "completed";

const filters = [
  {
    label: "All",
    value: "all"
  },
  {
    label: "Active",
    value: "active"
  },
  {
    label: "Completed",
    value: "completed"
  }
]

export default function FilterTasks() {
  const router = useRouter()
  const searchParams = useSearchParams();
  const currentFilter = searchParams.get('filter') as TaskFilter || "all";
  const { tasks } = useLoadTasks('active')
  const { mutate } = useClearCompletedTasks()

  const filterTasks = (event: React.MouseEvent<HTMLButtonElement>) => {
    const filterType = (event.currentTarget.textContent?.toLowerCase() ?? "all") as TaskFilter;

    if (filterType === currentFilter) return;
    if (filterType === "all") {
      router.replace("/");
    } else {
      router.replace('?filter=' + filterType);
    }
  };

  const clearCompletedTasks = () => mutate()

  return (
    <footer id="filter" className={styles.filter}>
      <p id="remaining" className={styles.remaining}>{tasks?.length} items left</p>
      <section id="actions" className={styles.actions}>
        {filters.map(filter => (
          <FilterButton
            key={filter.value}
            onClick={filterTasks}
            className={`${styles.actions_button} ${currentFilter === filter.value ? styles.active : ''}`}
          >
            {filter.label}
          </FilterButton>
        ))}
        <FilterButton
          className={`${styles.actions_button}`}
          onClick={clearCompletedTasks}
        >Clear Completed</FilterButton>
      </section>
    </footer>
  );
}
