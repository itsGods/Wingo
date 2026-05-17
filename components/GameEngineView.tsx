'use client';

import { useState, useEffect } from 'react';
import { GameInterval, GameRecord, BetOption } from '@/types/game';
import TimerSection from '@/components/TimerSection';
import BettingSection from '@/components/BettingSection';
import HistoryTable from '@/components/HistoryTable';
import BetDialog from '@/components/BetDialog';
import { useAuth } from '@/components/AuthProvider';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

export default function GameEngineView({ interval, isActive }: { interval: GameInterval, isActive: boolean }) {
  const { user, walletBalance } = useAuth();

  const [currentPeriod, setCurrentPeriod] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(Math.floor(interval * 60));
  const [records, setRecords] = useState<GameRecord[]>([]);
  const [myBets, setMyBets] = useState<any[]>([]);
  
  const [selectedBet, setSelectedBet] = useState<BetOption | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Sync locally
  useEffect(() => {
    let active = true;
    
    const syncPeriod = async () => {
      try {
        const { ensurePeriodsResolved, getPeriodData } = await import('@/lib/game-engine');
        await ensurePeriodsResolved(interval);
        
        const now = Date.now();
        const currentData = getPeriodData(interval, now);
        
        if (active && currentData) {
          setCurrentPeriod(currentData.periodId);
          const deltaSeconds = Math.floor(currentData.timeLeftMs / 1000);
          setTimeLeft(deltaSeconds);
          
          if (user) {
             import('firebase/firestore').then(async (fk) => {
               const q = fk.query(
                 fk.collection(db, `users/${user.uid}/bets`),
                 fk.where('interval', '==', interval),
                 fk.where('status', '==', 'pending')
               );
               const snap = await fk.getDocs(q);
               if (!snap.empty) {
                  const db2 = db;
                  for (let d of snap.docs) {
                    const betData = d.data();
                    const pRef = fk.doc(db2, `periods_${interval}`, betData.periodId);
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
                       
                       await fk.runTransaction(db2, async (t) => {
                          const freshBet = await t.get(d.ref);
                          if (freshBet.exists() && freshBet.data()?.status === 'pending') {
                             t.update(d.ref, { status: isWin ? 'won' : 'lost', payout });
                             if (isWin) {
                               t.update(fk.doc(db2, 'users', user.uid), { walletBalance: fk.increment(payout) });
                             }
                          }
                       });
                    }
                  }
               }
             });
          }
        }
      } catch (err) {
        console.error("Sync error encountered");
      }
    };
    
    syncPeriod();

    return () => {
      active = false;
    };
  }, [interval, user, isActive]);

  // Subscribe to past periods history
  useEffect(() => {
    const q = query(
      collection(db, `periods_${interval}`),
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
  }, [interval]);

  // Subscribe to my bets history
  useEffect(() => {
    if (!user) {
      return;
    }
    
    const q = query(
      collection(db, `users/${user.uid}/bets`),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bets: any[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.interval === interval) {
          bets.push({ id: doc.id, ...data });
        }
      });
      setMyBets(bets);
    });

    return () => unsubscribe();
  }, [user, interval]);

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
        const periodMs = interval * 60 * 1000;
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
        const sec = String(d.getUTCSeconds()).padStart(2, '0');
        const periodId = `${y}${m}${day}${h}${min}${sec}`;

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
            interval: interval,
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
        console.error("Failed to place bet");
        alert(`Bet failed: ${err.message}`);
      }
    } else {
      alert("Insufficient balance");
    }
  };

  const handleTimeUp = () => {
    const endedPeriodId = currentPeriod;
    import('@/lib/game-engine').then(async ({ ensurePeriodsResolved, getPeriodData }) => {
      await ensurePeriodsResolved(interval);
      const { periodId: pId, timeLeftMs } = getPeriodData(interval);
      setCurrentPeriod(pId);
      setTimeLeft(Math.floor(timeLeftMs / 1000));
      
      if (user && endedPeriodId) {
         const fk = await import('firebase/firestore');
         const q = fk.query(
           fk.collection(db, `users/${user.uid}/bets`),
           fk.where('interval', '==', interval),
           fk.where('periodId', '==', endedPeriodId)
         );
         const snap = await fk.getDocs(q);
        if (!snap.empty) {
            const db2 = db;
            let totalPayout = 0;
            let totalBetAmount = 0;
            let lastPeriodData: any = null;
            
            const pRef = fk.doc(db2, `periods_${interval}`, endedPeriodId);
            const pDoc = await fk.getDoc(pRef);
            if (pDoc.exists()) {
               lastPeriodData = pDoc.data();
            } else {
               return; // Period missing
            }
            
            for (let d of snap.docs) {
              const betData = d.data();
              totalBetAmount += betData.amount;
              
              if (betData.status === 'pending') {
                 let isWin = false;
                 let multiplier = 0;
                 if (typeof betData.option === 'number') { isWin = (betData.option === lastPeriodData.number); multiplier = 9; }
                 else if (betData.option === 'big' || betData.option === 'small') { isWin = (betData.option === lastPeriodData.size); multiplier = 2; }
                 else if (betData.option === 'red' || betData.option === 'green') {
                   if (lastPeriodData.color.includes(betData.option)) { isWin = true; multiplier = lastPeriodData.color.includes('violet') ? 1.5 : 2; }
                 } else if (betData.option === 'violet') { isWin = lastPeriodData.color.includes('violet'); multiplier = 4.5; }
                 
                 const payout = isWin ? betData.amount * multiplier : 0;
                 
                 await fk.runTransaction(db2, async (t) => {
                    const freshBet = await t.get(d.ref);
                    if (freshBet.exists() && freshBet.data()?.status === 'pending') {
                        t.update(d.ref, { status: isWin ? 'won' : 'lost', payout });
                        if (isWin) {
                           t.update(fk.doc(db2, 'users', user.uid), { walletBalance: fk.increment(payout) });
                        }
                    }
                 });
                 if (isWin) {
                    totalPayout += payout;
                 }
              } else if (betData.status === 'won') {
                 totalPayout += betData.payout;
              }
            }
            
            if (isActive && lastPeriodData) {
              if (totalPayout > 0) {
                 import('@/components/WinPopupManager').then(({ showWinPopup }) => {
                    showWinPopup({
                      amount: totalPayout,
                      periodId: endedPeriodId,
                      interval: interval,
                      resultColor: lastPeriodData.color,
                      resultNumber: lastPeriodData.number,
                      resultSize: lastPeriodData.size
                    });
                 });
              } else if (totalBetAmount > 0) {
                 import('@/components/LosePopupManager').then(({ showLosePopup }) => {
                    showLosePopup({
                      periodId: endedPeriodId,
                      interval: interval,
                      resultColor: lastPeriodData.color,
                      resultNumber: lastPeriodData.number,
                      resultSize: lastPeriodData.size
                    });
                 });
              }
            }
         }
      }
    });
  };

  return (
    <div style={{ display: isActive ? 'block' : 'none' }}>
      <TimerSection 
        interval={interval} 
        currentPeriod={currentPeriod}
        initialTimeLeft={timeLeft}
        onTimeUp={handleTimeUp}
        isActive={isActive}
      />

      <BettingSection onBet={handleBetClick} />
      
      <HistoryTable records={records} myBets={user ? myBets : []} />

      <BetDialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)}
        selectedBet={selectedBet}
        balance={walletBalance}
        onConfirm={confirmBet}
      />
    </div>
  );
}
