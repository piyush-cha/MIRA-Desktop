import React, { useEffect, useRef } from 'react';

interface VoiceWaveformProps {
  isSpeaking: boolean;
  isListening: boolean;
}

export const VoiceWaveform: React.FC<VoiceWaveformProps> = ({ isSpeaking, isListening }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      const active = isSpeaking || isListening;
      const color = isListening ? '#f43f5e' : isSpeaking ? '#06b6d4' : '#64748b';
      const lines = 4;

      for (let i = 0; i < lines; i++) {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = i === 0 ? 2 : 1;
        ctx.globalAlpha = 1 - i * 0.2;

        for (let x = 0; x < width; x++) {
          const freq = active ? 0.05 + i * 0.01 : 0.02;
          const amp = active ? (isSpeaking ? 18 : 12) : 3;
          const y = centerY + Math.sin(x * freq + phase + i) * Math.sin(x * 0.02) * amp;

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      phase += active ? 0.15 : 0.03;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isSpeaking, isListening]);

  return (
    <div className="relative w-full h-12 flex items-center justify-center bg-slate-950/80 rounded-lg border border-cyan-500/20 overflow-hidden px-4">
      <canvas ref={canvasRef} width={280} height={48} className="w-full h-full" />
      <div className="absolute right-3 top-2.5 flex items-center gap-1.5 text-[10px] font-mono tracking-wider">
        <span className={`w-2 h-2 rounded-full ${isListening ? 'bg-rose-500 animate-ping' : isSpeaking ? 'bg-cyan-400 animate-pulse' : 'bg-slate-500'}`} />
        <span className={isListening ? 'text-rose-400 font-bold' : isSpeaking ? 'text-cyan-400 font-bold' : 'text-slate-400'}>
          {isListening ? 'VOICE IN' : isSpeaking ? 'CNMC SPEAKS' : 'JARVIS STANDBY'}
        </span>
      </div>
    </div>
  );
};
