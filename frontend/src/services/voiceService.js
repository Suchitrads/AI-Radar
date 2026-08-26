const SpeechRecognition = typeof window !== 'undefined' 
  ? (window.SpeechRecognition || window.webkitSpeechRecognition) 
  : null;

export const isSupported = () => {
  return !!SpeechRecognition;
};

let recognitionInstance = null;

export const startListening = ({
  onResult,
  onEnd,
  onError,
  lang = 'en-IN',
  continuous = false,
  interimResults = true
}) => {
  if (!isSupported()) {
    if (onError) onError(new Error("Voice input isn't supported in this browser."));
    return null;
  }

  if (recognitionInstance) {
    try {
      recognitionInstance.abort();
    } catch (e) {
      console.warn("Aborting existing recognition:", e);
    }
  }

  const rec = new SpeechRecognition();
  rec.lang = lang;
  rec.continuous = continuous;
  rec.interimResults = interimResults;

  rec.onresult = (event) => {
    let interimTranscript = '';
    let finalTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      } else {
        interimTranscript += event.results[i][0].transcript;
      }
    }

    if (onResult) {
      onResult({
        interimTranscript,
        finalTranscript,
        transcript: finalTranscript || interimTranscript
      });
    }
  };

  rec.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
    if (onError) {
      let friendlyError = 'Speech recognition failed.';
      if (event.error === 'not-allowed') {
        friendlyError = 'Microphone access is required for voice input.';
      } else if (event.error === 'no-speech') {
        friendlyError = "I didn't catch that. Please try again.";
      }
      onError(new Error(friendlyError));
    }
  };

  rec.onend = () => {
    recognitionInstance = null;
    if (onEnd) onEnd();
  };

  recognitionInstance = rec;
  rec.start();
  return rec;
};

export const stopListening = () => {
  if (recognitionInstance) {
    try {
      recognitionInstance.stop();
    } catch (e) {
      console.warn("Stopping recognition error:", e);
    }
    recognitionInstance = null;
  }
};

// Text-to-Speech (TTS)
export const isSpeechSynthesisSupported = () => {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
};

export const speak = (text, onEnd, onError) => {
  if (!isSpeechSynthesisSupported()) {
    if (onError) onError(new Error("Speech synthesis is unavailable in this browser."));
    return;
  }

  // Stop any currently speaking voice
  stopSpeaking();

  const utterance = new SpeechSynthesisUtterance(text);

  const setVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    // Prioritize Indian English (en-IN)
    let selectedVoice = voices.find(
      v => v.lang === 'en-IN' || v.lang.startsWith('en-IN') || v.name.includes('India') || v.name.includes('IN')
    );
    // Fallback to default browser English
    if (!selectedVoice) {
      selectedVoice = voices.find(v => v.lang.startsWith('en-') || v.name.includes('English'));
    }
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
  };

  setVoice();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = setVoice;
  }

  utterance.onend = () => {
    if (onEnd) onEnd();
  };

  utterance.onerror = (event) => {
    console.error("Speech synthesis error:", event);
    if (onError) onError(new Error("Speech synthesis failed."));
  };

  window.speechSynthesis.speak(utterance);
};

export const stopSpeaking = () => {
  if (isSpeechSynthesisSupported()) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      console.warn("Cancel speaking error:", e);
    }
  }
};
