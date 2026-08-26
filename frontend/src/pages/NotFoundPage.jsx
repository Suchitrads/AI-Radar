import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Radar, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-500/10 text-blue-400 mb-4">
        <Radar className="h-8 w-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-100">404</h1>
      <h2 className="text-lg font-bold text-slate-300 mt-1">Radar Signal Lost</h2>
      <p className="text-xs text-slate-400 mt-1 max-w-sm">
        The route you are looking for does not exist on the AI RADAR network.
      </p>

      <button
        onClick={() => navigate('/dashboard')}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Return to Dashboard</span>
      </button>
    </div>
  );
}
