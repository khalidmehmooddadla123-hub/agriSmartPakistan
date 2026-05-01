import { useEffect } from 'react';

/**
 * Public pages (landing, login, register) are designed only for light mode.
 * If the user toggled dark mode while logged in, the `dark` class on <html>
 * would override .bg-white / .text-gray-900 to dark variants and make text
 * invisible. This hook temporarily removes the class while the page is mounted
 * and restores it on unmount so the user's saved preference is preserved.
 */
export default function useForceLight() {
  useEffect(() => {
    const root = document.documentElement;
    const wasDark = root.classList.contains('dark');
    if (wasDark) root.classList.remove('dark');
    return () => {
      if (wasDark) root.classList.add('dark');
    };
  }, []);
}
