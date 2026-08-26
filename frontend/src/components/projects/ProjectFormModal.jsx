import React, { useState } from 'react';
import { X, Plus, FolderPlus, Loader2 } from 'lucide-react';
import { createProject } from '../../services/api';

export default function ProjectFormModal({ isOpen, onClose, onProjectCreated }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    frontend: '',
    backend: '',
    database: '',
    infrastructure: '',
    ai_stack: '',
    technologiesStr: '',
    topicsStr: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Project name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        frontend: formData.frontend.trim() || null,
        backend: formData.backend.trim() || null,
        database: formData.database.trim() || null,
        infrastructure: formData.infrastructure.trim() || null,
        ai_stack: formData.ai_stack.trim() || null,
        technologies: formData.technologiesStr
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        topics: formData.topicsStr
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
      };

      const created = await createProject(payload);
      if (onProjectCreated) {
        onProjectCreated(created);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 overflow-y-auto">
      <div className="glass-panel relative w-full max-w-xl rounded-2xl border border-white/10 bg-[#0B1020]/95 p-6 md:p-8 shadow-2xl shadow-blue-500/10 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <FolderPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Create New Project</h2>
              <p className="text-xs text-slate-400">
                Register a project to enable AI Impact Radar analyses
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400 font-medium">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Project Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. AI Security Platform"
              className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={2}
              placeholder="Brief description of project goals and scope..."
              className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Stack Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Frontend Framework
              </label>
              <input
                type="text"
                name="frontend"
                value={formData.frontend}
                onChange={handleChange}
                placeholder="e.g. React, Next.js, Vite"
                className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Backend Framework
              </label>
              <input
                type="text"
                name="backend"
                value={formData.backend}
                onChange={handleChange}
                placeholder="e.g. FastAPI, Express, Django"
                className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Database
              </label>
              <input
                type="text"
                name="database"
                value={formData.database}
                onChange={handleChange}
                placeholder="e.g. SQLite, PostgreSQL, Redis"
                className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Infrastructure
              </label>
              <input
                type="text"
                name="infrastructure"
                value={formData.infrastructure}
                onChange={handleChange}
                placeholder="e.g. Local, Cloud, Vercel"
                className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              AI Stack
            </label>
            <input
              type="text"
              name="ai_stack"
              value={formData.ai_stack}
              onChange={handleChange}
              placeholder="e.g. Gemini API, OpenAI, LangChain, PyTorch"
              className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Technologies (comma separated)
            </label>
            <input
              type="text"
              name="technologiesStr"
              value={formData.technologiesStr}
              onChange={handleChange}
              placeholder="Python, FastAPI, Gemini, React, Tailwind CSS"
              className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Topics of Interest (comma separated)
            </label>
            <input
              type="text"
              name="topicsStr"
              value={formData.topicsStr}
              onChange={handleChange}
              placeholder="AI Security, LLM Security, Autonomous Agents, RAG"
              className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Buttons */}
          <div className="mt-8 flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 bg-slate-900/60 px-5 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-indigo-500 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving Project...</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Create Project</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
