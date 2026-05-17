'use client';

import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { X, CheckCircle2 } from 'lucide-react';
import { GameInterval, GameColor, GameSize } from '@/types/game';

interface WinData {
  amount: number;
  periodId: string;
  interval: GameInterval;
  resultColor: GameColor[];
  resultNumber: number;
  resultSize: GameSize;
}

// Global function to trigger the popup
export let showWinPopup: (data: WinData) => void;

export default function WinPopupManager() {
  const [winData, setWinData] = useState<WinData | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [isAutoClose, setIsAutoClose] = useState(true);

  useEffect(() => {
    showWinPopup = (data: WinData) => {
      setWinData(data);
      setCountdown(3);
      setIsAutoClose(true);

      // Trigger confetti
      const end = Date.now() + 3 * 1000;
      const colors = ['#fde047', '#f43f5e', '#a855f7', '#3b82f6', '#22c55e'];

      (function frame() {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors,
          zIndex: 9999
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors,
          zIndex: 9999
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      }());
    };
  }, []);

  useEffect(() => {
    if (winData && countdown > 0 && isAutoClose) {
      const timer = setTimeout(() => {
        if (countdown - 1 === 0) {
          setWinData(null);
        } else {
          setCountdown(countdown - 1);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [winData, countdown, isAutoClose]);

  if (!winData) return null;

  const resultColorName = winData.resultColor.length > 1 ? 'Violet' : winData.resultColor[0].charAt(0).toUpperCase() + winData.resultColor[0].slice(1);
  // Colors for tags
  const getTagColorClass = (color: string) => {
    if (color === 'red') return 'bg-red-500';
    if (color === 'green') return 'bg-green-500';
    return 'bg-purple-500';
  };
  
  const mainColorClass = getTagColorClass(winData.resultColor[0]);

  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center bg-black/60 backdrop-blur-sm px-6">
      <div className="w-full max-w-sm flex flex-col items-center">
        {/* Main Card */}
        <div className="w-full bg-gradient-to-b from-[#ff8b5a] to-[#fd4f46] rounded-3xl relative pt-16 pb-6 px-6 shadow-2xl flex flex-col items-center animate-in zoom-in-95 duration-300">
          
          {/* Top Badge (Rocket) */}
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-32 flex justify-center drop-shadow-lg">
            {/* Using a relative container for SVG/image composition of the badge */}
            <div className="relative w-full h-full flex items-center justify-center">
               <svg viewBox="0 0 200 100" className="absolute w-full h-full top-2">
                 <path d="M20 50 Q100 20 180 50 Q100 80 20 50" fill="#facc15" className="opacity-50" />
                 {/* Ribbon background */}
                 <path d="M10 40 L190 40 L180 70 L20 70 Z" fill="#d97706" />
                 <path d="M15 35 L185 35 Q195 55 185 75 L15 75 Q5 55 15 35 Z" fill="#f59e0b" />
               </svg>
               <div className="relative z-10 w-24 h-24 bg-gradient-to-br from-yellow-100 via-yellow-400 to-yellow-600 rounded-full border-[4px] border-white shadow-xl flex items-center justify-center">
                 {/* Simulated Rocket Icon */}
                 <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white fill-white rotate-45">
                    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
                    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
                    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
                    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
                 </svg>
               </div>
               
               {/* Wings (abstract shapes) */}
               <div className="absolute left-6 top-6 w-12 h-16 bg-white/90 rounded-l-full rotate-[-20deg] blur-[1px]"></div>
               <div className="absolute right-6 top-6 w-12 h-16 bg-white/90 rounded-r-full rotate-[20deg] blur-[1px]"></div>
            </div>
          </div>

          <h2 className="text-white font-bold text-3xl mb-4 font-display text-center drop-shadow-md">
            Congratulations
          </h2>

          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            <span className="text-white/90 text-sm font-medium mr-1">Lottery results</span>
            <div className={`px-2 py-0.5 rounded-md text-white text-xs font-bold ${mainColorClass} shadow-sm`}>
              {resultColorName}
            </div>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold bg-white ${getTagColorClass(winData.resultColor[0]).replace('bg-', 'text-')} shadow-inner`}>
              {winData.resultNumber}
            </div>
            <div className={`px-2 py-0.5 rounded-md text-white text-xs font-bold ${mainColorClass} shadow-sm`}>
              {winData.resultSize.charAt(0).toUpperCase() + winData.resultSize.slice(1)}
            </div>
          </div>

          {/* Receipt Slot & Paper */}
          <div className="w-full relative flex flex-col items-center mb-6">
             {/* Slot Shadow / Hole */}
             <div className="w-5/6 h-4 bg-black/30 rounded-full blur-[2px] absolute top-0 z-20"></div>
             <div className="w-5/6 h-3 bg-[#c73528] rounded-full absolute top-1 z-20 border border-black/10"></div>
             
             {/* Receipt Paper */}
             <div className="w-[88%] bg-white rounded-b-xl shadow-lg relative z-10 -mt-1 pt-6 pb-5 flex flex-col items-center animate-in slide-in-from-top-12 duration-500" style={{
               clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 5px) 100%, calc(100% - 15px) calc(100% - 10px), calc(100% - 25px) 100%, calc(100% - 35px) calc(100% - 10px), calc(100% - 45px) 100%, calc(100% - 55px) calc(100% - 10px), calc(100% - 65px) 100%, calc(100% - 75px) calc(100% - 10px), calc(100% - 85px) 100%, calc(100% - 95px) calc(100% - 10px), calc(100% - 105px) 100%, calc(100% - 115px) calc(100% - 10px), calc(100% - 125px) 100%, calc(100% - 135px) calc(100% - 10px), calc(100% - 145px) 100%, calc(100% - 155px) calc(100% - 10px), calc(100% - 165px) 100%, calc(100% - 175px) calc(100% - 10px), calc(100% - 185px) 100%, calc(100% - 195px) calc(100% - 10px), calc(100% - 205px) 100%, calc(100% - 215px) calc(100% - 10px), calc(100% - 225px) 100%, calc(100% - 235px) calc(100% - 10px), calc(100% - 245px) 100%, calc(100% - 255px) calc(100% - 10px), calc(100% - 265px) 100%, calc(100% - 275px) calc(100% - 10px), calc(100% - 285px) 100%, calc(100% - 295px) calc(100% - 10px), 0 100%)'
             }}>
                <p className="text-[#fd4f46] text-sm font-semibold mb-1">Bonus</p>
                <h3 className="text-[#fd4f46] text-[2rem] font-bold font-display leading-none mb-3">
                  ₹{winData.amount.toFixed(2)}
                </h3>
                <p className="text-gray-400 text-xs text-center px-4 leading-tight">
                  Period: WinGo {winData.interval === 0.5 ? '30s' : winData.interval + ' Min'}<br />
                  {winData.periodId}
                </p>
             </div>
          </div>

          <div className="flex items-center gap-2 mt-4 bg-black/10 px-3 py-1.5 rounded-full cursor-pointer hover:bg-black/20 transition-colors" onClick={() => setIsAutoClose(!isAutoClose)}>
            <input 
              type="checkbox" 
              checked={isAutoClose} 
              onChange={(e) => setIsAutoClose(e.target.checked)}
              className="w-3.5 h-3.5 rounded-sm accent-[#fd4f46] cursor-pointer"
            />
            <span className="text-white/90 text-xs">
              {isAutoClose ? `Auto close in ${countdown}s` : 'Auto close disabled'}
            </span>
          </div>

        </div>

        {/* Close Button */}
        <button 
          onClick={() => setWinData(null)}
          className="mt-8 w-12 h-12 rounded-full border-2 border-white/80 flex items-center justify-center text-white/80 hover:bg-white/10 hover:text-white hover:border-white transition-all active:scale-95 z-50"
        >
          <X size={24} />
        </button>
      </div>
    </div>
  );
}
