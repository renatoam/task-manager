import styles from './page.module.scss'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className={styles.page}>
      <section id="manager" className={styles.manager}>
        {children}
      </section>
    </main>
  );
}
