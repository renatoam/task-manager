"use client";
import { useEffect, useState } from 'react';
import "./index.scss";

const SunIcon = () => {
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (document !== undefined) {
      const currentTheme = document?.documentElement?.getAttribute('data-theme')
      setChecked(currentTheme === 'dark');
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = checked ? 'light' : 'dark';
    document.cookie = `theme=${newTheme}; path=/; max-age=31536000`;
    document.documentElement.setAttribute('data-theme', newTheme);

    setChecked(!checked);
  }

  return (
    <section title="Toggle Dark Mode">
      <label htmlFor="toggle" className="switch-container">
        <p>Toggle theme</p>
        <input type="checkbox" id="toggle" checked={checked} onChange={toggleTheme} />
        <span className="slider" />
      </label>
    </section>
  );
}

export default SunIcon;
