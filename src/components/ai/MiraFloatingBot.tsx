import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Send, Mic, MicOff, Paperclip, X, Minimize2, Maximize2,
  Command, AtSign, Cpu, MessageCircle
} from 'lucide-react';
import { api, getApiErrorMessage } from '../../api/client';
import { useAuthStore } from '../../store/authStore';

interface Message {
  id: string;
  sender: 'user' | 'mira' | 'system';
  text: string;
  timestamp: string;
  toolsExecuted?: any[];
  suggestedActions?: { label: string; command: string }[];
  fileAttachment?: { name: string; size: string };
}

type AvatarMood = 'idle' | 'waving' | 'talking' | 'thinking' | 'happy';

const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
];

const MENTION_SUGGESTIONS = [
  { type: 'CPSE', label: '@ONGC', desc: 'Oil & Natural Gas Corp' },
  { type: 'CPSE', label: '@IOCL', desc: 'Indian Oil Corp Ltd' },
  { type: 'CPSE', label: '@SAIL', desc: 'Steel Authority of India' },
  { type: 'CPSE', label: '@NTPC', desc: 'National Thermal Power Corp' },
  { type: 'CPSE', label: '@BHEL', desc: 'Bharat Heavy Electricals' },
  { type: 'CPSE', label: '@COALINDIA', desc: 'Coal India Limited' },
  { type: 'MATERIAL', label: '@CNMC-MEC-VLV-002150', desc: 'Ball Valve 2 Inch Cl.150' },
  { type: 'MATERIAL', label: '@CNMC-MEC-BRG-22220E', desc: 'Spherical Roller Bearing 22220' },
  { type: 'SAP', label: '@SAP_PO_4500091823', desc: 'Active Purchase Order' },
];

const SLASH_COMMANDS = [
  { command: '/pr_create', desc: 'Create SAP Purchase Requisition with benchmark validation', example: '/pr_create 25 ball valves for ONGC' },
  { command: '/stock_lookup', desc: 'Query real-time inventory stock across CPSE plants', example: '/stock_lookup Bearing 22220' },
  { command: '/price_benchmark', desc: 'Compare procurement rates across all 6 CPSEs', example: '/price_benchmark Ball Valve 2 Inch' },
  { command: '/po_status', desc: 'Check status and delivery timeline for SAP Purchase Order', example: '/po_status PO-4500091823' },
  { command: '/harmonize', desc: 'Trigger AI standardization for legacy item code', example: '/harmonize VLV-BL-2-150-FLG' },
  { command: '/sap_sync', desc: 'Force sync delta material masters with SAP S/4HANA', example: '/sap_sync ONGC' },
];

const GREETINGS: Record<string, string> = {
  en: "Hi! I'm MIRA, your AI assistant. How can I help you today?",
  hi: "नमस्ते! मैं MIRA हूँ, आपकी AI सहायक। मैं आपकी कैसे मदद कर सकती हूँ?",
  bn: "হ্যালো! আমি MIRA, আপনার AI সহায়ক। আমি আপনাকে কিভাবে সাহায্য করতে পারি?",
  ta: "வணக்கம்! நான் MIRA, உங்கள் AI உதவியாளர்.",
  te: "హలో! నేను MIRA, మీ AI సహాయకురాలిని.",
  mr: "नमस्कार! मी MIRA आहे, तुमची AI सहाय्यक.",
  gu: "નમસ્તે! હું MIRA છું, તમારી AI સહાયક.",
};

/* ───────────────────────────────────────────────────────────────────
   3D Avatar Component — CSS-animated character with mood states
   ─────────────────────────────────────────────────────────────────── */
