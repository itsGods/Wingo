'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { db } from '@/lib/firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';

export default function Home() {
  const { user, walletBalance } = useAuth();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (!event.data) return;

      if (event.data.type === 'READY') {
        if (iframeRef.current && iframeRef.current.contentWindow) {
          iframeRef.current.contentWindow.postMessage({
            type: 'SET_BALANCE',
            balance: walletBalance
          }, '*');
        }
      } else if (event.data.type === 'UPDATE_WALLET') {
        if (user && event.data.delta) {
          try {
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
              walletBalance: increment(event.data.delta)
            });
          } catch(e) {
            console.error("Failed to update wallet balance:", e);
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [user, walletBalance]);

  // Send initial balance when loaded/changed externally
  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow && user) {
      iframeRef.current.contentWindow.postMessage({
        type: 'SET_BALANCE',
        balance: walletBalance
      }, '*');
    }
  }, [walletBalance, user]);

  return (
    <main className="w-full h-screen bg-[#F7F8FF]">
      <iframe 
        ref={iframeRef}
        src="/wingo_index.html" 
        className="w-full h-full border-none"
        title="Win Go"
      />
    </main>
  );
}
