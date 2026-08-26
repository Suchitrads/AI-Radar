import React, { useEffect, useState } from 'react';
import { getHealth, getSources, runPipeline } from '../services/api';
import { Settings, ShieldCheck, Database, Radio, Server, Cpu, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function SettingsPage() {
  const [health, setHealth] = useState(null);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sync state
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);

  useEffect(() => {
    const fetchSettingsData = async () => {
      setLoading(true);
      try {
        const [healthRes, sourcesRes] = await Promise.all([
          getHealth(),
          getSources(),
        ]);
        setHealth(healthRes);
        setSources(sourcesRes || []);
      } catch (err) {
        console.error('Settings fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettingsData();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await runPipeline();
      setSyncResult(res);
    } catch (err) {
      alert(`Sync Failed: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  };

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Title */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Settings className="h-6 w-6 text-slate-400" />
          <span>System & Environment Settings</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Backend API configuration, health status, and RSS source feeds
        </p>
      </div>

      {/* Backend API Connection Status */}
      <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">FastAPI Backend Connection</h3>
              <p className="text-xs text-slate-400">Target server: {apiBaseUrl}</p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
            <Radio className="h-3 w-3 animate-ping" />
            <span>CONNECTED</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-white/5 text-xs">
          <div className="rounded-xl border border-white/5 bg-slate-900/60 p-3">
            <span className="text-[10px] font-bold uppercase text-slate-400">Service</span>
            <span className="font-semibold text-slate-200 mt-1 block">{health?.service || 'AI RADAR API'}</span>
          </div>

          <div className="rounded-xl border border-white/5 bg-slate-900/60 p-3">
            <span className="text-[10px] font-bold uppercase text-slate-400">API Version</span>
            <span className="font-semibold text-slate-200 mt-1 block">{health?.version || '1.0.0'}</span>
          </div>

          <div className="rounded-xl border border-white/5 bg-slate-900/60 p-3">
            <span className="text-[10px] font-bold uppercase text-slate-400">AI Engine</span>
            <span className="font-semibold text-blue-400 mt-1 block">Gemini 2.5 Flash / 1.5 Flash</span>
          </div>
        </div>
      </div>

      {/* RSS Sources Config */}
      <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/30">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Configured Intelligence Sources</h3>
              <p className="text-xs text-slate-400">{sources.length} active RSS/Atom collectors scanned</p>
            </div>
          </div>

          <button
            onClick={handleSync}
            disabled={syncing}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-indigo-500 transition-all cursor-pointer disabled:opacity-50"
          >
            {syncing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Syncing Updates...</span>
              </>
            ) : (
              <>
                <Radio className="h-4 w-4 text-emerald-400 animate-pulse" />
                <span>Sync Daily Updates Now</span>
              </>
            )}
          </button>
        </div>

        {/* Sync result metrics */}
        {syncResult && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold uppercase tracking-wider">
              <CheckCircle2 className="h-4 w-4" />
              <span>Collector Scan Completed Successfully</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-white/5">
                <span className="block text-[10px] text-slate-400 uppercase font-semibold">Sources Scanned</span>
                <span className="font-mono text-sm font-bold text-slate-200 mt-0.5 block">{syncResult.sources_scanned}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-white/5">
                <span className="block text-[10px] text-slate-400 uppercase font-semibold">Stories Found</span>
                <span className="font-mono text-sm font-bold text-slate-200 mt-0.5 block">{syncResult.stories_discovered}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-white/5">
                <span className="block text-[10px] text-slate-400 uppercase font-semibold">Stored & Analyzed</span>
                <span className="font-mono text-sm font-bold text-slate-200 mt-0.5 block">{syncResult.stories_stored}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-white/5">
                <span className="block text-[10px] text-slate-400 uppercase font-semibold">Duplicates Skipped</span>
                <span className="font-mono text-sm font-bold text-slate-200 mt-0.5 block">{syncResult.duplicates}</span>
              </div>
            </div>
          </div>
        )}

        <div className="divide-y divide-white/5">
          {sources.slice(0, 8).map((src) => (
            <div key={src.id} className="py-2.5 flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-slate-200 block">{src.name}</span>
                <span className="text-[11px] text-slate-400 font-mono">{src.url}</span>
              </div>
              <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-300 uppercase">
                {src.type || 'RSS'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
