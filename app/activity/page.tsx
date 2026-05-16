'use client';

import BottomNav from '@/components/BottomNav';
import { useAuth } from '@/components/AuthProvider';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore';
import { ChevronLeft, FileText, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ActivityPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [bets, setBets] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    
    // Fetch user's bets across interval=1 for simplicity, or we can fetch all by omitting interval and needing a complex index.
    // We already query by interval previously, we need to create an index for (userId, createdAt).
    // Let's just fetch all bets of the user. We need an index on (userId, createdAt desc).
    // The blueprint suggests Bets are in a subcollection under user: /users/{userId}/bets/{betId}
    const q = query(
      collection(db, `users/${user.uid}/bets`),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const hist: any[] = [];
      snapshot.forEach((doc) => {
        hist.push({ id: doc.id, ...doc.data() });
      });
      setBets(hist);
    }, (error) => {
      console.error(error);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <main className="flex flex-col min-h-screen bg-[#F7F8FF]">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 pt-safe relative z-10 shadow-sm">
         <div className="flex items-center px-4 py-3">
          <button onClick={() => router.back()} className="p-1 -ml-1 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronLeft size={28} />
          </button>
          <h1 className="font-semibold text-lg tracking-wide text-gray-800 ml-2">My Bets</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 px-4 pt-4 relative z-0">
        
        {!user ? (
          <div className="flex flex-col items-center justify-center mt-20 text-gray-500 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
             <FileText size={48} className="text-gray-300 mb-4" />
             <p className="font-medium text-center">Please login to view your betting history.</p>
          </div>
        ) : (
          <div className="space-y-3">
             {bets.length === 0 ? (
                <div className="text-center text-gray-400 py-10 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                  <FileText size={40} className="mx-auto mb-3 opacity-20" />
                  <p>No activity found</p>
                </div>
             ) : (
               bets.map(bet => (
                 <div key={bet.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
                    {/* Status accent border */}
                    <div className={`absolute left-0 top-0 w-1 h-full ${bet.status === 'won' ? 'bg-green-500' : bet.status === 'lost' ? 'bg-red-500' : 'bg-orange-400'}`}></div>
                    
                    <div className="flex justify-between items-start mb-3 pl-1">
                      <div>
                        <div className="font-bold text-gray-800 mb-0.5">Win Go - {bet.interval} Min</div>
                        <div className="text-xs text-gray-500 font-mono tracking-tight">Period: {bet.periodId}</div>
                      </div>
                      <div className={`flex items-center gap-1 text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                        bet.status === 'won' ? 'bg-green-50 text-green-600' : 
                        bet.status === 'lost' ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-500'
                      }`}>
                         {bet.status === 'won' && <CheckCircle2 size={12} />}
                         {bet.status === 'lost' && <XCircle size={12} />}
                         {bet.status === 'pending' && <Clock size={12} />}
                         {bet.status}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 bg-gray-50 rounded-lg p-3 border border-gray-100 pl-4">
                      <div>
                        <div className="text-[10px] uppercase font-bold text-gray-400 mb-1">Selection</div>
                        <div className="font-semibold text-sm capitalize flex items-center gap-1">
                          {typeof bet.option === 'number' ? (
                             <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs ml-1">{bet.option}</span>
                          ) : bet.option}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-[10px] uppercase font-bold text-gray-400 mb-1">Amount</div>
                        <div className="font-semibold text-sm font-mono tracking-tight">₹{bet.amount}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] uppercase font-bold text-gray-400 mb-1">Return</div>
                        <div className={`font-semibold text-sm font-mono tracking-tight ${bet.status === 'won' ? 'text-green-600' : bet.status === 'lost' ? 'text-red-500' : 'text-gray-900'}`}>
                           {bet.status === 'won' ? `+₹${bet.payout.toFixed(2)}` : bet.status === 'lost' ? '₹0.00' : '--'}
                        </div>
                      </div>
                    </div>
                 </div>
               ))
             )}
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  );
}
