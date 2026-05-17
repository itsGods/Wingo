'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { ChevronLeft, Diamond, Sparkles, User, HelpCircle, Loader2 } from 'lucide-react';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import GameLoadingOverlay from '@/components/GameLoadingOverlay';

type TileState = {
  isMine: boolean;
  revealed: boolean;
  userRevealed?: boolean;
};

type GameStatus = 'idle' | 'playing' | 'cashout' | 'lost';

function choose(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  let result = 1;
  for (let i = 1; i <= k; i++) {
    result = result * (n - i + 1) / i;
  }
  return result;
}

function calcMultiplier(mines: number, gems: number): number {
  if (gems === 0) return 1.00;
  const houseEdge = 0.01;
  const n = 25;
  const prob = choose(n - mines, gems) / choose(n, gems);
  if (prob === 0) return 0;
  return (1 / prob) * (1 - houseEdge);
}

export default function MinesPage() {
  const router = useRouter();
  const { user, walletBalance } = useAuth();

  const [betAmount, setBetAmount] = useState<number>(10);
  const [minesCount, setMinesCount] = useState<number>(3);
  
  const [grid, setGrid] = useState<TileState[]>(Array(25).fill({ isMine: false, revealed: false }));
  const [gameStatus, setGameStatus] = useState<GameStatus>('idle');
  const [gemsFound, setGemsFound] = useState<number>(0);
  const [blownTile, setBlownTile] = useState<number | null>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);

  const currentMultiplier = gemsFound > 0 ? calcMultiplier(minesCount, gemsFound) : 1.00;
  const nextMultiplier = calcMultiplier(minesCount, gemsFound + 1);
  const currentPayout = betAmount * currentMultiplier;
  
  // Game Audio
  const playSound = (type: 'gem' | 'mine' | 'win' | 'bet') => {
    if (typeof window === 'undefined') return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      if (type === 'gem') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600 + gemsFound * 50, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'mine') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(100, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(10, ctx.currentTime + 0.5);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      } else if (type === 'win') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.setValueAtTime(600, ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(800, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      } else if (type === 'bet') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      }
    } catch(e) {}
  };

  const startGame = async () => {
    if (!user) {
      alert("Please login first");
      return;
    }
    if (betAmount < 10) {
      alert("Minimum bet is ₹10");
      return;
    }
    if (walletBalance < betAmount) {
      alert("Insufficient balance");
      return;
    }
    
    setIsProcessing(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        walletBalance: increment(-betAmount)
      });
      
      playSound('bet');
      
      // Generate grid
      const newGrid = Array(25).fill({ isMine: false, revealed: false });
      let minesPlaced = 0;
      while (minesPlaced < minesCount) {
        const r = Math.floor(Math.random() * 25);
        if (!newGrid[r].isMine) {
          newGrid[r] = { isMine: true, revealed: false };
          minesPlaced++;
        }
      }
      
      setGrid(newGrid);
      setGemsFound(0);
      setBlownTile(null);
      setGameStatus('playing');
    } catch (e: any) {
      alert("Error starting game: " + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const cashout = async () => {
    if (gameStatus !== 'playing' || gemsFound === 0) return;
    setIsProcessing(true);
    
    try {
      const payout = betAmount * currentMultiplier;
      const userRef = doc(db, 'users', user!.uid);
      await updateDoc(userRef, {
        walletBalance: increment(payout)
      });
      
      playSound('win');
      
      // Reveal rest of grid
      setGrid(prev => prev.map(t => ({ ...t, revealed: true })));
      setGameStatus('cashout');
    } catch(e: any) {
      alert("Error cashing out: " + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTileClick = async (index: number) => {
    if (gameStatus !== 'playing' || isProcessing) return;
    if (grid[index].revealed) return;
    
    const tile = grid[index];
    const newGrid = [...grid];
    newGrid[index] = { ...tile, revealed: true, userRevealed: true };
    
    if (tile.isMine) {
      // Hit a mine!
      playSound('mine');
      setBlownTile(index);
      setGameStatus('lost');
      // Reveal everything
      setGrid(newGrid.map(t => ({ ...t, revealed: true })));
    } else {
      // Hit a gem!
      playSound('gem');
      setGrid(newGrid);
      const newGemsVal = gemsFound + 1;
      setGemsFound(newGemsVal);
      
      // Check if all gems found
      if (newGemsVal === 25 - minesCount) {
        // Auto cashout
        setIsProcessing(true);
        try {
          const payout = betAmount * calcMultiplier(minesCount, newGemsVal);
          const userRef = doc(db, 'users', user!.uid);
          await updateDoc(userRef, {
            walletBalance: increment(payout)
          });
          playSound('win');
          setGameStatus('cashout');
          setGrid(newGrid.map(t => ({ ...t, revealed: true })));
        } catch(e) {
          console.error("error encountered");
        } finally {
          setIsProcessing(false);
        }
      }
    }
  };

  const pickRandom = () => {
    if (gameStatus !== 'playing' || isProcessing) return;
    const unrevealed = grid.map((t, i) => !t.revealed ? i : -1).filter(i => i !== -1);
    if (unrevealed.length > 0) {
      const randomIndex = Math.floor(Math.random() * unrevealed.length);
      handleTileClick(unrevealed[randomIndex]);
    }
  };

  return (
    <main className="flex flex-col min-h-screen bg-[#1A2C38] text-white">
      <GameLoadingOverlay title="Mines" subtitle="Preparing minefield..." isDark={true} />
      {/* Header */}
      <div className="bg-[#1A2C38] border-b border-[#213743] pt-safe relative z-10 shadow-sm flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 relative z-10 max-w-6xl mx-auto w-full">
          <button onClick={() => router.back()} className="p-2 -ml-2 text-gray-400 hover:text-white transition-colors">
            <ChevronLeft size={24} />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="bg-[#0F212E] px-3 py-1.5 rounded-lg border border-[#213743] flex items-center gap-2">
              <span className="text-[#00E701] font-bold">₹</span>
              <span className="font-bold font-mono text-sm">{walletBalance.toFixed(2)}</span>
            </div>
            {user?.photoURL ? 
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full ml-1" />
              : 
              <div className="w-8 h-8 rounded-full bg-[#213743] flex items-center justify-center ml-1">
                <User size={16} className="text-gray-400" />
              </div>
            }
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden max-w-6xl mx-auto w-full">
        
        {/* Mobile controls top (Mines amount, Profit info) can be visible or we just stick to sidebar on left for md+ and stacked on mobile */}
        {/* Controls Sidebar */}
        <div className="w-full md:w-[320px] bg-[#213743] flex flex-col h-full overflow-y-auto order-2 md:order-1">
           <div className="p-4 space-y-4">
              
             {/* Amount Input */}
             <div>
               <label className="text-sm text-gray-400 font-semibold mb-1 block">Bet Amount</label>
               <div className="bg-[#0F212E] p-1 rounded border border-[#213743] flex items-center shadow-inner hover:border-[#3b5566] transition-colors focus-within:border-[#557086]">
                 <div className="flex-1 relative">
                   <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₹</span>
                   <input 
                     type="number" 
                     disabled={gameStatus === 'playing'}
                     value={betAmount || ''}
                     onChange={(e) => setBetAmount(Number(e.target.value))}
                     className="w-full bg-transparent text-white font-bold py-2.5 pl-8 pr-3 outline-none disabled:opacity-50 text-sm"
                   />
                 </div>
                 <div className="flex gap-1 pr-1">
                   <button 
                     disabled={gameStatus === 'playing'}
                     onClick={() => setBetAmount(Math.max(10, betAmount / 2))}
                     className="bg-[#2F4553] text-white font-bold px-3 py-1.5 rounded text-xs hover:bg-[#3b5566] disabled:opacity-50 transition-colors"
                   >½</button>
                   <button 
                     disabled={gameStatus === 'playing'}
                     onClick={() => setBetAmount(betAmount * 2)}
                     className="bg-[#2F4553] text-white font-bold px-3 py-1.5 rounded text-xs hover:bg-[#3b5566] disabled:opacity-50 transition-colors"
                   >2×</button>
                 </div>
               </div>
             </div>
             
             {/* Mines Selector */}
             <div>
               <label className="text-sm text-gray-400 font-semibold mb-1 block">Mines</label>
               <div className="relative">
                 <select 
                   disabled={gameStatus === 'playing'}
                   value={minesCount}
                   onChange={(e) => setMinesCount(Number(e.target.value))}
                   className="w-full bg-[#0F212E] text-white font-bold py-3 px-4 rounded outline-none appearance-none border border-[#213743] disabled:opacity-50 hover:border-[#3b5566] focus:border-[#557086] transition-colors shadow-inner text-sm"
                 >
                   {[...Array(24)].map((_, i) => (
                     <option key={i+1} value={i+1}>{i+1}</option>
                   ))}
                 </select>
                 <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <ChevronLeft className="w-5 h-5 text-gray-400 -rotate-90" />
                 </div>
               </div>
             </div>

             {/* Action Button */}
             <div className="pt-2">
               {gameStatus === 'playing' ? (
                 <button
                    onClick={() => cashout()}
                    disabled={isProcessing || gemsFound === 0}
                    className="w-full bg-[#00E701] hover:bg-[#1fff20] text-black py-3.5 rounded font-bold text-sm transition-colors disabled:opacity-50 shadow-md flex items-center justify-center gap-2 uppercase tracking-wide flex-col leading-tight"
                 >
                    <div className="flex items-center gap-2">
                       {isProcessing && <Loader2 className="animate-spin w-4 h-4" />}
                       <span>Cashout</span>
                    </div>
                    {gemsFound > 0 && <span className="text-[10px] opacity-80">(₹{currentPayout.toFixed(2)})</span>}
                 </button>
               ) : (
                 <button
                    onClick={() => startGame()}
                    disabled={isProcessing}
                    className="w-full bg-[#00E701] hover:bg-[#1fff20] text-black py-3.5 rounded font-bold text-sm transition-colors disabled:opacity-50 shadow-md flex items-center justify-center gap-2 uppercase tracking-wide"
                 >
                    {isProcessing && <Loader2 className="animate-spin w-4 h-4" />}
                    {gameStatus === 'idle' ? 'Bet' : 'Bet'}
                 </button>
               )}
             </div>

             {/* Playing details */}
             {gameStatus === 'playing' && gemsFound > 0 && (
               <div className="pt-2 grid grid-cols-2 gap-2">
                 <div className="bg-[#0F212E] border border-[#213743] rounded p-2 text-center shadow-inner">
                   <p className="text-[10px] text-gray-500 uppercase font-black">Total Profit</p>
                   <p className="text-[#00E701] font-mono font-bold text-sm">₹{(currentPayout - betAmount).toFixed(2)}</p>
                 </div>
                 <button 
                  onClick={() => pickRandom()}
                  disabled={isProcessing}
                  className="bg-[#2F4553] hover:bg-[#3b5566] disabled:opacity-50 transition-colors rounded border border-[#213743] text-white text-xs font-bold py-2 shadow-inner uppercase"
                 >
                   Pick Random
                 </button>
               </div>
             )}

           </div>
        </div>

        {/* Game Area */}
        <div className="flex-1 bg-[#0F212E] p-4 flex flex-col items-center justify-center relative order-1 md:order-2 overflow-y-auto">
           
           {/* Mobile Top Stats */}
           <div className="w-full max-w-[420px] mb-6 md:mb-10 flex gap-2 justify-between">
              <div className="bg-[#213743] border border-[#2F4553] rounded-lg px-4 py-2 flex-1 shadow-md">
                 <p className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase whitespace-nowrap overflow-hidden text-ellipsis">Multiplier</p>
                 <p className="text-xl sm:text-2xl font-black text-white">{currentMultiplier.toFixed(2)}×</p>
              </div>
              <div className="bg-[#213743] border border-[#2F4553] rounded-lg px-4 py-2 flex-1 shadow-md text-right">
                 <p className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase whitespace-nowrap overflow-hidden text-ellipsis">Profit Next Tile</p>
                 <p className="text-lg sm:text-xl font-bold text-white opacity-80">₹{((nextMultiplier * betAmount) - betAmount).toFixed(2)}</p>
              </div>
           </div>

           {/* The Grid */}
           <div className="p-3 w-full max-w-[420px] mx-auto">
              <div className="grid grid-cols-5 grid-rows-5 gap-2 md:gap-3 aspect-square">
                {grid.map((tile, i) => {
                  const isBlown = blownTile === i;
                  
                  let tileContent = null;
                  if (tile.revealed) {
                    if (tile.isMine) {
                       tileContent = <span className="text-2xl md:text-3xl drop-shadow-md leading-none">💣</span>;
                    } else {
                       tileContent = <Diamond className="w-6 h-6 md:w-8 md:h-8 text-[#00E701] drop-shadow-md" fill="currentColor" />;
                    }
                  }
                  
                  let bgClass = "bg-[#2F4553] shadow-[0_-4px_0_#213340_inset] hover:bg-[#3b5566] transition-colors cursor-pointer active:translate-y-1 active:shadow-none hover:-translate-y-1";
                  
                  if (tile.revealed) {
                     if (tile.isMine) {
                       bgClass = isBlown ? "bg-[#c73528]" : "bg-[#2F4553] opacity-60";
                     } else {
                       if (tile.userRevealed) {
                         bgClass = "bg-[#071824] border-2 border-[#1A2C38] shadow-inner";
                       } else {
                         bgClass = "bg-[#071824] bg-opacity-80 border-2 border-[#1A2C38] opacity-50";
                       }
                     }
                  }

                  return (
                    <button 
                      key={i}
                      disabled={gameStatus !== 'playing' || tile.revealed || isProcessing}
                      onClick={() => handleTileClick(i)}
                      className={`w-full h-full rounded flex items-center justify-center relative overflow-hidden ${bgClass} transition-transform duration-200`}
                    >
                       <div className="transition-transform duration-300 transform scale-100 hover:scale-110">
                          {tileContent}
                       </div>
                    </button>
                  )
                })}
              </div>
           </div>
        </div>

      </div>
    </main>
  );
}
