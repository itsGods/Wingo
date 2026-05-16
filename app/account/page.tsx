'use client';

import { useAuth } from '@/components/AuthProvider';
import BottomNav from '@/components/BottomNav';
import { User, Mail, Settings, Shield, Bell, ChevronRight, LogOut, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AccountPage() {
  const router = useRouter();
  const { user, walletBalance, logout, login, register } = useAuth();
  
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter email and password');
      return;
    }
    
    setErrorMsg('');
    setIsLoading(true);
    
    try {
      if (isLoginMode) {
        await login(email, password);
      } else {
        await register(email, password);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

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
        
        {user && (
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
        )}
      </div>

      <div className="flex-1 overflow-y-auto pb-24 px-4 -mt-8 relative z-20">
        
        {!user ? (
          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.05)] border border-gray-100 p-6">
            <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-500 mx-auto flex items-center justify-center mb-4">
               <User size={32} />
            </div>
            <h2 className="font-bold text-xl mb-2 text-gray-800 text-center">
              {isLoginMode ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-gray-500 text-sm mb-6 text-center">
              {isLoginMode ? 'Login to manage your profile and wallet.' : 'Register to start betting and winning.'}
            </p>
            
            {errorMsg && (
              <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm mb-4 border border-red-100">
                {errorMsg}
              </div>
            )}
            
            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  placeholder="Enter email" 
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  placeholder="Enter password" 
                />
              </div>
              
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold shadow-[0_4px_12px_rgba(79,70,229,0.3)] active:scale-95 transition-transform disabled:opacity-50 mt-2"
              >
                {isLoading ? 'Processing...' : (isLoginMode ? 'Login' : 'Sign Up')}
              </button>
            </form>
            
            <div className="mt-6 text-center text-sm">
              <span className="text-gray-500">
                {isLoginMode ? "Don't have an account? " : "Already have an account? "}
              </span>
              <button 
                onClick={() => setIsLoginMode(!isLoginMode)}
                className="text-indigo-600 font-bold hover:underline"
              >
                {isLoginMode ? 'Register' : 'Login'}
              </button>
            </div>
          </div>
        ) : (
          <>
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
          </>
        )}
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
