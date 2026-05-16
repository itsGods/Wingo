'use client';

import { BetOption } from '@/types/game';

export default function BettingSection({ onBet }: { onBet: (option: BetOption) => void }) {
  return (
    <div className="bg-white p-4 mx-3 rounded-2xl shadow-sm border border-gray-100 mb-4">
      {/* Colors Row */}
      <div className="flex gap-3 mb-4">
        <button 
          onClick={() => onBet('green')}
          className="flex-1 bg-[#4CAF50] text-white py-3 rounded-xl font-bold text-sm shadow-[0_4px_10px_rgba(76,175,80,0.3)] active:scale-95 transition-transform"
        >
          Green
        </button>
        <button 
          onClick={() => onBet('violet')}
          className="flex-1 bg-[#9C27B0] text-white py-3 rounded-xl font-bold text-sm shadow-[0_4px_10px_rgba(156,39,176,0.3)] active:scale-95 transition-transform"
        >
          Violet
        </button>
        <button 
          onClick={() => onBet('red')}
          className="flex-1 bg-[#F44336] text-white py-3 rounded-xl font-bold text-sm shadow-[0_4px_10px_rgba(244,67,54,0.3)] active:scale-95 transition-transform"
        >
          Red
        </button>
      </div>

      {/* Numbers Grid */}
      <div className="bg-gray-50/80 p-3 rounded-2xl border border-gray-100 mb-4">
        <div className="grid grid-cols-5 gap-2.5">
          {Array.from({ length: 10 }).map((_, i) => (
            <NumberButton key={i} num={i} onClick={() => onBet(i)} />
          ))}
        </div>
      </div>

      {/* Size Row */}
      <div className="flex gap-3">
        <button 
          onClick={() => onBet('big')}
          className="flex-1 bg-[#FF9800] text-white py-3 rounded-xl font-bold text-sm shadow-[0_4px_10px_rgba(255,152,0,0.3)] active:scale-95 transition-transform"
        >
          Big
        </button>
        <button 
          onClick={() => onBet('small')}
          className="flex-1 bg-[#2196F3] text-white py-3 rounded-xl font-bold text-sm shadow-[0_4px_10px_rgba(33,150,243,0.3)] active:scale-95 transition-transform"
        >
          Small
        </button>
      </div>
    </div>
  );
}

function NumberButton({ num, onClick }: { num: number, onClick: () => void }) {
  // Logic for number colors
  const isRed = num % 2 === 0 && num !== 0;
  const isGreen = num % 2 !== 0 && num !== 5;
  const isZeroOrFive = num === 0 || num === 5;
  
  let bgClass = "";
  if (num === 0) bgClass = "bg-gradient-to-br from-[#F44336] 50% to-[#9C27B0] 50%";
  else if (num === 5) bgClass = "bg-gradient-to-br from-[#4CAF50] 50% to-[#9C27B0] 50%";
  else if (isRed) bgClass = "bg-[#F44336]";
  else if (isGreen) bgClass = "bg-[#4CAF50]";

  return (
    <button 
      onClick={onClick}
      className={`aspect-square rounded-full ${bgClass} text-white font-display font-bold text-xl shadow-md active:scale-90 transition-transform flex items-center justify-center border-2 border-white`}
    >
      {num}
    </button>
  );
}
