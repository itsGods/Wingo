'use client';

import { useAuth } from '@/components/AuthProvider';
import BottomNav from '@/components/BottomNav';
import { CreditCard, ArrowUpCircle, ArrowDownCircle, History, Wallet as WalletIcon, ChevronLeft, Building } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

export default function WalletPage() {
  const router = useRouter();
  const { user, walletBalance } = useAuth();
  const [amount, setAmount] = useState<string>('500');
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    
    const q = query(
      collection(db, `users/${user.uid}/transactions`),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const hist: any[] = [];
      snapshot.forEach((doc) => {
        hist.push({ id: doc.id, ...doc.data() });
      });
      setTransactions(hist);
    });

    return () => unsubscribe();
  }, [user]);

  const handleTransaction = async (action: 'deposit' | 'withdraw') => {
    if (!user) {
      alert('You must log in first.');
      return;
    }
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      alert('Enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action, amount: val })
      });
      const data = await res.json();
      if (data.success) {
        alert(`${action === 'deposit' ? 'Deposit' : 'Withdrawal'} successful!`);
        setAmount('500');
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred');
    }
    setLoading(false);
  };

  if (!user) {
    return (
      <main className="flex flex-col min-h-screen bg-[#F7F8FF]">
        <div className="bg-indigo-600 text-white p-4 text-center font-bold">Wallet</div>
        <div className="flex-1 flex items-center justify-center mt-20">
          <p className="text-gray-500">Please log in to manage your wallet.</p>
        </div>
        <BottomNav />
      </main>
    );
  }

  return (
    <main className="flex flex-col min-h-screen bg-[#F7F8FF]">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-800 text-white rounded-b-3xl shadow-md overflow-hidden relative pt-safe pb-8">
        <div className="flex items-center px-4 py-3 relative z-10">
          <button onClick={() => router.back()} className="p-1 -ml-1 text-white/90 hover:bg-white/10 rounded-full transition-colors">
            <ChevronLeft size={28} />
          </button>
          <h1 className="font-semibold text-lg tracking-wide ml-2">My Wallet</h1>
        </div>
        
        <div className="px-6 mt-4 relative z-10 text-center">
          <div className="text-white/80 font-medium mb-1">Total Balance</div>
          <div className="text-4xl font-bold tracking-tight">₹{walletBalance.toFixed(2)}</div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-purple-500/30 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 px-4 -mt-4 relative z-20">
        
        {/* Actions Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
          <div className="mb-4">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Amount (₹)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 font-bold text-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                placeholder="Enter amount" 
              />
            </div>
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1 no-scrollbar">
               {[100, 500, 1000, 5000].map(v => (
                 <button key={v} onClick={() => setAmount(v.toString())} className="px-4 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-sm font-medium text-gray-600 whitespace-nowrap hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors">
                   ₹{v}
                 </button>
               ))}
            </div>
          </div>
          
          <div className="flex gap-3">
            <button 
              disabled={loading}
              onClick={() => handleTransaction('deposit')}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3.5 rounded-xl font-bold shadow-[0_4px_12px_rgba(34,197,94,0.3)] transition-transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <ArrowDownCircle size={18} />
              DEPOSIT
            </button>
            <button 
              disabled={loading}
              onClick={() => handleTransaction('withdraw')}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-bold shadow-[0_4px_12px_rgba(79,70,229,0.3)] transition-transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <ArrowUpCircle size={18} />
              WITHDRAW
            </button>
          </div>
        </div>

        {/* History */}
        <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2 px-1">
          <History size={18} className="text-gray-500" />
          Transaction History
        </h2>
        
        <div className="space-y-3">
          {transactions.length === 0 ? (
            <div className="bg-white p-6 rounded-2xl text-center text-gray-400 text-sm border border-gray-100">
              No transactions yet
            </div>
          ) : (
            transactions.map(tx => (
              <div key={tx.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className={`p-2 rounded-lg ${tx.type === 'deposit' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                      {tx.type === 'deposit' ? <ArrowDownCircle size={20} /> : <ArrowUpCircle size={20} />}
                   </div>
                   <div>
                     <p className="font-bold text-gray-800 capitalize">{tx.type}</p>
                     <p className="text-xs text-gray-500">
                        {tx.createdAt ? new Date(tx.createdAt.toMillis()).toLocaleString() : 'Just now'}
                     </p>
                   </div>
                </div>
                <div className={`font-bold text-lg ${tx.type === 'deposit' ? 'text-green-600' : 'text-gray-800'}`}>
                   {tx.type === 'deposit' ? '+' : '-'}₹{tx.amount.toFixed(2)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <BottomNav />
    </main>
  );
}
