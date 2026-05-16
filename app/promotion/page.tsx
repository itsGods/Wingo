'use client';

import BottomNav from '@/components/BottomNav';
import { Gift, Share2, Copy, Users, TrendingUp, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PromotionPage() {
  const router = useRouter();

  return (
    <main className="flex flex-col min-h-screen bg-[#F7F8FF]">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white pt-safe pb-16 relative rounded-b-[40px] shadow-lg">
         <div className="flex items-center px-4 py-3 relative z-10 border-b border-white/10">
          <button onClick={() => router.back()} className="p-1 -ml-1 text-white/90 hover:bg-white/20 rounded-full transition-colors">
            <ChevronLeft size={28} />
          </button>
          <h1 className="font-semibold text-lg tracking-wide ml-2">Promotion</h1>
        </div>
        <div className="relative z-10 px-6 mt-6 text-center">
           <Gift size={48} className="mx-auto mb-3 text-yellow-300 drop-shadow-md" />
           <h2 className="text-2xl font-bold mb-1">Invite & Earn</h2>
           <p className="text-white/80 text-sm">Earn commissions on every friend&apos;s bet!</p>
        </div>
        
        {/* Decorative */}
        <div className="absolute top-1/2 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute top-1/4 right-0 w-40 h-40 bg-yellow-400/20 rounded-full blur-3xl"></div>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 px-4 -mt-8 relative z-20">
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6 text-center">
           <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Total Commission</div>
           <div className="text-3xl font-bold text-orange-500 mb-4">₹0.00</div>
           
           <div className="flex gap-4 p-4 bg-orange-50 rounded-xl border border-orange-100">
              <div className="flex-1 border-r border-orange-200">
                <div className="text-orange-900 font-bold text-lg">0</div>
                <div className="text-orange-600/70 text-xs font-semibold">Direct Subords</div>
              </div>
              <div className="flex-1">
                <div className="text-orange-900 font-bold text-lg">0</div>
                <div className="text-orange-600/70 text-xs font-semibold">Team Subords</div>
              </div>
           </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
           <h3 className="font-bold text-gray-800 mb-4">My Invitation Code</h3>
           
           <div className="flex items-center gap-3 mb-4">
             <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 font-mono font-bold text-gray-700 tracking-widest text-lg text-center">
               8X9D2F1
             </div>
             <button className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center hover:bg-orange-200 transition-colors">
               <Copy size={20} />
             </button>
           </div>
           
           <button className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-3.5 rounded-xl shadow-[0_4px_12px_rgba(249,115,22,0.3)] flex items-center justify-center gap-2 active:scale-95 transition-transform">
             <Share2 size={18} />
             Share Invitation Link
           </button>
        </div>

      </div>

      <BottomNav />
    </main>
  );
}
