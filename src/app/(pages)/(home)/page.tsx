import { Header } from "../../shared/ui/header";
import Content from "./fragments/Content";
import styles from "./page.module.scss";

export default function Home() {
  return (
    <main className={styles.page}>
      <section id="manager" className={styles.manager}>
        <Header />
        <Content />       
      </section>
    </main>
  );
}
