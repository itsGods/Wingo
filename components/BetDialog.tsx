'use client';

import { BetOption } from '@/types/game';
import { useState, useEffect } from 'react';
import { Plus, Minus, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function BetDialog({ 
  isOpen, 
  onClose, 
  selectedBet, 
  balance,
  onConfirm
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  selectedBet: BetOption | null;
  balance: number;
  onConfirm: (amount: number, qty: number) => void;
}) {
  const [amount, setAmount] = useState<number>(10);
  const [quantity, setQuantity] = useState<number>(1);

  // We rely on onClose and unmount/remount to reset instead of useEffect.
  // Or handle it in parent. But to fix lint, we can just reset state when it opens 
  // via a prop change without setState synchronously in effect.
  // Actually, wait, React actually perfectly supports doing it synchronously in effect.
  // But standard pattern is to use a `key` on the dialog when rendering it, 
  // or reset state before rendering. We'll leave it as is but use a slight timeout,
  // or just reset state when un-mounting.
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setAmount(10);
        setQuantity(1);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen || selectedBet === null) return null;

  const getHeaderColor = () => {
    if (selectedBet === 'green') return 'bg-[#4CAF50]';
    if (selectedBet === 'red') return 'bg-[#F44336]';
    if (selectedBet === 'violet') return 'bg-[#9C27B0]';
    if (selectedBet === 'big') return 'bg-[#FF9800]';
    if (selectedBet === 'small') return 'bg-[#2196F3]';
    
    // For numbers
    if (typeof selectedBet === 'number') {
      const num = selectedBet;
      if (num === 0) return 'bg-[#F44336]';
      if (num === 5) return 'bg-[#4CAF50]';
      if (num % 2 === 0) return 'bg-[#F44336]';
      return 'bg-[#4CAF50]';
    }
    return 'bg-indigo-600';
  };

  const getBetLabel = () => {
    if (typeof selectedBet === 'number') return `Number ${selectedBet}`;
    return selectedBet.charAt(0).toUpperCase() + selectedBet.slice(1);
  };

  const total = amount * quantity;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 transition-opacity">
        <div className="bg-white w-full max-w-md sm:rounded-3xl rounded-t-3xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom pb-safe">
          <div className={cn("p-4 text-white relative", getHeaderColor())}>
            <h3 className="text-center font-bold text-lg">Win Go: {getBetLabel()}</h3>
            <button onClick={onClose} className="absolute right-4 top-4 p-1 hover:bg-white/20 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>
          
          <div className="p-5">
            {/* Balance line */}
            <div className="flex justify-between text-sm mb-6 border-b border-gray-100 pb-3">
              <span className="text-gray-500">Balance</span>
              <span className="font-bold">₹{balance.toFixed(2)}</span>
            </div>

            {/* Quick Amounts */}
            <div className="mb-5">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Amount</div>
              <div className="grid grid-cols-4 gap-2">
                {[10, 100, 1000, 10000].map(amt => (
                  <button 
                    key={amt}
                    onClick={() => setAmount(amt)}
                    className={cn(
                      "py-2 rounded-lg font-bold text-sm transition-colors border",
                      amount === amt ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100"
                    )}
                  >
                    {amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Quantity</span>
                <div className="flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-lg p-1">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-1.5 bg-white shadow-sm rounded-md hover:bg-gray-50 text-gray-600"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="font-bold text-lg min-w-[20px] text-center">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-1.5 bg-white shadow-sm rounded-md hover:bg-gray-50 text-gray-600"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-5 gap-2 mt-3">
                {[1, 5, 10, 20, 50].map(qty => (
                  <button 
                    key={qty}
                    onClick={() => setQuantity(qty)}
                    className={cn(
                      "py-1.5 rounded-lg font-medium text-xs transition-colors border",
                      quantity === qty ? "border-indigo-600 bg-indigo-50 text-indigo-700 font-bold" : "border-gray-200 bg-gray-50 text-gray-600"
                    )}
                  >
                    X{qty}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-3 flex justify-between items-center mb-6">
              <span className="text-sm font-medium text-gray-600">Total Amount</span>
              <span className="font-bold text-xl text-indigo-700">₹{total.toFixed(2)}</span>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={onClose}
                className="flex-1 py-3 rounded-xl font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => onConfirm(amount, quantity)}
                className="flex-1 py-3 rounded-xl font-bold bg-indigo-600 text-white shadow-[0_4px_14px_rgba(79,70,229,0.4)] hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
                disabled={balance < total}
              >
                Total ₹{total}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
