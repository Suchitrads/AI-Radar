import React, { useState, useEffect } from 'react';
import { Search, Bell, Menu, Activity, ShieldCheck, Mic, Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Header({
  title = 'Dashboard',
  subtitle,
  onMenuClick,
  searchQuery = '',
  onSearchChange,
  onVoiceClick,
  theme = 'dark',
  onThemeToggle,
}) {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState(searchQuery);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Everyday Updates Sync', body: 'Daily RSS sources checked: 5 new stories downloaded.', time: '10m ago' },
    { id: 2, title: 'Impact Radar Evaluation', body: 'AI stack vulnerabilities analyzed on project dependencies.', time: '1h ago' },
    { id: 3, title: 'Briefing Report Ready', body: 'Gemini synthesized summary of security changes.', time: '2h ago' }
  ]);

  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearchChange) {
      onSearchChange(searchInput);
    } else {
      navigate(`/latest?search=${encodeURIComponent(searchInput)}`);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setSearchInput(val);
    if (onSearchChange) {
      onSearchChange(val);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-white/5 bg-[#070B14]/80 px-4 md:px-8 backdrop-blur-xl">
      {/* Mobile Menu & Page Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-slate-900/60 text-slate-300 hover:text-white lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-100">
            {title}
          </h1>
          {subtitle && (
            <p className="hidden sm:block text-xs text-slate-400 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Global Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md mx-4 hidden sm:block">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchInput}
            onChange={handleInputChange}
            placeholder="Search AI intelligence, technologies, topics, companies..."
            className="w-full rounded-xl border border-white/10 bg-slate-900/80 py-2.5 pl-10 pr-10 text-xs md:text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
          />
          <button
            type="button"
            onClick={onVoiceClick}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Start voice assistant"
            aria-label="Start voice assistant"
          >
            <Mic className="h-4 w-4" />
          </button>
        </div>
      </form>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Mobile Voice assistant button */}
        <button
          onClick={onVoiceClick}
          className="flex sm:hidden h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-slate-900/60 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          title="Start voice assistant"
          aria-label="Start voice assistant"
        >
          <Mic className="h-4 w-4" />
        </button>

        {/* Backend Status Indicator */}
        <div className="hidden md:flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>FastAPI Live</span>
        </div>

        {/* Theme Selector Button */}
        <button
          onClick={onThemeToggle}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-slate-900/60 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4 text-indigo-400" />
          )}
        </button>

        {/* Notifications Icon with active popover */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-slate-900/60 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
            title="Notifications"
            aria-label="View notifications"
          >
            <Bell className="h-4 w-4" />
            {notifications.length > 0 && (
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-blue-500 ring-4 ring-[#070B14]" />
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-3 w-80 rounded-2xl border border-white/10 bg-[#0A0D18]/95 p-4 shadow-2xl z-50 glass-panel space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="text-xs font-bold text-slate-200">Recent Notifications</span>
                {notifications.length > 0 && (
                  <button 
                    onClick={() => setNotifications([])} 
                    className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    Clear all
                  </button>
                )}
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div key={n.id} className="text-[11px] p-2 rounded-xl bg-slate-900/60 border border-white/5 space-y-0.5 text-left">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-300">{n.title}</span>
                        <span className="text-[9px] text-slate-500">{n.time}</span>
                      </div>
                      <p className="text-slate-400 leading-relaxed">{n.body}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 text-center py-4">No new notifications</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
