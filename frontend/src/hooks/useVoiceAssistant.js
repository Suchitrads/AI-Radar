import { useState, useEffect, useCallback, useRef } from 'react';
import * as voiceService from '../services/voiceService';
import { voiceQuery } from '../services/api';

export function useVoiceAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [recentQueries, setRecentQueries] = useState(() => {
    try {
      const stored = sessionStorage.getItem('airadar_voice_history');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });

  const activeRecognitionRef = useRef(null);
  const latestTranscriptRef = useRef('');

  // Synchronize query history with sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem('airadar_voice_history', JSON.stringify(recentQueries));
    } catch (e) {
      console.warn("SessionStorage write failed:", e);
    }
  }, [recentQueries]);

  const addQueryToHistory = useCallback((queryStr) => {
    if (!queryStr || !queryStr.trim()) return;
    setRecentQueries((prev) => {
      const cleaned = queryStr.trim();
      const filtered = prev.filter((q) => q.toLowerCase() !== cleaned.toLowerCase());
      return [cleaned, ...filtered].slice(0, 10); // Keep last 10 queries
    });
  }, []);

  const stopSpeaking = useCallback(() => {
    voiceService.stopSpeaking();
    setIsSpeaking(false);
  }, []);

  const stopListening = useCallback(() => {
    voiceService.stopListening();
    setIsListening(false);
    if (activeRecognitionRef.current) {
      activeRecognitionRef.current = null;
    }
  }, []);

  const speak = useCallback((text) => {
    if (!text) return;
    setIsSpeaking(true);
    voiceService.speak(
      text,
      () => setIsSpeaking(false), // onEnd
      (err) => {
        console.error("Speech Synthesis Error:", err);
        setIsSpeaking(false);
      }
    );
  }, []);

  const sendQuery = useCallback(async (queryText, projectId = null, storyId = null) => {
    if (!queryText || !queryText.trim()) {
      setError("I didn't catch that. Please try again.");
      return;
    }

    stopSpeaking();
    stopListening();
    setIsProcessing(true);
    setTranscript(queryText);
    setError(null);
    setResponse(null);

    try {
      const res = await voiceQuery(queryText, projectId, storyId);
      setResponse(res);
      addQueryToHistory(queryText);
      setIsProcessing(false);

      if (res && res.answer) {
        speak(res.answer);
      }
    } catch (err) {
      console.error("Backend voice query failed:", err);
      setError(err.message || "AI RADAR couldn't process your request. Please try again.");
      setIsProcessing(false);
    }
  }, [addQueryToHistory, speak, stopListening, stopSpeaking]);

  const startListening = useCallback((projectId = null, storyId = null) => {
    stopSpeaking();
    setError(null);
    setTranscript('');
    latestTranscriptRef.current = '';
    setIsListening(true);

    let finalText = '';

    const rec = voiceService.startListening({
      onResult: ({ transcript: currentText, finalTranscript }) => {
        setTranscript(currentText);
        latestTranscriptRef.current = currentText;
        if (finalTranscript) {
          finalText = finalTranscript;
        }
      },
      onEnd: () => {
        setIsListening(false);
        activeRecognitionRef.current = null;
        const textToSubmit = finalText || latestTranscriptRef.current;
        if (textToSubmit && textToSubmit.trim()) {
          sendQuery(textToSubmit, projectId, storyId);
        } else {
          // If speech recognition ended without producing any text
          setIsListening(false);
        }
      },
      onError: (err) => {
        console.error("Speech Recognition Error:", err);
        setError(err.message || "Speech recognition failed. Please try again.");
        setIsListening(false);
        activeRecognitionRef.current = null;
      }
    });

    activeRecognitionRef.current = rec;
  }, [sendQuery, stopSpeaking]);

  const reset = useCallback(() => {
    stopSpeaking();
    stopListening();
    setTranscript('');
    setResponse(null);
    setError(null);
    setIsProcessing(false);
  }, [stopListening, stopSpeaking]);

  // Clean up synthesis on unmount
  useEffect(() => {
    return () => {
      voiceService.stopSpeaking();
      voiceService.stopListening();
    };
  }, []);

  return {
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
  };
}