const Mira3DAvatar: React.FC<{ mood: AvatarMood; size?: number; onClick?: () => void }> = ({ mood, size = 120, onClick }) => {
  const scale = size / 120;
  return (
    <div 
      className={`mira-3d-character mood-${mood}`}
      style={{ transform: `scale(${scale})`, transformOrigin: 'bottom center' }}
      onClick={onClick}
    >
      {/* Glow platform under the character */}
      <div className="mira-char-platform"></div>

      {/* Body */}
      <div className="mira-char-body">
        {/* Head */}
        <div className="mira-char-head">
          {/* Hair back */}
          <div className="mira-char-hair-back"></div>
          {/* Face */}
          <div className="mira-char-face">
            {/* Glasses */}
            <div className="mira-char-glasses">
              <div className="mira-char-lens left">
                <div className="mira-char-eye left">
                  <div className="mira-char-pupil"></div>
                  <div className="mira-char-eye-shine"></div>
                </div>
              </div>
              <div className="mira-char-bridge"></div>
              <div className="mira-char-lens right">
                <div className="mira-char-eye right">
                  <div className="mira-char-pupil"></div>
                  <div className="mira-char-eye-shine"></div>
                </div>
              </div>
            </div>
            {/* Nose */}
            <div className="mira-char-nose"></div>
            {/* Mouth */}
            <div className={`mira-char-mouth ${mood}`}></div>
            {/* Blush */}
            <div className="mira-char-blush left"></div>
            <div className="mira-char-blush right"></div>
          </div>
          {/* Hair front */}
          <div className="mira-char-hair-front"></div>
          {/* Hair side left */}
          <div className="mira-char-hair-side left"></div>
          {/* Hair side right */}
          <div className="mira-char-hair-side right"></div>
        </div>

        {/* Torso */}
        <div className="mira-char-torso">
          {/* Blazer */}
          <div className="mira-char-blazer">
            <div className="mira-char-collar left"></div>
            <div className="mira-char-collar right"></div>
            <div className="mira-char-shirt"></div>
          </div>
        </div>

        {/* Arms */}
        <div className={`mira-char-arm left ${mood}`}>
          <div className="mira-char-hand">
            {mood === 'waving' && (
              <>
                <div className="mira-char-finger f1"></div>
                <div className="mira-char-finger f2"></div>
                <div className="mira-char-finger f3"></div>
                <div className="mira-char-finger f4"></div>
              </>
            )}
          </div>
        </div>
        <div className="mira-char-arm right">
          <div className="mira-char-hand">
            {/* Laptop */}
            <div className="mira-char-laptop">
              <div className="mira-char-laptop-screen"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Sparkle particles */}
      <div className="mira-char-sparkle s1">✦</div>
      <div className="mira-char-sparkle s2">✧</div>
      <div className="mira-char-sparkle s3">✦</div>
    </div>
  );
};

/* ───────────────────────────────────────────────────────────────────
   Speech Bubble Component — floating auto-text from MIRA
   ─────────────────────────────────────────────────────────────────── */
const MiraSpeechBubble: React.FC<{ text: string; visible: boolean }> = ({ text, visible }) => {
  if (!visible || !text) return null;
  return (
    <div className="mira-speech-bubble">
      <div className="mira-speech-text">{text}</div>
      <div className="mira-speech-tail"></div>
    </div>
  );
};

/* ───────────────────────────────────────────────────────────────────
   Main Floating Bot Export
   ─────────────────────────────────────────────────────────────────── */
