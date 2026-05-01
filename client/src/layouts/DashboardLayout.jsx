import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../context/UserContext';
import Background3D from '../components/Background3D';
import {
  FiLogOut, FiMenu, FiX, FiSun, FiMoon, FiUser, FiChevronRight
} from 'react-icons/fi';

const NAV_ITEMS = [
  { path: '/dashboard', iconEmoji: '📊', label: 'Overview', end: true },
  { path: '/dashboard/timeline', iconEmoji: '📅', label: 'Timeline' },
  { path: '/dashboard/chat', iconEmoji: '🤖', label: 'AI Chat' },
  { path: '/dashboard/booth', iconEmoji: '📍', label: 'Booth' },
  { path: '/dashboard/eci-map', iconEmoji: '🌐', label: 'ECI Map' },
  { path: '/dashboard/parliament', iconEmoji: '🏛️', label: 'Parliament' },
  { path: '/dashboard/scenarios', iconEmoji: '🎭', label: 'Scenarios' },
  { path: '/dashboard/quiz', iconEmoji: '🧠', label: 'Quiz' },
  { path: '/dashboard/translator', iconEmoji: '🌐', label: 'Translate' },
];

/* ── Staggered children animation ── */
const sidebarNav = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.15 } },
  exit: { opacity: 0, transition: { staggerChildren: 0.03, staggerDirection: -1 } },
};
const sidebarItem = {
  hidden: { opacity: 0, x: -24 },
  show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  exit: { opacity: 0, x: -24 },
};

