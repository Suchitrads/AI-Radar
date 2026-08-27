import React, { useState, useEffect } from 'react';
import { Search, Bell, Menu, Activity, ShieldCheck, Mic, Sun, Moon, X, ArrowRight } from 'lucide-react';
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
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Everyday Updates Sync',
      body: 'Daily RSS sources checked: 5 new stories downloaded.',
      time: '10m ago',
      route: '/latest',
      fullDescription: 'The AI RADAR collection engine successfully ran its scheduled scan across 15 active RSS intelligence feeds. A total of 5 fresh, high-impact stories regarding Gemini 1.5, OpenAI security policies, and FastAPI performance fixes were discovered, de-duplicated, and loaded. Match scores have been computed against your profile.'
    },
    {
      id: 2,
      title: 'Impact Radar Evaluation',
      body: 'AI stack vulnerabilities analyzed on project dependencies.',
      time: '1h ago',
      route: '/impact-radar',
      fullDescription: 'Gemini conducted a cross-dependency security audit on your registered projects. A new vulnerability was detected in a sub-dependency of PyTorch. The impact has been catalogued, and a mitigation recommendation (upgrading to v2.3.1) is now visible on the Impact Radar page.'
    },
    {
      id: 3,
      title: 'Briefing Report Ready',
      body: 'Gemini synthesized summary of security changes.',
      time: '2h ago',
      route: '/important',
      fullDescription: 'A comprehensive summary briefing is ready for review. This report synthesizes the 3 most significant security patches released in the past 24 hours, focusing on practical risk levels and action items for developers. The briefing score is calculated at 8.7/10.'
    }
  ]);

  const handleNotificationClick = (n) => {
    setSelectedNotification(n);
    setIsNotificationsOpen(false);
  };

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
                    <button
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className="w-full text-[11px] p-2.5 rounded-xl bg-slate-900/60 border border-white/5 hover:bg-slate-800/80 hover:border-cyan-500/30 active:scale-[0.98] transition-all text-left block cursor-pointer space-y-0.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-200">{n.title}</span>
                        <span className="text-[9px] text-slate-500">{n.time}</span>
                      </div>
                      <p className="text-slate-400 leading-relaxed">{n.body}</p>
                    </button>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 text-center py-4">No new notifications</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notification Detail Modal */}
      {selectedNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in">
          <div className="glass-panel w-full max-w-md rounded-3xl border border-white/10 bg-[#0A0D18]/95 p-6 space-y-4 shadow-2xl relative text-left">
            <button
              onClick={() => setSelectedNotification(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
              aria-label="Close details"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 pb-2 border-b border-white/5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                <Bell className="h-4 w-4 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase text-slate-200 tracking-wider">
                  System Intelligence Alert
                </h3>
                <span className="text-[9px] text-slate-500 font-semibold uppercase">
                  {selectedNotification.time}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-extrabold text-slate-100">
                {selectedNotification.title}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-4 rounded-2xl border border-white/5 select-text">
                {selectedNotification.fullDescription}
              </p>
            </div>

            {selectedNotification.route && (
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setSelectedNotification(null)}
                  className="rounded-xl border border-white/10 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    navigate(selectedNotification.route);
                    setSelectedNotification(null);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <span>Open Feed</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
