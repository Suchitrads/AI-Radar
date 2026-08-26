import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Flame,
  Clock,
  Zap,
  Bookmark,
  FolderGit2,
  Radar,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  Radio
} from 'lucide-react';

export default function Sidebar({ isOpenMobile, setIsOpenMobile, isCollapsed, setIsCollapsed }) {
  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Swipe Reel', path: '/swipe', icon: Flame, isSpecial: true },
    { label: 'Latest', path: '/latest', icon: Clock },
    { label: 'Important', path: '/important', icon: Zap },
    { label: 'Saved', path: '/saved', icon: Bookmark },
    { label: 'Projects', path: '/projects', icon: FolderGit2 },
    { label: 'Impact Radar', path: '/impact-radar', icon: Radar, highlight: true },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col border-r border-white/10 bg-[#05070E]/95 backdrop-blur-xl transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header / Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-white/10">
          <NavLink to="/dashboard" className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 via-violet-600 to-rose-500 text-white shadow-lg shadow-cyan-500/25 glow-cyan">
              <Radar className="h-5 w-5 animate-pulse" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-base font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-violet-300">
                  AI RADAR
                </span>
                <span className="text-[10px] font-bold text-cyan-400 tracking-widest uppercase flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                  Intelligence Radar
                </span>
              </div>
            )}
          </NavLink>

          {/* Desktop Toggle Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-slate-900/60 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={() => setIsOpenMobile(false)}
            className="flex lg:hidden h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-slate-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-6 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpenMobile(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 rounded-2xl px-3.5 py-3 text-sm font-medium transition-all duration-200 group relative ${
                    isActive
                      ? item.isSpecial
                        ? 'bg-gradient-to-r from-cyan-500/25 via-violet-500/25 to-rose-500/25 border border-cyan-400/50 text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.2)] font-bold'
                        : 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-bold'
                      : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                      isActive ? (item.isSpecial ? 'text-rose-400 fill-rose-500 animate-bounce' : 'text-cyan-400') : 'text-slate-400 group-hover:text-slate-200'
                    }`} />
                    
                    {!isCollapsed && (
                      <span className="truncate tracking-wide flex-1">
                        {item.label}
                      </span>
                    )}

                    {item.isSpecial && !isCollapsed && (
                      <span className="rounded-full bg-rose-500/20 border border-rose-500/40 px-2 py-0.5 text-[9px] font-extrabold text-rose-400 uppercase tracking-widest">
                        HOT
                      </span>
                    )}

                    {isCollapsed && (
                      <div className="absolute left-full ml-3 hidden rounded-lg border border-white/10 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-xl group-hover:block z-50 whitespace-nowrap">
                        {item.label}
                      </div>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Bottom Settings & User Area */}
        <div className="p-3 border-t border-white/10 space-y-1.5">
          <NavLink
            to="/settings"
            onClick={() => setIsOpenMobile(false)}
            className={({ isActive }) =>
              `flex items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                isActive ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`
            }
          >
            <Settings className="h-5 w-5 shrink-0" />
            {!isCollapsed && <span>Settings</span>}
          </NavLink>

          {/* Removed AI Analyst live info */}
        </div>
      </aside>
    </>
  );
}