export default function DashboardLayout() {
  const { user, aiStatus, logoutUser } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleLogout = () => {
    logoutUser();
    navigate('/auth');
  };

  const UserAvatar = ({ size = 'w-8 h-8', textSize = 'text-xs' }) => (
    user?.avatar ? (
      <img src={user.avatar} alt="" className={`${size} rounded-full object-cover shadow-sm`} referrerPolicy="no-referrer" />
    ) : (
      <div className={`${size} rounded-full bg-bg-elevated border border-border flex items-center justify-center ${textSize} font-bold text-primary shadow-sm`}>
        {user?.name?.charAt(0)?.toUpperCase()}
      </div>
    )
  );

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-bg-dark transition-colors duration-500">
      <Background3D isDarkMode={isDarkMode} />

      {/* ====== TOP HORIZONTAL NAVBAR ====== */}
      <header className="sticky top-0 z-40 bg-bg-card/80 backdrop-blur-xl border-b border-border shadow-sm px-4 lg:px-6 flex-shrink-0 transition-colors duration-500">
        <div className="flex items-center justify-between h-16">
          
          {/* Left: Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-bg-elevated flex items-center justify-center text-lg shadow-md shadow-primary/20">
              🗳️
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base font-bold text-primary leading-tight">VotePath AI</h1>
              <p className="text-[10px] text-text-muted leading-tight font-medium uppercase tracking-wider">Election Commission</p>
            </div>
          </div>

          {/* Center: Desktop Navigation Links */}
          <nav className="hidden lg:flex flex-1 justify-center items-center px-8 space-x-1">
            {NAV_ITEMS.map(({ path, iconEmoji, label, end }) => (
              <NavLink key={path} to={path} end={end}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group relative ${
                    isActive
                      ? 'bg-bg-elevated'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated/50'
                  }`
                }>
                {({ isActive }) => (
                  <>
                    <span className="text-lg">{iconEmoji}</span>
                    <span className={isActive ? 'text-text-primary font-semibold' : ''}>{label}</span>
                    {isActive && (
                      <motion.div layoutId="topNavIndicator"
                        className="absolute bottom-0 left-2 right-2 h-0.5 rounded-t-full bg-primary"
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Right: Theme Toggle, User Profile & Hamburger */}
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2 rounded-lg text-text-muted hover:bg-bg-elevated hover:text-accent transition-colors" title="Toggle Theme">
              {isDarkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
            </button>
            <div className="hidden md:flex items-center gap-3 pl-2 border-l border-border ml-1">
              <div className="text-right">
                <p className="text-sm font-semibold text-text-primary leading-none">{user?.name}</p>
                <p className="text-[10px] text-text-muted mt-1">{user?.state}</p>
              </div>
              <NavLink to="/dashboard/profile" className="hover:opacity-80 transition-opacity" title="My Profile">
                <UserAvatar />
              </NavLink>
              <button onClick={handleLogout}
                className="p-2 rounded-lg text-text-muted hover:text-accent hover:bg-accent/10 transition-colors"
                title="Logout">
                <FiLogOut size={16} />
              </button>
            </div>

            {/* Hamburger — animated tap */}
            <motion.button
              onClick={() => setMobileMenuOpen(true)}
              whileTap={{ scale: 0.8 }}
              className="lg:hidden p-2 rounded-lg text-text-secondary hover:bg-bg-elevated hover:text-text-primary transition-colors">
              <FiMenu size={22} />
            </motion.button>
          </div>
        </div>
      </header>

      {/* ====== MAIN CONTENT ====== */}
      <main className="flex-1 overflow-y-auto w-full relative">
        <div className="p-4 lg:p-8 max-w-7xl mx-auto h-full">
          <Outlet />
        </div>
      </main>

      {/* ====== MOBILE SIDEBAR — PREMIUM REDESIGN ====== */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Dark backdrop with blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Sidebar Panel */}
            <motion.aside
              initial={{ x: -300, opacity: 0.5 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              className="fixed top-0 left-0 z-50 h-full w-[280px] bg-bg-card/95 backdrop-blur-xl border-r border-border/50 flex flex-col lg:hidden shadow-2xl shadow-black/40"
            >
              {/* ── Tricolor strip at top ── */}
              <div className="h-1 w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808] flex-shrink-0" />

              {/* ── Header with close button ── */}
              <div className="px-5 py-4 flex items-center justify-between">
                <motion.div
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08, type: 'spring', stiffness: 300, damping: 20 }}
                  className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-bg-elevated flex items-center justify-center text-lg shadow-md">
                    🗳️
                  </div>
                  <div>
                    <h1 className="text-sm font-bold text-primary leading-tight">VotePath AI</h1>
                    <p className="text-[9px] text-text-muted uppercase tracking-widest font-medium">Election Assistant</p>
                  </div>
                </motion.div>

                <motion.button
                  onClick={() => setMobileMenuOpen(false)}
                  whileTap={{ scale: 0.8, rotate: 90 }}
                  whileHover={{ rotate: 90 }}
                  className="p-2 rounded-xl text-text-muted hover:bg-bg-elevated hover:text-primary transition-colors">
                  <FiX size={20} />
                </motion.button>
              </div>

              {/* ── Profile Card ── */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 280, damping: 22 }}>
                <NavLink to="/dashboard/profile" onClick={() => setMobileMenuOpen(false)}
                  className="mx-4 mb-2 flex items-center gap-3 p-3.5 rounded-xl bg-bg-elevated/70 border border-border/60 hover:border-primary/30 hover:bg-bg-elevated transition-all group">
                  <UserAvatar size="w-10 h-10" textSize="text-sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate text-text-primary">{user?.name}</p>
                    <p className="text-[10px] text-text-muted truncate">{user?.state} • Age {user?.age}</p>
                  </div>
                  <FiChevronRight size={14} className="text-text-muted group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </NavLink>
              </motion.div>

              {/* ── Navigation Links — Staggered entrance ── */}
              <motion.nav
                variants={sidebarNav}
                initial="hidden"
                animate="show"
                exit="exit"
                className="flex-1 py-3 px-4 space-y-0.5 overflow-y-auto">
                {NAV_ITEMS.map(({ path, iconEmoji, label, end }) => (
                  <motion.div key={path} variants={sidebarItem}>
                    <NavLink to={path} end={end}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all relative overflow-hidden ${
                          isActive
                            ? 'bg-primary/10 text-primary font-semibold border border-primary/20'
                            : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary border border-transparent'
                        }`
                      }>
                      {({ isActive }) => (
                        <>
                          {/* Active indicator bar */}
                          {isActive && (
                            <motion.div
                              layoutId="mobileSidebarIndicator"
                              className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-primary"
                              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                            />
                          )}
                          <span className="text-xl">{iconEmoji}</span>
                          <span className="flex-1">{label}</span>
                          {isActive && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                              className="w-1.5 h-1.5 rounded-full bg-primary"
                            />
                          )}
                        </>
                      )}
                    </NavLink>
                  </motion.div>
                ))}
              </motion.nav>

              {/* ── Bottom Actions ── */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="p-4 border-t border-border/50 bg-bg-elevated/30">
                <div className="flex items-center justify-between gap-3">
                  <button onClick={toggleTheme}
                    className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm text-text-secondary hover:bg-bg-elevated hover:text-accent transition-all border border-border">
                    {isDarkMode ? <FiSun size={15} /> : <FiMoon size={15} />}
                    <span className="text-xs font-medium">{isDarkMode ? 'Light' : 'Dark'}</span>
                  </button>
                  <button onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-primary hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20">
                    <FiLogOut size={15} />
                    Logout
                  </button>
                </div>
              </motion.div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
