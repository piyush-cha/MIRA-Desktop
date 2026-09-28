import React from 'react';
import { Bot, Mic, Volume2 } from 'lucide-react';
import { useVoiceStore } from '../../store/voiceStore';

export const MiraJarvisBot: React.FC = () => {
  const { toggleChat, isChatOpen, isSpeaking, isListening } = useVoiceStore();

  return (
    <button
      onClick={toggleChat}
      className={`jarvis-float-btn ${isListening ? 'listening' : isSpeaking ? 'speaking' : ''}`}
      title="Open CNMC Jarvis Voice & System Chat (or press @)"
    >
      {isListening ? (
        <Mic size={18} />
      ) : isSpeaking ? (
        <Volume2 size={18} />
      ) : (
        <Bot size={18} color="var(--accent-gold)" />
      )}
      <span>{isListening ? 'Listening' : isSpeaking ? 'Speaking' : 'CNMC Jarvis (@)'}</span>
    </button>
  );
};
