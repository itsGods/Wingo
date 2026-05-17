'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { ChevronLeft, Loader2, RotateCcw, Menu, ChevronDown, HelpCircle } from 'lucide-react';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import GameLoadingOverlay from '@/components/GameLoadingOverlay';

const ROULETTE_NUMBERS = [7, 3, 11, 1, 9, 5, 4, 10, 6, 12, 2, 8];

// Groups
const RED_NUMS = [1, 3, 5, 8, 10, 12];
const BLACK_NUMS = [2, 4, 6, 7, 9, 11];

type BetOption = number | '1-6' | '7-12' | 'Even' | 'Odd' | 'Red' | 'Black';

type Bet = {
  option: BetOption;
  amount: number;
};

const CHIP_VALUES = [1, 10, 50, 100, 500];

const getMultiplier = (option: BetOption) => {
  if (typeof option === 'number') return 11.88;
  return 1.98;
};

const checkWin = (option: BetOption, result: number) => {
  if (typeof option === 'number') return option === result;
  if (option === '1-6') return result >= 1 && result <= 6;
  if (option === '7-12') return result >= 7 && result <= 12;
  if (option === 'Even') return result % 2 === 0;
  if (option === 'Odd') return result % 2 !== 0;
  if (option === 'Red') return RED_NUMS.includes(result);
  if (option === 'Black') return BLACK_NUMS.includes(result);
  return false;
};

