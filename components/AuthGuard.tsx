'use client';

import { useState } from 'react';
import { useAuth } from './AuthProvider';
import { Mail, Lock, User, Phone, Eye, EyeOff } from 'lucide-react';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, login, register } = useAuth();
  
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [isHandling, setIsHandling] = useState(false);
  const [showPass, setShowPass] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (user) {
    return <>{children}</>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsHandling(true);
    
    try {
      if (isLogin) {
        await login(email, pass);
      } else {
        if (!name || !phone || !email || !pass) {
          throw new Error('All fields are required');
        }
        await register(email, pass, name, phone);
      }
    } catch (err: any) {
      setError(err.message.replace('Firebase: ', '').replace('Error (auth/', '').replace(').', ''));
    } finally {
      setIsHandling(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-6">
      <div className="w-full max-w-sm mx-auto">
        <div className="text-center mb-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-4">
            <span className="text-white font-display font-bold text-2xl">51</span>
          </div>
          <h2 className="text-2xl font-bold font-display text-gray-900">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            {isLogin ? 'Sign in to continue playing' : 'Join the premier prediction game'}
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.05)] border border-gray-100 p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-500">
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-xl text-sm mb-6 border border-red-100 text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <User size={18} />
                    </div>
                    <input
                      type="text"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-gray-800 font-medium"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Mobile Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Phone size={18} />
                    </div>
                    <input
                      type="tel"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-gray-800 font-medium"
                      placeholder="+91 9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-gray-800 font-medium"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock size={18} />
                </div>
                <input
                  type={showPass ? 'text' : 'password'}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-gray-800 font-medium"
                  placeholder="••••••••"
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPass(!showPass)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isHandling}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl py-3.5 shadow-[0_8px_20px_rgba(79,70,229,0.3)] hover:shadow-[0_8px_25px_rgba(79,70,229,0.4)] active:scale-[0.98] transition-all disabled:opacity-70 disabled:pointer-events-none mt-2 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isHandling && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                {isLogin ? 'Sign In' : 'Create Account'}
              </span>
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
