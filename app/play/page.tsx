'use client';

import { useState, useEffect } from 'react';
import { Speaker } from 'lucide-react';
import { cn } from '@/lib/utils';
import BottomNav from '@/components/BottomNav';
import GameHeader from '@/components/GameHeader';
import TimerSection from '@/components/TimerSection';
import BettingSection from '@/components/BettingSection';
import HistoryTable from '@/components/HistoryTable';
import BetDialog from '@/components/BetDialog';
import { useAuth } from '@/components/AuthProvider';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

import { GameInterval, GameRecord, BetOption } from '@/types/game';

export default function Home() {
  const [intervalOption, setIntervalOption] = useState<GameInterval>(1);
  const [selectedBet, setSelectedBet] = useState<BetOption | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [records, setRecords] = useState<GameRecord[]>([]);
  const [currentPeriod, setCurrentPeriod] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(60);
  
  const { user, walletBalance } = useAuth();

  // Sync locally
  useEffect(() => {
    let active = true;
    
    const syncPeriod = async () => {
      try {
        const { ensurePeriodsResolved, getPeriodData } = await import('@/lib/game-engine');
        await ensurePeriodsResolved(intervalOption);
        
        const now = Date.now();
        const currentData = getPeriodData(intervalOption, now);
        
        if (active && currentData) {
          setCurrentPeriod(currentData.periodId);
          const deltaSeconds = Math.floor(currentData.timeLeftMs / 1000);
          setTimeLeft(deltaSeconds);
          
          if (user) {
             // Resolve pending bets
             import('firebase/firestore').then(async (fk) => {
               const q = fk.query(
                 fk.collection(db, `users/${user.uid}/bets`),
                 fk.where('interval', '==', intervalOption),
                 fk.where('status', '==', 'pending')
               );
               const snap = await fk.getDocs(q);
               if (!snap.empty) {
                  const db2 = db;
                  const batch = fk.writeBatch(db2);
                  for (let d of snap.docs) {
                    const betData = d.data();
                    const pRef = fk.doc(db2, `periods_${intervalOption}`, betData.periodId);
                    const pDoc = await fk.getDoc(pRef);
                    if (pDoc.exists()) {
                       const pData = pDoc.data();
                       let isWin = false;
                       let multiplier = 0;
                       
                       if (typeof betData.option === 'number') {
                         isWin = (betData.option === pData.number);
                         multiplier = 9;
                       } else if (betData.option === 'big' || betData.option === 'small') {
                         isWin = (betData.option === pData.size);
                         multiplier = 2;
                       } else if (betData.option === 'red' || betData.option === 'green') {
                         const isSelected = pData.color.includes(betData.option);
                         if (isSelected) {
                           isWin = true;
                           multiplier = pData.color.includes('violet') ? 1.5 : 2;
                         }
                       } else if (betData.option === 'violet') {
                         isWin = pData.color.includes('violet');
                         multiplier = 4.5;
                       }
                       
                       const payout = isWin ? betData.amount * multiplier : 0;
                       batch.update(d.ref, {
                         status: isWin ? 'won' : 'lost',
                         payout
                       });
                       if (isWin) {
                         batch.update(fk.doc(db2, 'users', user.uid), {
                           walletBalance: fk.increment(payout)
                         });
                       }
                    }
                  }
                  await batch.commit();
               }
             });
          }
        }
      } catch (err) {
        console.error("Sync error", err);
      }
    };
    
    syncPeriod();

    
    // Poll the server occasionally or calculate locally.
    // Instead of polling aggressively, we will calculate locally and only poll when period ends.
    return () => {
      active = false;
    };
  }, [intervalOption, user]);

  // Subscribe to past periods history
  useEffect(() => {
    const q = query(
      collection(db, `periods_${intervalOption}`),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const hist: GameRecord[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        hist.push({
          period: doc.id,
          number: data.number,
          size: data.size,
          color: data.color
        });
      });
      setRecords(hist);
    });

    return () => unsubscribe();
  }, [intervalOption]);

  const handleBetClick = (option: BetOption) => {
    if (!user) {
      alert("Please login first to place a bet.");
      return;
    }
    setSelectedBet(option);
    setIsDialogOpen(true);
  };

  const confirmBet = async (amount: number, quantity: number) => {
    const total = amount * quantity;
    if (walletBalance >= total) {
      setIsDialogOpen(false);
      try {
        const { doc, runTransaction, serverTimestamp, collection } = await import('firebase/firestore');
        const periodMs = intervalOption * 60 * 1000;
        const nowMs = Date.now();
        const currentPeriodStart = Math.floor(nowMs / periodMs) * periodMs;
        const currentPeriodEnd = currentPeriodStart + periodMs;
        const timeLeftMs = currentPeriodEnd - nowMs;
        if (timeLeftMs < 5000) {
          alert('Period is closing');
          return;
        }

        const d = new Date(currentPeriodEnd);
        const y = d.getUTCFullYear();
        const m = String(d.getUTCMonth() + 1).padStart(2, '0');
        const day = String(d.getUTCDate()).padStart(2, '0');
        const h = String(d.getUTCHours()).padStart(2, '0');
        const min = String(d.getUTCMinutes()).padStart(2, '0');
        const periodId = `${y}${m}${day}${h}${min}00`;

        const userRef = doc(db, 'users', user!.uid);
        const betRef = doc(collection(db, `users/${user!.uid}/bets`));

        await runTransaction(db, async (t) => {
          const userDoc = await t.get(userRef);
          if (!userDoc.exists()) throw new Error("User not found");
          
          const bal = userDoc.data()?.walletBalance || 0;
          if (bal < total) throw new Error("Insufficient balance");

          t.update(userRef, { walletBalance: bal - total });

          t.set(betRef, {
            userId: user!.uid,
            interval: intervalOption,
            periodId,
            option: selectedBet,
            amount: total,
            status: 'pending',
            payout: 0,
            createdAt: serverTimestamp()
          });
        });

        alert(`Successfully placed bet on ${selectedBet} for ₹${total}`);
      } catch (err: any) {
        console.error(err);
        alert(`Bet failed: ${err.message}`);
      }
    } else {
      alert("Insufficient balance");
    }
  };

  return (
    <main className="flex flex-col min-h-screen bg-[#F7F8FF]">
      <GameHeader />
      
      <div className="flex-1 overflow-y-auto pb-24">
        {/* Marquee Announcment */}
        <div className="flex items-center bg-white px-3 py-2 text-sm text-gray-500 shadow-sm border-b border-gray-100">
          <Speaker className="w-4 h-4 text-orange-500 mr-2 flex-shrink-0" />
          <div className="overflow-hidden whitespace-nowrap overflow-ellipsis">
            <span className="animate-pulse">Welcome to 51Game! The best platform to win real money. Minimum recharge ₹100.</span>
          </div>
          <div className="flex bg-orange-100 text-orange-500 px-2 py-0.5 rounded-full text-xs font-semibold ml-2">
            Details
          </div>
        </div>

        {/* Tab Selection */}
        <div className="bg-white p-3 shadow-sm mb-4">
          <div className="grid grid-cols-4 gap-2">
            {[1, 3, 5, 10].map((min) => (
              <button
                key={min}
                onClick={() => setIntervalOption(min as GameInterval)}
                className={cn(
                  "flex flex-col items-center justify-center p-2 rounded-xl border transition-all",
                  intervalOption === min 
                    ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-transparent shadow-md transform scale-[1.02]" 
                    : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
                )}
              >
                <ClockIcon active={intervalOption === min} />
                <span className="font-semibold text-sm mt-1">Win Go</span>
                <span className="text-[10px] opacity-80">{min} Min</span>
              </button>
            ))}
          </div>
        </div>

        <TimerSection 
          key={intervalOption}
          interval={intervalOption} 
          currentPeriod={currentPeriod}
          initialTimeLeft={timeLeft}
          onTimeUp={() => {
            import('@/lib/game-engine').then(async ({ ensurePeriodsResolved, getPeriodData }) => {
              await ensurePeriodsResolved(intervalOption);
              const { periodId: pId, timeLeftMs } = getPeriodData(intervalOption);
              setCurrentPeriod(pId);
              setTimeLeft(Math.floor(timeLeftMs / 1000));
              
              if (user) {
                 const fk = await import('firebase/firestore');
                 const q = fk.query(
                   fk.collection(db, `users/${user.uid}/bets`),
                   fk.where('interval', '==', intervalOption),
                   fk.where('status', '==', 'pending')
                 );
                 const snap = await fk.getDocs(q);
                 if (!snap.empty) {
                    const db2 = db;
                    const batch = fk.writeBatch(db2);
                    for (let d of snap.docs) {
                      const betData = d.data();
                      const pRef = fk.doc(db2, `periods_${intervalOption}`, betData.periodId);
                      const pDoc = await fk.getDoc(pRef);
                      if (pDoc.exists()) {
                         const pData = pDoc.data();
                         let isWin = false;
                         let multiplier = 0;
                         if (typeof betData.option === 'number') { isWin = (betData.option === pData.number); multiplier = 9; }
                         else if (betData.option === 'big' || betData.option === 'small') { isWin = (betData.option === pData.size); multiplier = 2; }
                         else if (betData.option === 'red' || betData.option === 'green') {
                           if (pData.color.includes(betData.option)) { isWin = true; multiplier = pData.color.includes('violet') ? 1.5 : 2; }
                         } else if (betData.option === 'violet') { isWin = pData.color.includes('violet'); multiplier = 4.5; }
                         
                         const payout = isWin ? betData.amount * multiplier : 0;
                         batch.update(d.ref, { status: isWin ? 'won' : 'lost', payout });
                         if (isWin) batch.update(fk.doc(db2, 'users', user.uid), { walletBalance: fk.increment(payout) });
                      }
                    }
                    await batch.commit();
                 }
              }
            });
          }}
        />

        <BettingSection onBet={handleBetClick} />
        
        <HistoryTable records={records} />
      </div>

      <BetDialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)}
        selectedBet={selectedBet}
        balance={walletBalance}
        onConfirm={confirmBet}
      />
      <BottomNav />
    </main>
  );
}

function ClockIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn(active ? "text-white" : "text-gray-400")}>
      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}