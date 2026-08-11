import { NavLink, useLocation } from 'react-router-dom';
import { Home, Utensils, Image, Info, Star, CalendarDays } from 'lucide-react';
import { motion } from 'framer-motion';

const links = [
  { to: '/', label: 'HOME', icon: Home },
  { to: '/menu', label: 'MENU', icon: Utensils },
  { to: '/gallery', label: 'GALLERY', icon: Image },
  { to: '/about', label: 'ABOUT', icon: Info },
  { to: '/reviews', label: 'REVIEWS', icon: Star },
  { to: '/reserve', label: 'RESERVE', icon: CalendarDays },
];

export default function MobileBottomNav() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/stall-admin') || location.pathname.startsWith('/login');

  if (isAdminRoute) return null;

  return (
    <motion.div 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
      className="fixed bottom-4 left-2 right-2 z-50 lg:hidden"
    >
      <div className="mx-auto flex h-16 w-full max-w-[28rem] items-center justify-between gap-1 rounded-2xl border border-[rgba(255,255,255,0.08)] bg-surface/90 px-2 backdrop-blur-xl shadow-lux">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `relative flex flex-col items-center justify-center flex-1 h-[3.25rem] rounded-2xl transition-all duration-300 ${
                  isActive
                    ? 'bg-white/10 text-paper-cream shadow-inner'
                    : 'text-dusk-grey hover:text-paper-cream hover:bg-white/5'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`mb-1 h-[1.125rem] w-[1.125rem] transition-transform duration-300 ${
                      isActive ? 'scale-110' : ''
                    }`}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  <span className="text-[8px] sm:text-[9px] font-bold tracking-widest uppercase">
                    {link.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </motion.div>
  );
}
