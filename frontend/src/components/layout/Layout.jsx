import { Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import CommandPalette from './CommandPalette';
import PageTransition from '../PageTransition';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  // Listen for global Cmd+K event
  useEffect(() => {
    const handler = () => setPaletteOpen(true);
    window.addEventListener('open-command-palette', handler);
    return () => window.removeEventListener('open-command-palette', handler);
  }, []);

  return (
    <div className="min-h-screen w-full overflow-x-hidden app-shell">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {/* Sidebar is 272px wide on desktop. Mobile uses overlay drawer. */}
      <div className="lg:pl-[272px] rtl:lg:pl-0 rtl:lg:pr-[272px] min-h-screen flex flex-col">
        <Navbar onMenuClick={() => setSidebarOpen(true)} onSearchClick={() => setPaletteOpen(true)} />
        <main className="flex-1 px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-5 md:py-6 w-full max-w-7xl mx-auto pb-24 lg:pb-6">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
      </div>
      {/* Mobile bottom navigation (hidden on lg) */}
      <BottomNav onMoreClick={() => setSidebarOpen(true)} />
      {/* Global Cmd+K command palette */}
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}
