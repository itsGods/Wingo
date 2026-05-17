'use client';

import { useAuth } from '@/components/AuthProvider';
import BottomNav from '@/components/BottomNav';
import { User, Mail, Settings, Shield, Bell, ChevronRight, LogOut, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AccountPage() {
  const router = useRouter();
  const { user, walletBalance, logout } = useAuth();
  
  if (!user) return null; // AuthGuard will handle this

  return (
    <main className="flex flex-col min-h-screen bg-[#F7F8FF]">
      {/* Header */}
      <div className="bg-indigo-600 text-white rounded-b-3xl shadow-md overflow-hidden relative pt-safe pb-16">
        <div className="flex items-center px-4 py-3 relative z-10">
          <button onClick={() => router.back()} className="p-1 -ml-1 text-white/90 hover:bg-white/10 rounded-full transition-colors">
            <ChevronLeft size={28} />
          </button>
          <h1 className="font-semibold text-lg tracking-wide ml-2">Account</h1>
        </div>
        
        <div className="px-6 mt-4 relative z-10 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/50 overflow-hidden flex items-center justify-center p-0.5">
            {user.photoURL ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={user.photoURL} alt="Profile" className="w-full h-full rounded-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <User size={32} />
            )}
          </div>
          <div>
            <h2 className="font-bold text-xl">{user.displayName || 'Player'}</h2>
            <p className="text-white/70 text-sm font-medium">{user.email}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 px-4 -mt-8 relative z-20">
        {/* Balance Summary */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6 flex items-center justify-between cursor-pointer active:scale-95 transition-transform" onClick={() => router.push('/wallet')}>
           <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Balance</p>
              <p className="text-2xl font-bold text-indigo-700">₹{walletBalance.toFixed(2)}</p>
           </div>
           <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
              <ChevronRight size={20} />
           </div>
        </div>

        {/* Menu options */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <MenuItem icon={<Settings size={20} />} label="Settings" />
          <MenuItem icon={<Shield size={20} />} label="Security" />
          <MenuItem icon={<Bell size={20} />} label="Notifications" />
          <MenuItem icon={<Mail size={20} />} label="Support" isLast />
        </div>

        <button 
          onClick={logout}
          className="w-full bg-white border border-red-100 text-red-500 rounded-2xl p-4 font-bold flex items-center justify-center gap-2 shadow-sm active:bg-red-50 transition-colors"
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>

      <BottomNav />
    </main>
  );
}

function MenuItem({ icon, label, isLast = false }: { icon: React.ReactNode, label: string, isLast?: boolean }) {
  return (
    <div className={`flex items-center p-4 cursor-pointer hover:bg-gray-50 transition-colors ${isLast ? '' : 'border-b border-gray-50'}`}>
      <div className="w-8 h-8 rounded-full bg-gray-50 text-gray-600 flex items-center justify-center mr-3">
        {icon}
      </div>
      <span className="font-semibold text-gray-800 flex-1">{label}</span>
      <ChevronRight size={18} className="text-gray-400" />
    </div>
  );
}
