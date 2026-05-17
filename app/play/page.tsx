'use client';

import { useState } from 'react';
import { Speaker } from 'lucide-react';
import { cn } from '@/lib/utils';
import GameHeader from '@/components/GameHeader';
import GameEngineView from '@/components/GameEngineView';
import { GameInterval } from '@/types/game';

export default function Home() {
  const [intervalOption, setIntervalOption] = useState<GameInterval>(1);

  return (
    <main className="flex flex-col min-h-screen bg-[#F7F8FF]">
      <GameHeader />
      
      <div className="flex-1 overflow-y-auto pb-24">
        {/* Marquee Announcment */}
        <div className="flex items-center bg-white px-3 py-2 text-sm text-gray-500 shadow-sm border-b border-gray-100">
          <Speaker className="w-4 h-4 text-orange-500 mr-2 flex-shrink-0" />
          <div className="overflow-hidden whitespace-nowrap overflow-ellipsis">
            <span className="animate-pulse">Welcome to 51Game! The best platform to win real money. Minimum recharge ₹100.</span>
          </div>
          <div className="flex bg-orange-100 text-orange-500 px-2 py-0.5 rounded-full text-xs font-semibold ml-2">
            Details
          </div>
        </div>

        {/* Tab Selection */}
        <div className="bg-white p-3 shadow-sm mb-4">
          <div className="grid grid-cols-4 gap-2">
            {[0.5, 1, 3, 5].map((min) => (
              <button
                key={min}
                onClick={() => setIntervalOption(min as GameInterval)}
                className={cn(
                  "flex flex-col items-center justify-center p-2 rounded-xl border transition-all",
                  intervalOption === min 
                    ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-transparent shadow-md transform scale-[1.02]" 
                    : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
                )}
              >
                <ClockIcon active={intervalOption === min} />
                <span className="font-semibold text-sm mt-1">Win Go</span>
                <span className="text-[10px] opacity-80">{min === 0.5 ? '30s' : min + ' Min'}</span>
              </button>
            ))}
          </div>
        </div>

        {[0.5, 1, 3, 5].map((min) => (
          <GameEngineView key={min} interval={min as GameInterval} isActive={intervalOption === min} />
        ))}
      </div>
    </main>
  );
}

function ClockIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn(active ? "text-white" : "text-gray-400")}>
      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}