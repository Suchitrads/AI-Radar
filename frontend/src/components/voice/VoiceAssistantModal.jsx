import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, Mic, MicOff, Volume2, VolumeX, RotateCcw, 
  Send, Sparkles, AlertTriangle, Loader2, 
  ArrowRight, Compass, History, ExternalLink 
} from 'lucide-react';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import * as voiceService from '../../services/voiceService';

export default function VoiceAssistantModal({ isOpen, onClose, projectId = null, storyId = null }) {
  const navigate = useNavigate();
  const [typedInput, setTypedInput] = useState('');
  const responseEndRef = useRef(null);
  
  const {
    isListening,
    isProcessing,
    isSpeaking,
    transcript,
    response,
    error,
    recentQueries,
    startListening,
    stopListening,
    sendQuery,
    speak,
    stopSpeaking,
    reset,
  } = useVoiceAssistant();

  const speechSupported = voiceService.isSupported();

  // Reset state when opening/closing
  useEffect(() => {
    if (isOpen) {
      reset();
      // Start listening automatically if speech is supported
      if (speechSupported) {
        const timer = setTimeout(() => {
          startListening(projectId, storyId);
        }, 400);
        return () => clearTimeout(timer);
      }
    } else {
      reset();
    }
  }, [isOpen, startListening, reset, speechSupported, projectId, storyId]);

  // Auto-scroll response into view
  useEffect(() => {
    if (responseEndRef.current) {
      responseEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [response, transcript, error, isProcessing]);

  // Handle navigation redirect if returned in backend data
  useEffect(() => {
    if (response && response.data && response.data.navigation_route) {
      const timer = setTimeout(() => {
        navigate(response.data.navigation_route);
        onClose();
      }, 2500); // Wait 2.5s to let the user hear/read the response
      return () => clearTimeout(timer);
    }
  }, [response, navigate, onClose]);

  if (!isOpen) return null;

  const handleTypeSubmit = (e) => {
    e.preventDefault();
    if (typedInput.trim()) {
      sendQuery(typedInput, projectId, storyId);
      setTypedInput('');
    }
  };

  const handleRecentClick = (queryText) => {
    sendQuery(queryText, projectId, storyId);
  };

  // Determine current assistant state string
  let stateLabel = 'IDLE';
  if (isListening) stateLabel = 'LISTENING';
  else if (isProcessing) stateLabel = 'PROCESSING';
  else if (isSpeaking) stateLabel = 'RESPONDING';
  else if (error) stateLabel = 'ERROR';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="voice-assistant-title"
    >
      <div className="glass-panel w-full max-w-lg rounded-3xl border border-white/10 bg-[#0A0D18]/95 p-6 flex flex-col max-h-[85vh] shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-600/10 border border-violet-500/30">
              <Sparkles className="h-4 w-4 text-violet-400 animate-pulse" />
            </div>
            <div>
              <h2 id="voice-assistant-title" className="text-sm font-black tracking-widest uppercase text-slate-200">
                AI RADAR VOICE
              </h2>
              <span className="text-[10px] text-slate-400 font-semibold">
                Voice Assistant
              </span>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/5 bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
            aria-label="Close voice assistant"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body (Scrollable container) */}
        <div className="flex-1 overflow-y-auto py-6 space-y-6 scrollbar-thin">
          
          {/* Main Visual Waveform & State Indicator */}
          <div className="flex flex-col items-center justify-center text-center space-y-4 py-4">
            
            {/* Visual Mic Button */}
            <div className="relative flex items-center justify-center">
              {/* Concentric waves during LISTENING */}
              {isListening && (
                <>
                  <div className="absolute inset-0 rounded-full bg-cyan-500/20 border border-cyan-500/30 animate-ping" style={{ animationDuration: '2s' }} />
                  <div className="absolute -inset-4 rounded-full bg-violet-500/10 border border-violet-500/20 animate-pulse" style={{ animationDuration: '1.5s' }} />
                </>
              )}
              
              {/* Core trigger button */}
              <button
                onClick={() => {
                  if (isListening) stopListening();
                  else startListening(projectId, storyId);
                }}
                disabled={isProcessing}
                className={`relative z-10 flex h-20 w-20 items-center justify-center rounded-full border shadow-xl transition-all duration-300 cursor-pointer disabled:opacity-50 ${
                  isListening
                    ? 'border-cyan-500 bg-cyan-950/80 text-cyan-400 glow-cyan hover:scale-105'
                    : isSpeaking
                    ? 'border-violet-500 bg-violet-950/80 text-violet-400 glow-violet hover:scale-105'
                    : error
                    ? 'border-rose-500 bg-rose-950/80 text-rose-400'
                    : 'border-white/10 bg-slate-900/90 text-slate-300 hover:border-violet-500/40 hover:text-violet-400 hover:scale-105'
                }`}
                aria-label={isListening ? "Stop listening" : "Start listening"}
              >
                {isListening ? (
                  <Mic className="h-8 w-8 animate-pulse" />
                ) : isSpeaking ? (
                  <Volume2 className="h-8 w-8 animate-bounce" />
                ) : isProcessing ? (
                  <Loader2 className="h-8 w-8 animate-spin" />
                ) : !speechSupported ? (
                  <MicOff className="h-8 w-8 text-slate-500" />
                ) : (
                  <Mic className="h-8 w-8" />
                )}
              </button>
            </div>

            {/* State Label & Sound Waves */}
            <div className="space-y-1">
              <span className={`text-[11px] font-black uppercase tracking-widest ${
                isListening ? 'text-cyan-400' : isSpeaking ? 'text-violet-400' : error ? 'text-rose-400' : 'text-slate-400'
              }`}>
                ● {stateLabel}
              </span>
              
              {/* Sound wave visualizer when listening or responding */}
              {(isListening || isSpeaking) && (
                <div className="flex items-center justify-center gap-1 h-6 pt-1">
                  <div className={`w-0.5 rounded-full animate-bounce ${isListening ? 'bg-cyan-400' : 'bg-violet-400'} h-3`} style={{ animationDelay: '0.1s' }} />
                  <div className={`w-0.5 rounded-full animate-bounce ${isListening ? 'bg-cyan-400' : 'bg-violet-400'} h-5`} style={{ animationDelay: '0.2s' }} />
                  <div className={`w-0.5 rounded-full animate-bounce ${isListening ? 'bg-cyan-400' : 'bg-violet-400'} h-4`} style={{ animationDelay: '0.3s' }} />
                  <div className={`w-0.5 rounded-full animate-bounce ${isListening ? 'bg-cyan-400' : 'bg-violet-400'} h-6`} style={{ animationDelay: '0.4s' }} />
                  <div className={`w-0.5 rounded-full animate-bounce ${isListening ? 'bg-cyan-400' : 'bg-violet-400'} h-3`} style={{ animationDelay: '0.5s' }} />
                </div>
              )}
            </div>
          </div>

          {/* Transcript Panel (User input) */}
          {(transcript || isListening) && (
            <div className="rounded-2xl border border-white/5 bg-slate-950/60 p-4 space-y-1 animate-slide-in">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                You
              </span>
              <p className="text-xs md:text-sm text-slate-200 font-medium italic">
                "{transcript || 'Listening for speech...'}"
              </p>
            </div>
          )}

          {/* Response Panel (AI output) */}
          {response && (
            <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-r from-violet-950/10 via-slate-900/80 to-violet-950/10 p-5 space-y-4 animate-slide-in">
              <div className="flex items-center justify-between">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-violet-400">
                  AI RADAR
                </span>
                {isSpeaking && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-violet-300">
                    <Volume2 className="h-3.5 w-3.5 text-violet-400 animate-pulse" /> Speaking...
                  </span>
                )}
              </div>
              
              <p className="text-xs md:text-sm text-slate-200 leading-relaxed font-medium">
                {response.answer}
              </p>

              {/* TTS Controls */}
              <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                <button
                  onClick={() => speak(response.answer)}
                  className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 hover:text-white transition-all cursor-pointer"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Replay</span>
                </button>
                <button
                  onClick={stopSpeaking}
                  disabled={!isSpeaking}
                  className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 hover:text-white transition-all cursor-pointer disabled:opacity-50"
                >
                  <VolumeX className="h-3 w-3" />
                  <span>Stop</span>
                </button>
              </div>

              {/* Dynamic Action Buttons/References */}
              {((response.data && response.data.stories) || response.data?.project_id) && (
                <div className="space-y-2 pt-2 border-t border-white/5">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    References
                  </span>
                  
                  <div className="flex flex-wrap gap-2">
                    {/* View project/Impact Radar button */}
                    {response.data.project_id && (
                      <button
                        onClick={() => {
                          navigate(`/projects/${response.data.project_id}/impact`);
                          onClose();
                        }}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:scale-105 cursor-pointer"
                      >
                        <Compass className="h-3.5 w-3.5" />
                        <span>View Impact Radar</span>
                      </button>
                    )}

                    {/* View Story links */}
                    {response.data.stories && response.data.stories.map((story) => (
                      <button
                        key={story.id}
                        onClick={() => {
                          navigate(`/stories/${story.id}`);
                          onClose();
                        }}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-900/80 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:border-white/20 hover:bg-slate-800 transition-all cursor-pointer"
                      >
                        <span>{story.title}</span>
                        <ExternalLink className="h-3 w-3 text-slate-400 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error Panel */}
          {error && (
            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 flex gap-3 animate-slide-in">
              <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0" />
              <div className="space-y-1">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-rose-400">
                  Error
                </span>
                <p className="text-xs text-rose-300 font-semibold">
                  {error}
                </p>
              </div>
            </div>
          )}

          {/* Speech Unsupported message */}
          {!speechSupported && (
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-center">
              <p className="text-xs text-amber-300 font-semibold leading-relaxed">
                Voice input isn't supported in this browser.
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                Use the text input below to ask your question instead.
              </p>
            </div>
          )}

          {/* Recent Queries History */}
          {recentQueries.length > 0 && (
            <div className="space-y-2 shrink-0">
              <span className="block text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                <History className="h-3.5 w-3.5" /> Recent Queries
              </span>
              <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto scrollbar-thin">
                {recentQueries.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleRecentClick(q)}
                    className="rounded-xl border border-white/5 bg-slate-900/40 px-3.5 py-1.5 text-xs text-slate-300 hover:text-white hover:border-violet-500/30 hover:bg-slate-800/80 transition-all text-left truncate max-w-full cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Anchor to scroll to */}
          <div ref={responseEndRef} />
        </div>

        {/* Modal Footer: Type alternative input */}
        <form onSubmit={handleTypeSubmit} className="pt-4 border-t border-white/5 flex gap-2 shrink-0">
          <input
            type="text"
            value={typedInput}
            onChange={(e) => setTypedInput(e.target.value)}
            placeholder="Type your question..."
            className="flex-1 rounded-xl border border-white/10 bg-slate-900/85 px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            disabled={isProcessing}
            aria-label="Type your question"
          />
          <button
            type="submit"
            disabled={isProcessing || !typedInput.trim()}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:hover:scale-100"
            aria-label="Send query"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
