'use client';

import { useEffect, useState } from 'react';

interface Props {
  title: string;
  subtitle?: string;
  isDark?: boolean;
}

export default function GameLoadingOverlay({ title, subtitle, isDark = false }: Props) {
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Start fading out after 1.2s
    const timer1 = setTimeout(() => {
      setIsFadingOut(true);
    }, 1200);
    
    // Completely unmount after 1.7s
    const timer2 = setTimeout(() => {
      setIsVisible(false);
    }, 1700);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed inset-0 w-full h-full z-[100] flex flex-col items-center justify-center transition-opacity duration-500 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      } ${
        isDark ? 'bg-[#1A2C38] text-white' : 'bg-[#F7F8FF] text-slate-900'
      }`}
    >
      <div className="relative flex flex-col items-center animate-in zoom-in-95 duration-500">
        <div className="w-20 h-20 relative mb-6">
          <div className={`absolute inset-0 rounded-2xl animate-ping opacity-30 ${isDark ? 'bg-emerald-500' : 'bg-indigo-600'}`} style={{ animationDuration: '1.5s' }}></div>
          <div className={`absolute inset-0 rounded-2xl flex items-center justify-center text-3xl shadow-2xl ${isDark ? 'bg-gradient-to-tr from-slate-700 to-slate-900 border-2 border-emerald-500/20' : 'bg-gradient-to-tr from-indigo-500 to-purple-600 text-white'}`}>
            <span className="font-display font-black leading-none tracking-tighter">{title.charAt(0)}</span>
          </div>
        </div>
        
        <h1 className="text-2xl font-black tracking-widest uppercase mb-2 animate-pulse">{title}</h1>
        {subtitle && (
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'} font-medium text-sm`}>
            {subtitle}
          </p>
        )}
        
        <div className="mt-12 flex gap-2">
          <div className={`w-2 h-2 rounded-full animate-bounce ${isDark ? 'bg-emerald-500' : 'bg-indigo-500'}`} style={{ animationDelay: '0ms' }}></div>
          <div className={`w-2 h-2 rounded-full animate-bounce ${isDark ? 'bg-emerald-400' : 'bg-purple-500'}`} style={{ animationDelay: '150ms' }}></div>
          <div className={`w-2 h-2 rounded-full animate-bounce ${isDark ? 'bg-emerald-300' : 'bg-pink-500'}`} style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}
