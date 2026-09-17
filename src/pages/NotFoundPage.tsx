import React from 'react';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

interface NotFoundPageProps {
  onNavigate: (page: string) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen w-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="text-center space-y-4 max-w-md">
        <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto animate-bounce" />
        <h2 className="text-xl font-bold text-slate-100 font-mono">404 — Sovereign Route Not Found</h2>
        <p className="text-xs text-slate-400 font-mono">
          The requested path does not exist or requires higher clearance.
        </p>
        <button
          onClick={() => onNavigate('national')}
          className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs font-mono inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Sovereign Portal
        </button>
      </div>
    </div>
  );
};
