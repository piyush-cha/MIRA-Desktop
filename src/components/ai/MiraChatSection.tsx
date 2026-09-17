import React, { useState, useRef, useEffect } from 'react';
import { Bot, Mic, MicOff, Volume2, VolumeX, X, Send, Sparkles, RefreshCw, Zap } from 'lucide-react';
import { useVoiceStore, MentionItem } from '../../store/voiceStore';
import { MentionDropdown } from './MentionDropdown';


interface MiraChatSectionProps {
  onNavigate?: (page: string) => void;
}

export const MiraChatSection: React.FC<MiraChatSectionProps> = ({ onNavigate }) => {
  const {
    isChatOpen,
    closeChat,
    chatMessages,
    addMessage,
    currentInput,
    setCurrentInput,
    isSpeaking,
    isListening,
    speakText,
    stopSpeaking,
    startListening,
    stopListening,
    clearMessages,
  } = useVoiceStore();

  const [showMentions, setShowMentions] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  if (!isChatOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCurrentInput(val);

    const lastAt = val.lastIndexOf('@');
    if (lastAt !== -1 && lastAt >= val.length - 15 && !val.substring(lastAt).includes(' ')) {
      setShowMentions(true);
      setMentionFilter(val.substring(lastAt + 1));
    } else {
      setShowMentions(false);
    }
  };

  const handleSelectMention = (item: MentionItem) => {
    const lastAt = currentInput.lastIndexOf('@');
    const prefix = lastAt !== -1 ? currentInput.substring(0, lastAt) : currentInput;
    setCurrentInput(`${prefix}${item.label} `);
    setShowMentions(false);

    if (item.type === 'page' && onNavigate) {
      if (item.id === 'page-national') onNavigate('national');
      if (item.id === 'page-onboarding') onNavigate('onboarding');
      if (item.id === 'page-admin') onNavigate('admin');
      if (item.id === 'page-cnmc') onNavigate('cnmc');
    }
  };

  const handleSendMessage = () => {
    if (!currentInput.trim()) return;

    const userText = currentInput.trim();
    setCurrentInput('');
    setShowMentions(false);

    addMessage({
      sender: 'user',
      text: userText,
    });

    setTimeout(() => {
      let responseText = '';
      let categoryBadge: 'Category A' | 'Category B' | 'Category C' | 'Governance' = 'Governance';

      const lowerText = userText.toLowerCase();

      if (lowerText.includes('@coalindia') || lowerText.includes('coal india')) {
        responseText = 'Coal India Limited (Schedule A): Prime Coking Coal High-Grade (CNMC Category A) inventory is at 14,250 MT. Zero safety breaches reported.';
        categoryBadge = 'Category A';
      } else if (lowerText.includes('category a') || lowerText.includes('critical material')) {
        responseText = `CNMC Category A (Strategic Materials): 0 critical items monitored. Warning active for Rare Earth Concentrates at IREL (India) Limited.`;
        categoryBadge = 'Category A';
      } else if (lowerText.includes('@onboard') || lowerText.includes('onboarding') || lowerText.includes('provision')) {
        responseText = 'Navigating to CPSE Onboarding Module. National Governance can register new CPSEs, provision MIRA Enterprise licenses, and dispatch one-time credentials directly.';
      } else if (lowerText.includes('voice') || lowerText.includes('speak')) {
        responseText = 'MIRA Voice Engine is online and synchronized with Web Speech API. You can direct me hands-free.';
      } else {
        responseText = `Acknowledged instruction: "${userText}". I have synchronized with the National Sovereign Database and CNMC material registers.`;
      }

      addMessage({
        sender: 'mira',
        text: responseText,
        categoryBadge,
      });

      if (soundEnabled && !isSpeaking) {
        speakText(responseText);
      }
    }, 500);
  };

  return (
    <div className="jarvis-drawer">
      {/* Header */}
      <div className="jarvis-drawer-header">
        <div className="jarvis-drawer-title">
          <Bot size={20} color="var(--accent-gold)" />
          <span>MIRA Jarvis Voice</span>
          <span className="badge badge-amber" style={{ fontSize: '10px' }}>VOICE AGENT</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            className="icon-btn"
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Mute Voice' : 'Unmute Voice'}
          >
            {soundEnabled ? <Volume2 size={16} color="var(--accent-blue)" /> : <VolumeX size={16} color="var(--text-muted)" />}
          </button>
          <button className="icon-btn" onClick={clearMessages} title="Reset Chat">
            <RefreshCw size={14} />
          </button>
          <button className="icon-btn" onClick={closeChat} title="Close Drawer">
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Voice Status Pill */}
      <div style={{ padding: '8px 20px', background: 'var(--bg-card)', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div className="dot" style={{ background: isListening ? 'var(--accent-red)' : isSpeaking ? 'var(--accent-blue)' : 'var(--accent-green)' }} />
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
            {isListening ? 'Listening via Microphone...' : isSpeaking ? 'Speaking Response...' : 'MIRA Voice Core Ready'}
          </span>
        </div>
        <span style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>Web Speech API</span>
      </div>

      {/* Quick Mention Shortcuts */}
      <div style={{ padding: '8px 16px', background: 'var(--bg-card-alt)', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto' }}>
        <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, flexShrink: 0 }}>Quick @:</span>
        <button
          className="badge badge-gray"
          style={{ cursor: 'pointer' }}
          onClick={() => { setCurrentInput('@CoalIndia Status '); setShowMentions(false); }}
        >
          @CoalIndia
        </button>
        <button
          className="badge badge-red"
          style={{ cursor: 'pointer' }}
          onClick={() => { setCurrentInput('Category A Critical Materials '); setShowMentions(false); }}
        >
          Category A
        </button>
        <button
          className="badge badge-amber"
          style={{ cursor: 'pointer' }}
          onClick={() => { setCurrentInput('@CpseOnboarding '); setShowMentions(false); }}
        >
          @Onboarding
        </button>
      </div>

      {/* Messages */}
      <div className="jarvis-drawer-messages">
        {chatMessages.map(msg => (
          <div
            key={msg.id}
            className={`msg-bubble ${msg.sender === 'user' ? 'user' : 'mira'}`}
          >
            {msg.sender === 'mira' && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--accent-dark)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Sparkles size={12} color="var(--accent-gold)" /> MIRA Voice
                </span>
                {msg.categoryBadge && (
                  <span className={`badge ${msg.categoryBadge === 'Category A' ? 'badge-red' : msg.categoryBadge === 'Category B' ? 'badge-amber' : 'badge-green'}`} style={{ fontSize: '9px' }}>
                    {msg.categoryBadge}
                  </span>
                )}
              </div>
            )}
            <div>{msg.text}</div>
            <div style={{ fontSize: '9.5px', opacity: 0.6, marginTop: '4px', textAlign: 'right' }}>
              {msg.timestamp}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Footer Input */}
      <div className="jarvis-drawer-footer">
        {showMentions && (
          <MentionDropdown
            query={mentionFilter}
            onSelect={handleSelectMention}
            onClose={() => setShowMentions(false)}
          />
        )}

        <div className="jarvis-input-row">
          <button
            className="icon-btn"
            onClick={() => {
              if (isListening) stopListening();
              else startListening();
            }}
            style={{
              background: isListening ? 'var(--accent-red)' : 'var(--bg-card-alt)',
              color: isListening ? 'white' : 'var(--text-secondary)',
              borderColor: isListening ? 'var(--accent-red)' : 'var(--border-light)'
            }}
            title={isListening ? 'Stop Listening' : 'Speak via Microphone'}
          >
            {isListening ? <MicOff size={15} /> : <Mic size={15} />}
          </button>

          <input
            type="text"
            className="jarvis-text-input"
            value={currentInput}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            placeholder="Ask MIRA or type @ for CPSEs..."
          />

          <button
            className="btn-primary"
            onClick={handleSendMessage}
            disabled={!currentInput.trim()}
            style={{ padding: '8px 12px' }}
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
