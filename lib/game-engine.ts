import { db } from './firebase';
import { collection, doc, getDoc, setDoc, query, where, getDocs, writeBatch, increment, serverTimestamp } from 'firebase/firestore';

export const getPeriodData = (intervalMinutes: number, nowMs: number = Date.now()) => {
  const periodMs = intervalMinutes * 60 * 1000;
  const currentPeriodStart = Math.floor(nowMs / periodMs) * periodMs;
  const currentPeriodEnd = currentPeriodStart + periodMs;
  
  const d = new Date(currentPeriodEnd);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  const h = String(d.getUTCHours()).padStart(2, '0');
  const min = String(d.getUTCMinutes()).padStart(2, '0');
  const sec = String(d.getUTCSeconds()).padStart(2, '0');
  const periodId = `${y}${m}${day}${h}${min}${sec}`;
  const timeLeftMs = currentPeriodEnd - nowMs;
  
  return { periodId, currentPeriodStart, currentPeriodEnd, timeLeftMs };
};

const getRandomResult = (periodId: string) => {
  const number = Math.floor(Math.random() * 10);
  const size = number >= 5 ? 'big' : 'small';
  const color: string[] = [];
  if (number === 0) color.push('red', 'violet');
  else if (number === 5) color.push('green', 'violet');
  else if (number % 2 === 0) color.push('red');
  else color.push('green');

  return { number, size, color };
};

export const ensurePeriodsResolved = async (intervalMinutes: number) => {
  const now = Date.now();
  const { periodId: currentPeriodId, currentPeriodStart } = getPeriodData(intervalMinutes, now);

  const lastPeriodD = new Date(currentPeriodStart);
  const y = lastPeriodD.getUTCFullYear();
  const m = String(lastPeriodD.getUTCMonth() + 1).padStart(2, '0');
  const day = String(lastPeriodD.getUTCDate()).padStart(2, '0');
  const h = String(lastPeriodD.getUTCHours()).padStart(2, '0');
  const min = String(lastPeriodD.getUTCMinutes()).padStart(2, '0');
  const sec = String(lastPeriodD.getUTCSeconds()).padStart(2, '0');
  const lastPeriodId = `${y}${m}${day}${h}${min}${sec}`;

  const periodRef = doc(db, `periods_${intervalMinutes}`, lastPeriodId);

  try {
    const pDoc = await getDoc(periodRef);
    if (!pDoc.exists()) {
      const result = getRandomResult(lastPeriodId);
      await setDoc(periodRef, {
        ...result,
        status: 'closed',
        createdAt: serverTimestamp(),
        interval: intervalMinutes
      });
    }
  } catch (err) {
    console.error('Error resolving period:', err);
  }
};
