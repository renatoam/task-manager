import { Metadata } from 'next';
import styles from './page.module.scss'

export const metadata: Metadata = {
  title: process.env.TITLE ?? "Home | Task Manager",
  description: "A simple task management app. Track your tasks easily! Todo list, task manager, productivity app.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className={styles.page}>
      <section id="manager" className={styles.manager}>
        {children}
      </section>
    </main>
  );
}
