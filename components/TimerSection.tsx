'use client';

import { useState, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';
import { GameInterval } from '@/types/game';

export default function TimerSection({ interval, currentPeriod, onTimeUp, initialTimeLeft, isActive = true }: { interval: GameInterval, currentPeriod: string, onTimeUp: () => void, initialTimeLeft?: number, isActive?: boolean }) {
  const [timeLeft, setTimeLeft] = useState<number>(initialTimeLeft !== undefined ? initialTimeLeft : interval * 60);
  const [prevInitial, setPrevInitial] = useState(initialTimeLeft);

  if (initialTimeLeft !== prevInitial) {
    setPrevInitial(initialTimeLeft);
    if (initialTimeLeft !== undefined) {
      setTimeLeft(initialTimeLeft);
    }
  }

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          onTimeUp();
          return interval * 60; // Reset temporarily until server syncs
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, interval, onTimeUp]);

  useEffect(() => {
    if (!isActive) return;
    // Play intense sound effects during the last 3 seconds
    if (timeLeft > 0 && timeLeft <= 3) {
      if (typeof window !== 'undefined') {
        try {
          const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
          const ctx = new AudioContext();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          // Pitch increases as we get closer to 0
          osc.frequency.setValueAtTime(800 + (3 - timeLeft) * 200, ctx.currentTime);
          gain.gain.setValueAtTime(0.2, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.15);
        } catch (err) {
          console.error("Audio error encountered");
        }
      }
    } else if (timeLeft === 0) {
      // Play a buzzer-like sound at 0
      if (typeof window !== 'undefined') {
        try {
          const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
          const ctx = new AudioContext();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(300, ctx.currentTime);
          gain.gain.setValueAtTime(0.3, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.5);
        } catch (err) {
          console.error("Audio error encountered");
        }
      }
    }
  }, [timeLeft, isActive]);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  return (
    <div className="bg-white p-4 mx-3 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between mb-4 relative overflow-hidden">
      {/* Decorative line */}
      <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>

      <div>
        <div className="flex items-center gap-1.5 text-gray-500 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider">Period</span>
          <button className="text-gray-400 hover:text-indigo-500 transition-colors">
            <HelpCircle size={14} />
          </button>
        </div>
        <div className="font-mono text-xl font-bold tracking-tight text-gray-800">
          {currentPeriod || 'Waiting...'}
        </div>
      </div>
      
      <div className="text-right">
        <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Time remaining</div>
        <div className="flex gap-1.5 justify-end mt-0.5">
          <TimeBox value={Math.floor(mins / 10)} />
          <TimeBox value={mins % 10} />
          <div className="font-mono text-xl font-bold text-gray-800 self-center -mx-0.5">:</div>
          <TimeBox value={Math.floor(secs / 10)} isWarning={timeLeft <= 5} />
          <TimeBox value={secs % 10} isWarning={timeLeft <= 5} />
        </div>
      </div>
    </div>
  );
}

function TimeBox({ value, isWarning = false }: { value: number, isWarning?: boolean }) {
  return (
    <div className={`w-8 h-10 rounded-lg flex items-center justify-center font-mono text-xl font-bold font-display shadow-inner ${isWarning ? 'bg-red-50 text-red-600 border border-red-200 animate-pulse' : 'bg-gray-100 text-gray-800 border border-gray-200'}`}>
      {value}
    </div>
  );
}

