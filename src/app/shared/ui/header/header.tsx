import SunIcon from '../icons/sun'
import styles from './header.module.scss'

export default function Header() {
  return (
    <header className={styles.header}>
      <h1>Task Manager</h1>
      <SunIcon />
    </header>
  )
}
