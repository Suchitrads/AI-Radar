import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Flame,
  Radar,
  FolderGit2,
  Bookmark,
} from 'lucide-react';

export default function BottomNav() {
  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Swipe Reel', path: '/swipe', icon: Flame, isSpecial: true },
    { label: 'Radar', path: '/impact-radar', icon: Radar },
    { label: 'Projects', path: '/projects', icon: FolderGit2 },
    { label: 'Saved', path: '/saved', icon: Bookmark },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden border-t border-white/10 bg-[#05070E]/90 backdrop-blur-xl px-2 py-2">
      <nav className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `relative flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl transition-all duration-200 ${
                  isActive
                    ? item.isSpecial
                      ? 'text-cyan-400 font-bold scale-105'
                      : 'text-cyan-400 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {item.isSpecial ? (
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 via-violet-500 to-rose-500 text-white shadow-lg transition-transform ${
                        isActive ? 'scale-110 shadow-cyan-500/40 glow-cyan animate-pulse' : 'opacity-80'
                      }`}
                    >
                      <Icon className="h-5 w-5 fill-white" />
                    </div>
                  ) : (
                    <div className="relative">
                      <Icon className={`h-5 w-5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                      {isActive && (
                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
                      )}
                    </div>
                  )}

                  {!item.isSpecial && (
                    <span className="text-[10px] tracking-tight font-medium">
                      {item.label}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
