import { create } from 'zustand';

export interface MentionItem {
  id: string;
  type: 'cpse' | 'page' | 'component' | 'bot';
  label: string;
  code?: string;
  description: string;
  action?: () => void;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'mira';
  text: string;
  timestamp: string;
  mentions?: string[];
  categoryBadge?: 'Category A' | 'Category B' | 'Category C' | 'Governance';
}

interface VoiceState {
  isChatOpen: boolean;
  isVoiceActive: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  spokenText: string;
  chatMessages: ChatMessage[];
  currentInput: string;
  mentionQuery: string | null;
  mentionCursorIndex: number;
  selectedMention: MentionItem | null;

  // Actions
  toggleChat: () => void;
  openChat: () => void;
  closeChat: () => void;
  setCurrentInput: (text: string) => void;
  addMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  speakText: (text: string) => void;
  stopSpeaking: () => void;
  startListening: () => void;
  stopListening: () => void;
  setMentionQuery: (query: string | null, cursorIndex?: number) => void;
  clearMessages: () => void;
}

// Global SpeechSynthesis instance wrapper
const speakWithMiraVoice = (text: string, onEnd?: () => void) => {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel(); // Stop any ongoing speech

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.05; // Slightly authoritative, clear speed
  utterance.pitch = 1.0; // Professional MIRA tone
  utterance.volume = 1.0;

  // Find English India / natural female voice if available
  const voices = window.speechSynthesis.getVoices();
  const miraVoice = voices.find(v => 
    (v.lang.includes('en-IN') || v.lang.includes('en-GB') || v.lang.includes('en-US')) && 
    (v.name.includes('Female') || v.name.includes('Natural') || v.name.includes('Zira') || v.name.includes('Google'))
  ) || voices[0];

  if (miraVoice) {
    utterance.voice = miraVoice;
  }

  if (onEnd) {
    utterance.onend = onEnd;
  }

  window.speechSynthesis.speak(utterance);
};

export const useVoiceStore = create<VoiceState>((set, get) => ({
  isChatOpen: false,
  isVoiceActive: false,
  isListening: false,
  isSpeaking: false,
  spokenText: '',
  currentInput: '',
  mentionQuery: null,
  mentionCursorIndex: 0,
  selectedMention: null,
  chatMessages: [
    {
      id: 'msg-0',
      sender: 'mira',
      text: 'Greetings Commander. I am MIRA Jarvis Voice Agent. I am monitoring all 74 CPSEs, MIRA Category A-B-C materials, and National Governance matrices. You can speak to me or type "@" to access CPSEs, pages, components, or bots.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      categoryBadge: 'Governance'
    }
  ],

  toggleChat: () => set(state => ({ isChatOpen: !state.isChatOpen })),
  openChat: () => set({ isChatOpen: true }),
  closeChat: () => set({ isChatOpen: false }),

  setCurrentInput: (currentInput) => set({ currentInput }),

  addMessage: (msg) => {
    const newMessage: ChatMessage = {
      ...msg,
      id: `msg-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    set(state => ({
      chatMessages: [...state.chatMessages, newMessage]
    }));

    // Auto-speak response if from MIRA
    if (msg.sender === 'mira') {
      get().speakText(msg.text);
    }
  },

  speakText: (text: string) => {
    set({ isSpeaking: true, spokenText: text });
    speakWithMiraVoice(text, () => {
      set({ isSpeaking: false, spokenText: '' });
    });
  },

  stopSpeaking: () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    set({ isSpeaking: false, spokenText: '' });
  },

  startListening: () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in this browser. Please use Chrome/Edge or standard text input.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      set({ isListening: true });
    };

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('');
      set({ currentInput: transcript });
    };

    recognition.onerror = () => {
      set({ isListening: false });
    };

    recognition.onend = () => {
      set({ isListening: false });
    };

    recognition.start();
  },

  stopListening: () => {
    set({ isListening: false });
  },

  setMentionQuery: (mentionQuery, mentionCursorIndex = 0) => set({ mentionQuery, mentionCursorIndex }),

  clearMessages: () => set({
    chatMessages: [
      {
        id: 'msg-init',
        sender: 'mira',
        text: 'Session history reset. MIRA Jarvis is ready for instructions.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        categoryBadge: 'Governance'
      }
    ]
  })
}));
