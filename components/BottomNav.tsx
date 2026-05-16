'use client';

import { Home, Grid, PlusSquare, Wallet, UserCircle } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();
  
  return (
    <div className="fixed bottom-0 w-full max-w-md bg-white border-t border-gray-200 flex justify-between px-2 pb-safe pt-1 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <NavItem href="/" icon={<Home size={22} />} label="Home" active={pathname === '/'} />
      <NavItem href="/activity" icon={<Grid size={22} />} label="Activity" active={pathname === '/activity'} />
      <div className="relative -top-5 flex flex-col items-center z-10">
        <Link href="/promotion" className="w-14 h-14 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/40 text-white cursor-pointer active:scale-95 transition-transform border-[4px] border-[#F7F8FF]">
          <PlusSquare size={24} />
        </Link>
        <span className="text-[10px] text-gray-500 mt-1 font-medium">Promotion</span>
      </div>
      <NavItem href="/wallet" icon={<Wallet size={22} />} label="Wallet" active={pathname === '/wallet'} />
      <NavItem href="/account" icon={<UserCircle size={22} />} label="Account" active={pathname === '/account'} />
    </div>
  );
}

function NavItem({ href, icon, label, active = false }: { href: string, icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <Link href={href} className={`flex flex-col items-center justify-center p-2 min-w-[64px] transition-colors relative z-10 ${active ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}>
      <div className={`${active ? 'animate-bounce-small' : ''}`}>
        {icon}
      </div>
      <span className={`text-[10px] mt-1 font-medium ${active ? 'font-bold text-indigo-700' : ''}`}>{label}</span>
    </Link>
  );
}
