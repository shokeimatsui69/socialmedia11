import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useStore } from '../../store/useStore';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export const Shell = () => {
  const { isSidebarOpen } = useStore();

  return (
    <div className="min-h-screen bg-terminal-bg text-terminal-text font-mono selection:bg-terminal-green/20 relative overflow-hidden">
      {/* GLOBAL ATMOSPHERE */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-terminal-green/5 rounded-full blur-[150px]" />
        <div className="absolute inset-0 terminal-scanline opacity-30" />
      </div>

      <Sidebar />
      <main className={cn(
        "transition-all duration-300 min-h-screen flex flex-col relative z-10",
        isSidebarOpen ? "pl-64 max-lg:pl-20" : "pl-20"
      )}>
        <Topbar />
        <div className="flex-1 p-4 md:p-8 overflow-x-hidden border-l border-terminal-border">
          <AnimatePresence mode="wait">
            <motion.div
              key={window.location.pathname}
              initial={{ opacity: 0, x: 5 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -5 }}
              transition={{ duration: 0.15 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};
