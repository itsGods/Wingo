'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Bell, Search, HeadphonesIcon, Download, Trophy, Flame, Play, Volume2, Star, Coins, ArrowRight, User } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import GameLoadingOverlay from '@/components/GameLoadingOverlay';

export default function CasinoHome() {
  const { user, walletBalance } = useAuth();
  const router = useRouter();
  const [navigatingTo, setNavigatingTo] = useState<{title: string, subtitle?: string, isDark?: boolean} | null>(null);

  const handleNav = (path: string, gameInfo: {title: string, subtitle?: string, isDark?: boolean}) => {
    setNavigatingTo(gameInfo);
    // Allow React to flush the state and browser to paint the overlay before we trigger heavy routing
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        router.push(path);
      });
    });
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
              <span className="font-display font-bold text-xl text-white tracking-widest italic">51</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-none">51GAME</span>
              <span className="text-[10px] text-white/80 uppercase tracking-widest">Premium Casino</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="text-white hover:text-white/80 transition-colors">
              <Download size={22} />
            </button>
            <button className="text-white hover:text-white/80 transition-colors">
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
              <button onClick={() => router.push('/wallet')} className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                <span className="text-sm leading-none block -mt-[1px]">+</span>
              </button>
            </div>
          </div>
          {!user ? (
            <button 
              onClick={() => router.push('/account')}
              className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-md shadow-indigo-200 active:scale-95 transition-transform"
            >
              Log In
            </button>
          ) : (
            <button 
              onClick={() => router.push('/wallet')}
              className="bg-gradient-to-r from-emerald-400 to-emerald-500 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-md shadow-emerald-200 active:scale-95 transition-transform"
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
              Welcome to 51Game! The best platform to win real money. Minimum recharge ₹100.
            </span>
          </div>
          <button className="bg-orange-100 text-orange-600 text-[10px] font-bold px-2 py-1 rounded-md flex-shrink-0">
            Detail
          </button>
        </div>

        {/* Feature Banners */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl p-3 text-white shadow-sm relative overflow-hidden h-24">
            <div className="relative z-10">
              <p className="font-bold text-sm">VIP</p>
              <p className="text-[10px] text-white/90">Exclusive Perks</p>
              <button className="mt-2 bg-white/20 text-xs px-2 py-0.5 rounded-full backdrop-blur-md">View</button>
            </div>
            <Trophy className="absolute -right-2 -bottom-2 w-16 h-16 text-white/20" />
          </div>
          <div className="bg-gradient-to-br from-pink-500 to-rose-400 rounded-2xl p-3 text-white shadow-sm relative overflow-hidden h-24">
            <div className="relative z-10">
              <p className="font-bold text-sm">First Deposit</p>
              <p className="text-[10px] text-white/90">+100% Bonus</p>
              <button className="mt-2 bg-white/20 text-xs px-2 py-0.5 rounded-full backdrop-blur-md">Claim</button>
            </div>
            <Coins className="absolute -right-1 -bottom-2 w-16 h-16 text-white/20" />
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
            <div onClick={() => handleNav('/play', { title: 'Win Go', subtitle: 'Initializing game engine...', isDark: false })} className="group cursor-pointer">
              <div className="bg-white rounded-2xl p-1 shadow-sm border border-gray-100 flex flex-col items-center justify-center h-36 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-100 to-transparent rounded-bl-full opacity-50"></div>
                <div className="absolute top-2 left-2 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm">HOT</div>
                <div className="w-16 h-16 relative mt-1 mb-2">
                  {/* Colorful mock logo for Wingo */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-green-400 via-indigo-500 to-red-500 rounded-xl shadow-inner transform rotate-3 group-active:scale-95 transition-transform flex items-center justify-center">
                     <span className="text-white font-black font-display rotate-[-3deg] text-xl drop-shadow-md">W</span>
                  </div>
                </div>
                <h3 className="font-bold text-gray-800 text-sm">Win Go</h3>
                <p className="text-[10px] text-gray-400">Guess Color/Number</p>
              </div>
            </div>

            {/* Mines Card */}
            <div className="bg-white rounded-2xl p-1 shadow-sm border border-gray-100 flex flex-col items-center justify-center h-36 relative overflow-hidden cursor-pointer active:scale-95 transition-transform" onClick={() => handleNav('/mines', { title: 'Mines', subtitle: 'Preparing minefield...', isDark: true })}>
              <div className="w-16 h-16 relative mt-1 mb-2 flex items-center justify-center bg-gradient-to-tr from-slate-700 to-slate-900 rounded-xl border-2 border-indigo-500/20 shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
                 <div className="grid grid-cols-3 gap-[2px]">
                   {[...Array(9)].map((_, i) => (
                     <div key={i} className={`w-2.5 h-2.5 rounded-sm ${i === 4 ? 'bg-indigo-500' : 'bg-slate-600'}`}></div>
                   ))}
                 </div>
              </div>
              <h3 className="font-bold text-gray-800 text-sm">Mines</h3>
              <p className="text-[10px] text-gray-400">Avoid the bombs</p>
            </div>

            {/* 5D Card */}
            <div className="bg-white rounded-2xl p-1 shadow-sm border border-gray-100 flex flex-col items-center justify-center h-36 relative opacity-80">
             <div className="w-16 h-16 relative mt-1 mb-2 flex items-center justify-center bg-gradient-to-tr from-amber-400 to-orange-500 rounded-full">
                 <span className="text-white font-bold text-2xl font-display">5D</span>
              </div>
              <h3 className="font-bold text-gray-800 text-sm">5D Premium</h3>
              <p className="text-[10px] text-gray-400">Coming Soon</p>
            </div>

             {/* Aviator Card */}
             <div className="bg-white rounded-2xl p-1 shadow-sm border border-gray-100 flex flex-col items-center justify-center h-36 relative opacity-80">
              <div className="w-16 h-16 relative mt-1 mb-2 flex items-center justify-center bg-zinc-800 rounded-xl overflow-hidden">
                <div className="w-full h-[1px] bg-red-500 absolute top-1/2 rotate-[-20deg] origin-left"></div>
                <Play className="text-red-500 fill-red-500 w-5 h-5 absolute top-1/3 right-4 rotate-[-20deg]" />
              </div>
              <h3 className="font-bold text-gray-800 text-sm">Aviator</h3>
              <p className="text-[10px] text-gray-400">Coming Soon</p>
            </div>
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
