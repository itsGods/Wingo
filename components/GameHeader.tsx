'use client';

import { ChevronLeft, Ear, RefreshCw, Wallet, User as UserIcon, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useAuth } from './AuthProvider';
import { useRouter } from 'next/navigation';

export default function GameHeader() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { user, walletBalance, logout } = useAuth();
  const router = useRouter();

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-800 text-white rounded-b-3xl shadow-md overflow-hidden relative">
      {/* Top Bar */}
      <div className="pt-safe flex items-center justify-between px-4 py-3 relative z-10">
        <button className="p-1 -ml-1 text-white/90 hover:bg-white/10 rounded-full transition-colors">
          <ChevronLeft size={28} />
        </button>
        <h1 className="font-semibold text-lg tracking-wide">51Game Wingo</h1>
        <div className="flex gap-2">
          {user ? (
            <button onClick={logout} className="p-1 hover:bg-white/20 rounded-full transition-colors" title="Logout">
              <LogOut size={20} />
            </button>
          ) : null}
        </div>
      </div>

      {/* Wallet Card */}
      <div className="px-5 pb-6 pt-2 relative z-10">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 shadow-inner">
          {user ? (
             <>
                <div className="flex items-center gap-2 text-white/80 mb-2 font-medium">
                  <Wallet size={16} />
                  <span className="text-sm">Available balance</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold tracking-tight">₹{walletBalance.toFixed(2)}</span>
                  <button 
                    onClick={handleRefresh}
                    className={cn("p-1.5 bg-white/20 hover:bg-white/30 rounded-full transition-all", isRefreshing && "animate-spin")}
                  >
                    <RefreshCw size={14} className="text-white" />
                  </button>
                </div>
                
                <div className="flex gap-3 mt-5">
                  <button className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-xl font-bold shadow-[0_4px_12px_rgba(34,197,94,0.3)] transition-transform active:scale-95 text-sm uppercase tracking-wider">
                    Deposit
                  </button>
                  <button className="flex-1 bg-white hover:bg-gray-50 text-indigo-700 py-2.5 rounded-xl font-bold shadow-[0_4px_12px_rgba(255,255,255,0.2)] transition-transform active:scale-95 text-sm uppercase tracking-wider">
                    Withdraw
                  </button>
                </div>
             </>
          ) : (
             <div className="text-center py-4">
                <p className="text-sm text-white/80 mb-4">Please log in to start playing and win real money.</p>
                <button 
                  onClick={() => router.push('/account')}
                  className="bg-white text-indigo-700 px-6 py-3 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 mx-auto active:scale-95 transition-transform"
                >
                  <UserIcon size={18} />
                  Sign In / Register
                </button>
             </div>
          )}
        </div>
      </div>
      
      {/* Decorative bg elements */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-purple-500/30 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-indigo-500/30 rounded-full blur-3xl pointer-events-none"></div>
    </div>
  );
}

