import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  FileText, Image, Mic, Youtube, AlignLeft,
  Briefcase, Search, GraduationCap, Menu, X
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { to: '/pdf-notes', icon: FileText, label: 'PDF Notes' },
  { to: '/image-notes', icon: Image, label: 'Image Notes' },
  { to: '/audio-notes', icon: Mic, label: 'Audio Notes' },
  { to: '/yt-notes', icon: Youtube, label: 'YouTube' },
  { to: '/text-notes', icon: AlignLeft, label: 'Text Analysis' },
  { to: '/career', icon: Briefcase, label: 'Career Advisor' },
  { to: '/job-search', icon: Search, label: 'Job Search' },
];

export const Layout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex h-screen bg-background text-foreground font-sans overflow-hidden">
      {/* Grain Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-50 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 border-r border-border bg-paper flex-col z-10 shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-paper border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-primary">
          <GraduationCap className="w-6 h-6" />
          <span className="font-serif text-lg">PrepBuddy</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-foreground p-1">
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-background/80 z-40 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -288 }}
              animate={{ x: 0 }}
              exit={{ x: -288 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="md:hidden fixed left-0 top-0 bottom-0 w-72 bg-paper border-r border-border z-50 flex flex-col"
            >
              <SidebarContent onNavClick={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 overflow-hidden relative md:pt-0 pt-14">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
  return (
    <>
      <div className="p-8">
        <div className="flex items-center gap-3 text-primary mb-2">
          <GraduationCap className="w-8 h-8" />
          <h1 className="font-serif text-2xl tracking-tight">PrepBuddy</h1>
        </div>
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-secondary-foreground">
          Academic Intelligence v1.0
        </p>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavClick}
            className={({ isActive }) => `
              flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 group
              ${isActive
                ? 'bg-primary/10 text-primary shadow-inner-glow'
                : 'hover:bg-secondary/50 text-secondary-foreground hover:text-foreground'}
            `}
          >
            <item.icon className="w-5 h-5 shrink-0" />
            <span className="font-mono text-sm">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-6 border-t border-border mt-auto">
        <div className="p-4 rounded-xl bg-secondary/30 border border-border">
          <p className="text-xs font-mono text-secondary-foreground leading-relaxed">
            "Knowledge is the only instrument of production that is not subject to diminishing returns."
          </p>
        </div>
      </div>
    </>
  );
}
