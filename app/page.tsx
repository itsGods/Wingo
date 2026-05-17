'use client';

import { useState } from 'react';
import { Download, HeadphonesIcon, Volume2, Trophy, Coins, Flame, User } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import BottomNav from '@/components/BottomNav';
import { useRouter } from 'next/navigation';
import GameLoadingOverlay from '@/components/GameLoadingOverlay';

export default function CasinoHome() {
  const { user, walletBalance } = useAuth();
  const router = useRouter();
  const [navigatingTo, setNavigatingTo] = useState<{title: string, subtitle?: string, isDark?: boolean} | null>(null);

  const handleNav = (path: string, gameInfo: {title: string, subtitle?: string, isDark?: boolean}) => {
    setNavigatingTo(gameInfo);
    // Allow React to flush the state and browser to paint the overlay before we trigger heavy routing
    setTimeout(() => {
      router.push(path);
    }, 50);
  };

  // Fake winners data
  const winners = [
    { name: 'Mem***', amount: '₹ 15,400.00', game: 'Win Go' },
    { name: 'VIP***', amount: '₹ 2,900.00', game: 'Aviator' },
    { name: 'Sam***', amount: '₹ 8,150.00', game: '5D Lottery' },
    { name: 'Raj***', amount: '₹ 12,000.00', game: 'K3' },
    { name: 'Use***', amount: '₹ 4,500.00', game: 'Win Go' }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#F4F6F9] pb-24">
      {navigatingTo && (
        <GameLoadingOverlay 
          title={navigatingTo.title} 
          subtitle={navigatingTo.subtitle} 
          isDark={navigatingTo.isDark} 
        />
      )}
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white px-4 py-3 pb-8 rounded-b-[2rem] shadow-md relative z-10">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
              <span className="font-display font-bold text-xl text-white tracking-widest italic">LW</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-none">LUCKY WINGO</span>
              <span className="text-[10px] text-white/80 uppercase tracking-widest">Premium Casino</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button aria-label="Download app" className="text-white hover:text-white/80 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded">
              <Download size={22} />
            </button>
            <button aria-label="Customer support" className="text-white hover:text-white/80 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded">
              <HeadphonesIcon size={22} />
            </button>
          </div>
        </div>
        
        {/* User Info / Balance */}
        <div className="bg-white rounded-2xl p-4 shadow-lg flex justify-between items-center text-slate-800">
          <div>
            <p className="text-xs text-gray-500 font-medium mb-1">Total Balance</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold font-display text-indigo-700">
                ₹ {user ? walletBalance.toFixed(2) : '0.00'}
              </span>
              <button onClick={() => router.push('/wallet')} aria-label="Add funds" className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
                <span className="text-sm leading-none block -mt-[1px]">+</span>
              </button>
            </div>
          </div>
          {!user ? (
            <button 
              onClick={() => router.push('/account')}
              className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-md shadow-indigo-200 active:scale-95 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              Log In
            </button>
          ) : (
            <button 
              onClick={() => router.push('/wallet')}
              className="bg-gradient-to-r from-emerald-400 to-emerald-500 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-md shadow-emerald-200 active:scale-95 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              Deposit
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 -mt-4 px-4 relative z-20 space-y-5">
        {/* Announcement Marquee */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 flex items-center gap-2 mt-4">
          <Volume2 size={16} className="text-orange-500 flex-shrink-0" />
          <div className="overflow-hidden whitespace-nowrap overflow-ellipsis flex-1">
            <span className="text-xs text-gray-600 animate-pulse inline-block">
              Welcome to LUCKY WINGO! The best platform to win real money. Minimum recharge ₹100.
            </span>
          </div>
          <button aria-label="View announcements" className="bg-orange-100 text-orange-600 text-[10px] font-bold px-2 py-1 rounded-md flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500">
            Detail
          </button>
        </div>

        {/* Feature Banners */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl p-3 text-white shadow-sm relative overflow-hidden h-24">
            <div className="relative z-10">
              <p className="font-bold text-sm">VIP</p>
              <p className="text-[10px] text-white/90">Exclusive Perks</p>
              <button aria-label="View VIP perks" className="mt-2 bg-white/20 text-xs px-2 py-0.5 rounded-full backdrop-blur-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white">View</button>
            </div>
            <Trophy className="absolute -right-2 -bottom-2 w-16 h-16 text-white/20 pointer-events-none" />
          </div>
          <div className="bg-gradient-to-br from-pink-500 to-rose-400 rounded-2xl p-3 text-white shadow-sm relative overflow-hidden h-24">
            <div className="relative z-10">
              <p className="font-bold text-sm">First Deposit</p>
              <p className="text-[10px] text-white/90">+100% Bonus</p>
              <button aria-label="Claim first deposit bonus" className="mt-2 bg-white/20 text-xs px-2 py-0.5 rounded-full backdrop-blur-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white">Claim</button>
            </div>
            <Coins className="absolute -right-1 -bottom-2 w-16 h-16 text-white/20 pointer-events-none" />
          </div>
        </div>

        {/* Popular Games List */}
        <div>
          <div className="flex justify-between items-end mb-3">
            <div className="flex items-center gap-1.5">
              <div className="w-1 h-4 bg-indigo-600 rounded-full"></div>
              <h2 className="font-bold text-gray-800 text-lg leading-none">Original Games</h2>
            </div>
            <span className="text-xs text-gray-500 font-medium">All Games &gt;</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Win Go Card */}
            <button 
              onClick={() => handleNav('/play', { title: 'Win Go', subtitle: 'Initializing game engine...', isDark: false })} 
              className="text-left group cursor-pointer w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-2xl"
              aria-label="Play Win Go game"
            >
              <div className="bg-white rounded-2xl p-1 shadow-sm border border-gray-100 flex flex-col items-center justify-center h-36 relative overflow-hidden group-hover:border-indigo-200 transition-colors">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-100 to-transparent rounded-bl-full opacity-50 pointer-events-none"></div>
                <div className="absolute top-2 left-2 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm">HOT</div>
                <div className="w-16 h-16 relative mt-1 mb-2 pointer-events-none">
                  {/* Colorful mock logo for Wingo */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-green-400 via-indigo-500 to-red-500 rounded-xl shadow-inner transform rotate-3 group-active:scale-95 transition-transform flex items-center justify-center">
                     <span className="text-white font-black font-display rotate-[-3deg] text-xl drop-shadow-md">W</span>
                  </div>
                </div>
                <h3 className="font-bold text-gray-800 text-sm">Win Go</h3>
                <p className="text-[10px] text-gray-400">Guess Color/Number</p>
              </div>
            </button>

            {/* Mines Card */}
            <button 
              onClick={() => handleNav('/mines', { title: 'Mines', subtitle: 'Preparing minefield...', isDark: true })}
              className="text-left w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-2xl group"
              aria-label="Play Mines game"
            >
              <div className="bg-white rounded-2xl p-1 shadow-sm border border-gray-100 flex flex-col items-center justify-center h-36 relative overflow-hidden cursor-pointer active:scale-95 transition-transform group-hover:border-indigo-200">
                <div className="w-16 h-16 relative mt-1 mb-2 flex items-center justify-center bg-gradient-to-tr from-slate-700 to-slate-900 rounded-xl border-2 border-indigo-500/20 shadow-[0_4px_12px_rgba(0,0,0,0.1)] pointer-events-none">
                   <div className="grid grid-cols-3 gap-[2px]">
                     {[...Array(9)].map((_, i) => (
                       <div key={i} className={`w-2.5 h-2.5 rounded-sm ${i === 4 ? 'bg-indigo-500' : 'bg-slate-600'}`}></div>
                     ))}
                   </div>
                </div>
                <h3 className="font-bold text-gray-800 text-sm pointer-events-none">Mines</h3>
                <p className="text-[10px] text-gray-400 pointer-events-none">Avoid the bombs</p>
              </div>
            </button>

            {/* 5D Card */}
            <button
              className="text-left w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-2xl group"
              aria-label="5D Premium coming soon"
            >
              <div className="bg-white rounded-2xl p-1 shadow-sm border border-gray-100 flex flex-col items-center justify-center h-36 relative opacity-80 group-hover:border-indigo-200 transition-colors">
               <div className="w-16 h-16 relative mt-1 mb-2 flex items-center justify-center bg-gradient-to-tr from-amber-400 to-orange-500 rounded-full pointer-events-none">
                   <span className="text-white font-bold text-2xl font-display">5D</span>
                </div>
                <h3 className="font-bold text-gray-800 text-sm pointer-events-none">5D Premium</h3>
                <p className="text-[10px] text-gray-400 pointer-events-none">Coming Soon</p>
              </div>
            </button>

             {/* Roulette Card */}
            <button 
              onClick={() => handleNav('/roulette', { title: 'Mini Roulette', subtitle: 'Spinning the wheel...', isDark: true })} 
              className="text-left group cursor-pointer w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-2xl"
              aria-label="Play Mini Roulette game"
            >
               <div className="bg-white rounded-2xl p-1 shadow-sm border border-gray-100 flex flex-col items-center justify-center h-36 relative overflow-hidden active:scale-95 transition-transform group-hover:border-indigo-200">
                 <div className="w-16 h-16 relative mt-1 mb-2 flex items-center justify-center bg-gradient-to-tr from-green-700 to-green-900 rounded-xl border-2 border-green-500/20 shadow-[0_4px_12px_rgba(0,0,0,0.1)] pointer-events-none">
                   <div className="w-10 h-10 rounded-full border-4 border-dashed border-red-500 bg-black flex items-center justify-center relative spin-slow">
                     <div className="w-3 h-3 bg-white rounded-full absolute top-1 right-1 drop-shadow-md"></div>
                   </div>
                 </div>
                 <h3 className="font-bold text-gray-800 text-sm pointer-events-none">Roulette</h3>
                 <p className="text-[10px] text-gray-400 pointer-events-none">Mini 12 Numbers</p>
               </div>
            </button>
          </div>
        </div>

        {/* Live Winners Ticker */}
        <div>
          <div className="flex items-center gap-1.5 mb-3 mt-2">
             <div className="w-1 h-4 bg-orange-500 rounded-full"></div>
             <h2 className="font-bold text-gray-800 text-lg leading-none flex items-center gap-1">
               Latest Winning <Flame size={16} className="text-orange-500 fill-orange-500" />
             </h2>
          </div>
          
          <div className="bg-white rounded-2xl p-1 shadow-sm overflow-hidden h-40 relative">
            {/* Overlay for fading effect */}
            <div className="absolute top-0 left-0 w-full h-6 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-full h-6 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none"></div>
            
            <div className="px-3 py-1 space-y-3 animate-marquee-vertical">
              {/* Duplicate array for seamless infinite scroll if we wanted to make animation via tailwind, using simple map for now */}
              {[...winners, ...winners].map((winner, idx) => (
                <div key={idx} className="flex justify-between items-center py-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400">
                      <User size={14} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-700">{winner.name}</p>
                      <p className="text-[10px] text-gray-400">Playing {winner.game}</p>
                    </div>
                  </div>
                  <div className="text-emerald-500 font-bold text-sm bg-emerald-50 px-2 py-1 rounded-md">
                    {winner.amount}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
      </main>
      
      <BottomNav />
    </div>
  );
}