export default function MiniRoulettePage() {
  const router = useRouter();
  const { user, walletBalance } = useAuth();

  const [bets, setBets] = useState<Bet[]>([]);
  const [selectedChip, setSelectedChip] = useState<number>(10);
  const [gameStatus, setGameStatus] = useState<'idle' | 'spinning' | 'finished'>('idle');
  const [isProcessing, setIsProcessing] = useState(false);

  const [wheelAngle, setWheelAngle] = useState(0);
  const [ballAngle, setBallAngle] = useState(0);
  const [resultNumber, setResultNumber] = useState<number | null>(null);
  const [winAmount, setWinAmount] = useState(0);

  // Audio Context
  const playSound = (type: 'chip' | 'spin' | 'win' | 'lose') => {
    if (typeof window === 'undefined') return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      if (type === 'chip') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } else if (type === 'spin') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 2.5);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 2.5);
        osc.start();
        osc.stop(ctx.currentTime + 2.5);
      } else if (type === 'win') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.setValueAtTime(600, ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(800, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      } else if (type === 'lose') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(50, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch(e) {}
  };

  const totalBet = bets.reduce((acc, b) => acc + b.amount, 0);

  const placeBet = (option: BetOption) => {
    if (gameStatus === 'spinning' || isProcessing) return;
    if (gameStatus === 'finished') {
       // Auto clear
       setBets([{ option, amount: selectedChip }]);
       setGameStatus('idle');
       setResultNumber(null);
       playSound('chip');
       return;
    }

    if (totalBet + selectedChip > walletBalance) {
      alert("Insufficient balance");
      return;
    }

    playSound('chip');
    setBets(prev => {
      const existing = prev.find(b => b.option === option);
      if (existing) {
        return prev.map(b => b.option === option ? { ...b, amount: b.amount + selectedChip } : b);
      }
      return [...prev, { option, amount: selectedChip }];
    });
  };

  const undoBet = () => {
    if (gameStatus === 'spinning' || isProcessing) return;
    setBets(prev => prev.slice(0, -1));
  };

  const clearBets = () => {
    if (gameStatus === 'spinning' || isProcessing) return;
    setBets([]);
  };
  
  const repeatBet = () => {
      // Logic could go here, for simple ui we bind just rebet to noop if empty
  };

  const spin = async () => {
    if (!user) {
      alert("Please login first");
      return;
    }
    if (bets.length === 0) {
      alert("Please place a bet");
      return;
    }
    if (totalBet > walletBalance) {
      alert("Insufficient balance");
      return;
    }

    setIsProcessing(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        walletBalance: increment(-totalBet)
      });

      playSound('spin');
      setGameStatus('spinning');
      setResultNumber(null);
      setWinAmount(0);

      // Determine result
      const resultIndex = Math.floor(Math.random() * ROULETTE_NUMBERS.length);
      const randomNum = ROULETTE_NUMBERS[resultIndex];

      // Calculate angles
      // The wheel stays stationary, only the ball rotates
      const newWheelAngle = 0; 
      // Spin the ball a few full rotations + land on the correct angle
      const targetBallAngle = (Math.floor(ballAngle / 360) + 5) * 360 + resultIndex * 30;

      setWheelAngle(newWheelAngle);
      setBallAngle(targetBallAngle);

      // Wait for spin to finish (3.5s)
      setTimeout(async () => {
        try {
          let win = 0;
          bets.forEach(b => {
            if (checkWin(b.option, randomNum)) {
              win += b.amount * getMultiplier(b.option);
            }
          });

          if (win > 0) {
            playSound('win');
            await updateDoc(userRef, {
              walletBalance: increment(win)
            });
          } else {
            playSound('lose');
          }

          setResultNumber(randomNum);
          setWinAmount(win);
          setGameStatus('finished');
        } catch (e: any) {
          console.error("Spin result error encountered.");
        } finally {
          setIsProcessing(false);
        }
      }, 3600);

    } catch (e: any) {
      alert("Error starting game: " + e.message);
      setIsProcessing(false);
    }
  };

  const renderSpot = (option: BetOption, label: string | React.ReactNode, colSpan: number = 1, rowSpan: number = 1, forceBg?: string) => {
    const bet = bets.find(b => b.option === option);
    let defaultBg = "bg-transparent"; 
    
    return (
      <button 
        key={option}
        className={`relative border border-[#3ed079] flex items-center justify-center cursor-pointer select-none overflow-hidden transition-opacity hover:opacity-80 active:scale-95 focus:outline-none focus-visible:bg-white/20 ${defaultBg}`}
        style={{ gridColumn: `span ${colSpan}`, gridRow: `span ${rowSpan}` }}
        onClick={() => placeBet(option)}
        aria-label={`Bet on ${option}`}
      >
         <span className="text-white text-[12px] font-normal z-10 pointer-events-none">{label}</span>
         {bet && (
           <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[22px] h-[22px] bg-yellow-500 text-black text-[10px] font-black rounded-full flex items-center justify-center border border-yellow-700 shadow-xl z-20 pointer-events-none">
             {bet.amount > 999 ? '1k+' : bet.amount}
           </div>
         )}
      </button>
    );
  };

  return (
    <main className="flex flex-col h-screen md:h-screen bg-zinc-950 sm:p-4 items-center justify-center w-full fixed inset-0">
      <GameLoadingOverlay title="Mini Roulette" subtitle="Loading table..." isDark={true} />
      
      <div className="w-full h-full sm:h-[800px] max-w-[400px] bg-[#129A41] sm:rounded-[36px] sm:shadow-2xl relative flex flex-col font-sans overflow-hidden">
        
        {/* Back Button */}
        <div className="absolute top-4 left-4 z-50">
          <button onClick={() => router.back()} className="p-2 text-white/50 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-md" aria-label="Go back">
             <ChevronLeft size={28} />
          </button>
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto w-full hide-scrollbar flex flex-col relative z-20 pb-32">
          
          {/* Wheel Section */}
          <div className="relative w-[300px] h-[300px] sm:w-[320px] sm:h-[320px] mx-auto mt-16 mb-6 flex-shrink-0">
           {/* Shadow layer for wheel */}
           <div className="absolute inset-2 rounded-full bg-black/40 blur-xl"></div>
           
           {/* Wheel Background/Border */}
           <div 
             className="absolute inset-0 rounded-full border-[20px] border-[#106A26] bg-[#222] shadow-[inset_0_4px_10px_rgba(0,0,0,0.4)]"
           >
             {/* Spinning Segments */}
             <div 
               className="w-full h-full rounded-full relative"
               style={{ 
                 transform: `rotate(${wheelAngle}deg)`, 
                 transition: gameStatus === 'spinning' ? 'transform 3.5s cubic-bezier(0.2, 0.8, 0.2, 1)' : 'none',
               }}
             >
                {/* Conic Gradient for Colors (Red/Black alternating) */}
                <div 
                   className="absolute inset-0 rounded-full overflow-hidden"
                   style={{
                     background: `conic-gradient(from -15deg, ${ROULETTE_NUMBERS.map((num, i) => `${RED_NUMS.includes(num) ? '#E61C24' : '#111'} ${i*30}deg ${(i+1)*30}deg`).join(', ')})`
                   }}
                />
                
                {/* Numbers */}
                {ROULETTE_NUMBERS.map((num, i) => (
                  <div 
                    key={num}
                    className="absolute inset-0 flex justify-center pt-2"
                    style={{ transform: `rotate(${i * 30}deg)` }}
                  >
                    <span 
                      className={`font-bold text-xl ${RED_NUMS.includes(num) ? 'text-white' : 'text-white'}`}
                      style={{ 
                        fontFamily: 'system-ui, -apple-system, sans-serif'
                      }}
                    >
                      {num}
                    </span>
                  </div>
                ))}
                
                {/* Center cap */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110px] h-[110px] bg-[#EAE2F1] rounded-full shadow-[0_2px_15px_rgba(0,0,0,0.5),inset_0_-2px_5px_rgba(0,0,0,0.1)] flex items-center justify-center border-4 border-white">
                    {/* SVG Metal cross - 4 circles and center */}
                    <svg width="60" height="60" viewBox="0 0 60 60" className="text-black rotate-45 opacity-90">
                        {/* Arms */}
                        <line x1="30" y1="12" x2="30" y2="48" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                        <line x1="12" y1="30" x2="48" y2="30" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                        {/* Outer circles */}
                        <circle cx="30" cy="8" r="8" fill="currentColor" />
                        <circle cx="30" cy="52" r="8" fill="currentColor" />
                        <circle cx="8" cy="30" r="8" fill="currentColor" />
                        <circle cx="52" cy="30" r="8" fill="currentColor" />
                        {/* Inner circle */}
                        <circle cx="30" cy="30" r="8" fill="#EAE2F1" stroke="currentColor" strokeWidth="3" />
                    </svg>
                </div>
             </div>
           </div>
           
           {/* Ball Container */}
           <div 
             className="absolute inset-0 rounded-full pointer-events-none"
             style={{ 
               transform: `rotate(${ballAngle}deg)`, 
               transition: gameStatus === 'spinning' ? 'transform 3.5s cubic-bezier(0.1, 0.7, 0.1, 1)' : 'none',
             }}
           >
              <div 
                className="absolute top-[16px] left-1/2 -translate-x-1/2 w-[12px] h-[12px] bg-white rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.4)] block"
              />
           </div>

           {/* Result Overlay text */}
           {gameStatus === 'finished' && resultNumber && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/80 text-white font-bold text-4xl w-16 h-16 rounded-full flex items-center justify-center shadow-2xl animate-in zoom-in spin-in-12 duration-300 z-20">
                {resultNumber}
              </div>
           )}
        </div>

        {/* Bets & Table Container - Sized to match design */}
        <div className="w-full max-w-[340px] flex mx-auto flex-col">
          {/* Info row */}
          <div className="flex justify-between items-center text-white text-xs px-2 mb-2 w-full mt-4">
             <div className="flex gap-1 items-center font-medium">
               <span className="opacity-90 tracking-wide">Bet:</span>
               <span className="font-bold tracking-wider">₹{totalBet.toFixed(2)}</span>
               {winAmount > 0 && <span className="ml-2 text-yellow-300 bg-black/20 px-2.5 py-0.5 rounded-full font-bold animate-pulse">Win: ₹{winAmount.toFixed(2)}</span>}
             </div>
             <button className="underline opacity-80 hover:opacity-100 decoration-1 underline-offset-[3px] focus:outline-none tracking-wide" aria-label="Open paytable">Paytable</button>
          </div>

          <div className="w-full max-w-[340px] mx-auto">
            {/* Table Grid inside a green border */}
            <div className="border border-[#3ed079] rounded-xl overflow-hidden shadow-sm p-[1px] bg-[#0c8f33]">
             <div className="grid grid-cols-6 grid-rows-3 h-[140px]">
                {/* Top Row: 2, 4, 6, 8, 10, 12 */}
                {renderSpot(2, <div className="w-[32px] h-[32px] sm:w-[36px] sm:h-[36px] bg-[#111] rounded-full flex items-center justify-center text-white text-lg font-medium shadow-sm">2</div>)}
                {renderSpot(4, <div className="w-[32px] h-[32px] sm:w-[36px] sm:h-[36px] bg-[#111] rounded-full flex items-center justify-center text-white text-lg font-medium shadow-sm">4</div>)}
                {renderSpot(6, <div className="w-[32px] h-[32px] sm:w-[36px] sm:h-[36px] bg-[#111] rounded-full flex items-center justify-center text-white text-lg font-medium shadow-sm">6</div>)}
                {renderSpot(8, <div className="w-[32px] h-[32px] sm:w-[36px] sm:h-[36px] bg-[#E61C24] rounded-full flex items-center justify-center text-white text-lg font-medium shadow-sm">8</div>)}
                {renderSpot(10, <div className="w-[32px] h-[32px] sm:w-[36px] sm:h-[36px] bg-[#E61C24] rounded-full flex items-center justify-center text-white text-lg font-medium shadow-sm">10</div>)}
                {renderSpot(12, <div className="w-[32px] h-[32px] sm:w-[36px] sm:h-[36px] bg-[#E61C24] rounded-full flex items-center justify-center text-white text-lg font-medium shadow-sm">12</div>)}

                {/* Bottom Row: 1, 3, 5, 7, 9, 11 */}
                {renderSpot(1, <div className="w-[32px] h-[32px] sm:w-[36px] sm:h-[36px] bg-[#E61C24] rounded-full flex items-center justify-center text-white text-lg font-medium shadow-sm">1</div>)}
                {renderSpot(3, <div className="w-[32px] h-[32px] sm:w-[36px] sm:h-[36px] bg-[#E61C24] rounded-full flex items-center justify-center text-white text-lg font-medium shadow-sm">3</div>)}
                {renderSpot(5, <div className="w-[32px] h-[32px] sm:w-[36px] sm:h-[36px] bg-[#E61C24] rounded-full flex items-center justify-center text-white text-lg font-medium shadow-sm">5</div>)}
                {renderSpot(7, <div className="w-[32px] h-[32px] sm:w-[36px] sm:h-[36px] bg-[#111] rounded-full flex items-center justify-center text-white text-lg font-medium shadow-sm">7</div>)}
                {renderSpot(9, <div className="w-[32px] h-[32px] sm:w-[36px] sm:h-[36px] bg-[#111] rounded-full flex items-center justify-center text-white text-lg font-medium shadow-sm">9</div>)}
                {renderSpot(11, <div className="w-[32px] h-[32px] sm:w-[36px] sm:h-[36px] bg-[#111] rounded-full flex items-center justify-center text-white text-lg font-medium shadow-sm">11</div>)}

                {/* Outside bets */}
                {renderSpot('1-6', '1-6')}
                {renderSpot('Even', 'Even')}
                {renderSpot('Black', <div className="w-[32px] h-[32px] sm:w-[36px] sm:h-[36px] bg-[#111] rounded-full shadow-sm" />)}
                {renderSpot('Red', <div className="w-[32px] h-[32px] sm:w-[36px] sm:h-[36px] bg-[#E61C24] rounded-full shadow-sm" />)}
                {renderSpot('Odd', 'Odd')}
                {renderSpot('7-12', '7-12')}
             </div>
          </div>

          {/* Toolbar: Back, Clear, Rebet */}
          <div className="flex justify-between items-center text-white text-[11px] font-medium mt-3 px-1">
             <div className="flex gap-2">
                <button onClick={() => undoBet()} className="border border-[#72C892] rounded px-2.5 py-1.5 hover:bg-white/10 active:scale-95 flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-white" aria-label="Undo last bet">
                   <RotateCcw className="w-3 h-3 -scale-x-100 font-bold"/> Back
                </button>
                <button onClick={() => clearBets()} className="border border-[#72C892] rounded px-2.5 py-1.5 hover:bg-white/10 active:scale-95 flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-white" aria-label="Clear all bets">
                   ✕ Clear
                </button>
             </div>
             <button onClick={() => repeatBet()} className="border border-[#72C892] rounded px-2.5 py-1.5 hover:bg-white/10 active:scale-95 flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-white" aria-label="Repeat last bet">
                <RotateCcw className="w-3 h-3"/> Rebet
             </button>
          </div>
        </div>
        </div>

        {/* Dark bottom panel for chips and spin button */}
        <div className="bg-[#0A642B] rounded-[24px] p-3 sm:p-4 mx-4 mt-8 mb-4 min-h-[90px] flex items-center justify-between shadow-[0_8px_20px_rgba(0,0,0,0.2)]">
           <div className="flex gap-1 sm:gap-2 items-center overflow-x-auto hide-scrollbar whitespace-nowrap">
             {CHIP_VALUES.map((val) => (
               <button
                 key={val}
                 onClick={() => setSelectedChip(val)}
                 aria-label={`Select ${val} chip`}
                 aria-pressed={selectedChip === val}
                 className={`relative w-[42px] h-[42px] sm:w-[48px] sm:h-[48px] rounded-full border-[3px] flex-shrink-0 flex items-center justify-center text-[12px] sm:text-[14px] font-black transition-transform focus:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400 ${
                   selectedChip === val 
                   ? 'scale-110 -translate-y-2 !border-white' 
                   : 'border-white/5 hover:scale-105'
                 }`}
                 style={{
                   // Specific chips colors to match screenshot
                   backgroundColor: val === 1 ? '#8A8F93' : val === 10 ? '#E61C24' : val === 50 ? '#1E68C1' : val === 100 ? '#15A831' : '#2C2D31',
                   color: 'white',
                   boxShadow: selectedChip === val ? '0 10px 20px rgba(0,0,0,0.3), inset 0 2px 5px rgba(255,255,255,0.3)' : '0 4px 6px rgba(0,0,0,0.2), inset 0 2px 5px rgba(255,255,255,0.2)'
                 }}
               >
                 <div className="w-[32px] h-[32px] sm:w-[36px] sm:h-[36px] rounded-full border border-white/20 flex items-center justify-center bg-transparent">
                   {val}
                 </div>
               </button>
             ))}
           </div>
           
           <button
              onClick={() => spin()}
              disabled={gameStatus === 'spinning' || isProcessing || bets.length === 0}
              aria-label="Spin the wheel"
              className="w-[60px] h-[60px] sm:w-[68px] sm:h-[68px] flex-shrink-0 rounded-full bg-[#15A831] hover:bg-[#12912a] border-[4px] border-[#0A642B] text-white flex items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.3)] disabled:opacity-50 disabled:cursor-not-allowed transition-transform active:scale-95 ml-2 focus:outline-none focus-visible:ring-4 focus-visible:ring-white"
           >
              {isProcessing && gameStatus !== 'spinning' ? <Loader2 className="w-8 h-8 animate-spin" /> : (
                 <svg className="w-8 h-8 rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12V6a2 2 0 0 1 2-2h12.5"/>
                    <path d="m13.5 1-3.5 3.5L13.5 8"/>
                    <path d="M22 12v6a2 2 0 0 1-2 2H7.5"/>
                    <path d="m10.5 16 3.5 3.5-3.5 3.5"/>
                 </svg>
              )}
           </button>
        </div>
        
        </div>

        {/* Global Bottom Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-14 bg-[#0A642B] border-t border-[#095223] flex items-center justify-between px-3 shadow-[0_-5px_15px_rgba(0,0,0,0.05)] z-40">
           <div className="flex items-center gap-2">
             <button className="bg-[#129A41] border border-[#3ed079]/40 text-white text-[11px] font-bold px-2 py-1.5 rounded flex items-center gap-1 active:scale-95 transition-transform">
               MINI ROULETTE <ChevronDown className="w-3 h-3" />
             </button>
             <button className="text-[#F59E0B] bg-[#F59E0B]/10 hover:bg-[#F59E0B]/20 transition-colors w-7 h-7 rounded-full flex items-center justify-center font-bold font-serif active:scale-95" aria-label="Help">
               ?
             </button>
           </div>
           
           <div className="flex items-center text-white font-bold text-[13px] tracking-wider">
             ₹{walletBalance.toFixed(2)}
             <button className="bg-[#3ed079] hover:bg-[#2eaa61] text-[#0A642B] w-8 h-8 rounded-full flex items-center justify-center ml-2 active:scale-95 transition-transform" aria-label="Menu">
               <Menu className="w-4 h-4" strokeWidth={3} />
             </button>
           </div>
        </div>

      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </main>
  );
}