export const MiraFloatingBot: React.FC = () => {
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [currentLang, setCurrentLang] = useState<string>('en');
  const [activeCpse, setActiveCpse] = useState<string>('ONGC');
  const [inputText, setInputText] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [attachedFile, setAttachedFile] = useState<{ name: string; size: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [mentionMenuOpen, setMentionMenuOpen] = useState<boolean>(false);
  const [slashMenuOpen, setSlashMenuOpen] = useState<boolean>(false);
  const [avatarMood, setAvatarMood] = useState<AvatarMood>('idle');
  const [speechText, setSpeechText] = useState<string>('');
  const [showSpeech, setShowSpeech] = useState<boolean>(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const speechTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-msg',
      sender: 'mira',
      text: "Namaste! I am **MIRA Sovereign AI Copilot** — directly connected to **SAP S/4HANA Material Management** across all 6 CPSEs.\n\nType `/` for SAP actions (like `/pr_create`, `/stock_lookup`) or `@` to mention CPSEs and materials.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedActions: [
        { label: '📝 Create SAP PR (25 Valves)', command: '/pr_create 25 Ball Valves for ONGC Hazira' },
        { label: '📦 Check National Stock', command: '/stock_lookup Bearing 22220' },
        { label: '📊 Cross-CPSE Price Benchmark', command: '/price_benchmark Ball Valve 2 Inch' },
      ]
    }
  ]);

  // Auto-cycle idle speech bubbles when closed
  useEffect(() => {
    if (isOpen) return; 

    const idlePhrases = [
      GREETINGS[currentLang] || GREETINGS.en,
      "Need help with SAP Material Management? 🛠",
      "I can check stock levels across all CPSEs! 📦",
      "Try me — I speak 7 languages! 🌐",
      "Click me to create a PR or check PO status! ✨",
    ];

    let idx = 0;
    // Show initial wave
    setAvatarMood('waving');
    setSpeechText(idlePhrases[0]);
    setShowSpeech(true);

    const interval = setInterval(() => {
      idx = (idx + 1) % idlePhrases.length;
      setAvatarMood(idx % 2 === 0 ? 'waving' : 'idle');
      setSpeechText(idlePhrases[idx]);
      setShowSpeech(true);

      // Hide speech bubble after 4s
      if (speechTimerRef.current) clearTimeout(speechTimerRef.current);
      speechTimerRef.current = setTimeout(() => setShowSpeech(false), 4000);
    }, 8000);

    const hideInitial = setTimeout(() => setShowSpeech(false), 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(hideInitial);
      if (speechTimerRef.current) clearTimeout(speechTimerRef.current);
    };
  }, [isOpen, currentLang]);

  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Handle Input Changes for @ and /
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputText(val);

    if (val.endsWith('@')) {
      setMentionMenuOpen(true);
      setSlashMenuOpen(false);
    } else if (val === '/' || val.endsWith(' /')) {
      setSlashMenuOpen(true);
      setMentionMenuOpen(false);
    } else {
      if (!val.includes('@')) setMentionMenuOpen(false);
      if (!val.startsWith('/')) setSlashMenuOpen(false);
    }
  };

  const handleSelectMention = (mention: string) => {
    setInputText((prev) => {
      const atIndex = prev.lastIndexOf('@');
      if (atIndex !== -1) {
        return prev.substring(0, atIndex) + mention + ' ';
      }
      return prev + mention + ' ';
    });
    setMentionMenuOpen(false);
  };

  const handleSelectCommand = (cmd: string) => {
    setInputText(cmd + ' ');
    setSlashMenuOpen(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile({
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`
      });
    }
  };

  const toggleSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser/environment.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = currentLang === 'hi' ? 'hi-IN' : 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText((prev) => prev ? `${prev} ${transcript}` : transcript);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
    } catch (err) {
      setIsListening(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() && !attachedFile) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      fileAttachment: attachedFile || undefined
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    const file = attachedFile;
    setAttachedFile(null);
    setMentionMenuOpen(false);
    setSlashMenuOpen(false);
    setLoading(true);
    setAvatarMood('thinking');

    try {
      const response = await api.miraCopilotChat({
        message: text,
        language: currentLang,
        active_cpse: activeCpse,
        file_attachment: file
      });

      setAvatarMood('talking');
      const botMessage: Message = {
        id: `mira-${Date.now()}`,
        sender: 'mira',
        text: response.message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        toolsExecuted: response.tools_executed,
        suggestedActions: response.suggested_actions
      };

      setMessages((prev) => [...prev, botMessage]);

      // Return to idle after "talking"
      setTimeout(() => setAvatarMood('happy'), 1500);
      setTimeout(() => setAvatarMood('idle'), 3500);
    } catch (err) {
      setAvatarMood('idle');
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        sender: 'system',
        text: `⚠️ Error connecting to SAP MCP Copilot: ${getApiErrorMessage(err)}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const openChat = useCallback(() => {
    setIsOpen(true);
    setShowSpeech(false);
    setAvatarMood('happy');
    setTimeout(() => setAvatarMood('idle'), 2000);
  }, []);

  return (
    <>
      {/* ─────── Floating 3D Character (when chat is closed) ─────── */}
      {!isOpen && (
        <div className="mira-floating-character-wrapper">
          <MiraSpeechBubble text={speechText} visible={showSpeech} />
          <Mira3DAvatar mood={avatarMood} size={110} onClick={openChat} />
          <div className="mira-char-name-badge" onClick={openChat}>
            <span className="mira-char-pulse"></span>
            MIRA Copilot
          </div>
        </div>
      )}

      {/* ─────── Chat Window ─────── */}
      {isOpen && (
        <div className={`mira-chat-window ${isMinimized ? 'minimized' : ''}`}>
          {/* Header with small avatar */}
          <div className="mira-chat-header">
            <div className="mira-header-left">
              <div className="mira-header-avatar-wrap">
                <Mira3DAvatar mood={loading ? 'thinking' : avatarMood} size={36} />
              </div>
              <div>
                <div className="mira-header-title">
                  MIRA Copilot <span className="mira-mcp-badge">SAP MM MCP</span>
                </div>
                <div className="mira-header-subtitle">
                  Sovereign Multilingual Material Intelligence
                </div>
              </div>
            </div>

            <div className="mira-header-actions">
              {/* Language Selector */}
              <select 
                className="mira-lang-select"
                value={currentLang}
                onChange={(e) => setCurrentLang(e.target.value)}
                title="Select Interaction Language"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.native} ({l.name})
                  </option>
                ))}
              </select>

              {/* CPSE Context Selector */}
              <select
                className="mira-cpse-select"
                value={activeCpse}
                onChange={(e) => setActiveCpse(e.target.value)}
                title="Target CPSE Context"
              >
                <option value="ONGC">ONGC</option>
                <option value="IOCL">IOCL</option>
                <option value="SAIL">SAIL</option>
                <option value="NTPC">NTPC</option>
                <option value="BHEL">BHEL</option>
                <option value="COALINDIA">CIL</option>
              </select>

              <button 
                className="mira-icon-btn" 
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? "Expand" : "Minimize"}
              >
                {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
              </button>
              <button 
                className="mira-icon-btn close" 
                onClick={() => { setIsOpen(false); setAvatarMood('waving'); }}
                title="Close"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages Body */}
              <div className="mira-chat-body">
                {messages.map((msg) => (
                  <div key={msg.id} className={`mira-message-row ${msg.sender}`}>
                    {msg.sender === 'mira' && (
                      <div className="mira-bot-icon-small">
                        <MessageCircle size={13} />
                      </div>
                    )}
                    
                    <div className="mira-message-bubble">
                      {/* Attached File Preview */}
                      {msg.fileAttachment && (
                        <div className="mira-attached-pill">
                          <Paperclip size={12} />
                          <span>{msg.fileAttachment.name}</span>
                          <span style={{ opacity: 0.6 }}>({msg.fileAttachment.size})</span>
                        </div>
                      )}

                      {/* Message Text with Markdown formatting support */}
                      <div className="mira-text-content" style={{ whiteSpace: 'pre-wrap' }}>
                        {msg.text}
                      </div>

                      {/* Render Executed SAP MCP Tool Calls */}
                      {msg.toolsExecuted && msg.toolsExecuted.length > 0 && (
                        <div className="mira-tools-card">
                          <div className="mira-tool-header">
                            <Cpu size={12} color="#10b981" />
                            <span>Executed SAP MM MCP Function</span>
                          </div>
                          {msg.toolsExecuted.map((t: any, idx: number) => (
                            <div key={idx} className="mira-tool-item">
                              <code>{t.tool}</code>
                              <span className="tool-status-tag">STATUS: {t.status}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Suggested Action Chips */}
                      {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                        <div className="mira-action-chips">
                          {msg.suggestedActions.map((act, idx) => (
                            <button
                              key={idx}
                              className="mira-chip"
                              onClick={() => handleSendMessage(act.command)}
                            >
                              {act.label}
                            </button>
                          ))}
                        </div>
                      )}

                      <div className="mira-timestamp">{msg.timestamp}</div>
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="mira-message-row mira">
                    <div className="mira-bot-icon-small">
                      <MessageCircle size={13} />
                    </div>
                    <div className="mira-message-bubble loading">
                      <div className="mira-typing-indicator">
                        <span></span><span></span><span></span>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        Executing SAP S/4HANA MM query...
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Slash Command Autocomplete Popover */}
              {slashMenuOpen && (
                <div className="mira-autocomplete-popover">
                  <div className="mira-popover-title">
                    <Command size={12} /> SAP MM Actions
                  </div>
                  {SLASH_COMMANDS.map((sc) => (
                    <div
                      key={sc.command}
                      className="mira-popover-item"
                      onClick={() => handleSelectCommand(sc.command)}
                    >
                      <span className="popover-command">{sc.command}</span>
                      <span className="popover-desc">{sc.desc}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* @ Mention Autocomplete Popover */}
              {mentionMenuOpen && (
                <div className="mira-autocomplete-popover">
                  <div className="mira-popover-title">
                    <AtSign size={12} /> Mention Entities & Materials
                  </div>
                  {MENTION_SUGGESTIONS.map((m) => (
                    <div
                      key={m.label}
                      className="mira-popover-item"
                      onClick={() => handleSelectMention(m.label)}
                    >
                      <span className="popover-tag">{m.type}</span>
                      <span className="popover-command">{m.label}</span>
                      <span className="popover-desc">{m.desc}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Attached file chip in input area */}
              {attachedFile && (
                <div className="mira-input-attachment">
                  <Paperclip size={12} />
                  <span>{attachedFile.name}</span>
                  <button onClick={() => setAttachedFile(null)}><X size={12} /></button>
                </div>
              )}

              {/* Input Footer */}
              <div className="mira-chat-footer">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  style={{ display: 'none' }} 
                  onChange={handleFileUpload}
                  accept=".csv,.pdf,.xlsx,.json,.txt"
                />

                <button 
                  className="mira-input-btn"
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload Specs, PO or CSV (+)"
                >
                  <Paperclip size={15} />
                </button>

                <button 
                  className={`mira-input-btn ${isListening ? 'listening' : ''}`}
                  onClick={toggleSpeechRecognition}
                  title={isListening ? "Listening... click to stop" : "Voice Input (Mic)"}
                >
                  {isListening ? <MicOff size={15} color="#ef4444" /> : <Mic size={15} />}
                </button>

                <input
                  type="text"
                  className="mira-text-input"
                  placeholder={
                    currentLang === 'hi' 
                      ? "MIRA से पूछें... (उदा. /pr_create 50 वाल्व या @ONGC)" 
                      : "Ask MIRA Copilot... (type '/' for SAP actions, '@' to mention)"
                  }
                  value={inputText}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />

                <button 
                  className="mira-send-btn"
                  onClick={() => handleSendMessage()}
                  disabled={!inputText.trim() && !attachedFile}
                  title="Send message"
                >
                  <Send size={15} />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};
