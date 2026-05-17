'use client';

import { useState } from 'react';
import { GameRecord, GameColor } from '@/types/game';
import { History, ListOrdered } from 'lucide-react';

export default function HistoryTable({ records, myBets = [] }: { records: GameRecord[], myBets?: any[] }) {
  const [tab, setTab] = useState<'history' | 'myBets'>('history');

  return (
    <div className="bg-white p-4 mx-3 rounded-2xl shadow-sm border border-gray-100 mt-4">
      <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
        <button 
          onClick={() => setTab('history')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded text-sm font-medium transition-all ${
            tab === 'history' 
              ? 'bg-white text-indigo-600 shadow-sm' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <History size={16} /> Game History
        </button>
        <button 
          onClick={() => setTab('myBets')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded text-sm font-medium transition-all ${
            tab === 'myBets' 
              ? 'bg-white text-indigo-600 shadow-sm' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <ListOrdered size={16} /> My Bets
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100">
        {tab === 'history' ? (
          <table className="w-full text-sm text-center">
            <thead className="bg-gray-50 text-gray-500 font-semibold text-xs border-b border-gray-100">
              <tr>
                <th className="py-3 px-2 font-medium w-1/3">Period</th>
                <th className="py-3 px-2 font-medium">Number</th>
                <th className="py-3 px-2 font-medium">Size</th>
                <th className="py-3 px-2 font-medium">Color</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-gray-700">
              {records.map((record, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-2 font-mono text-xs">{record.period}</td>
                  <td className="py-3 px-2">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-white font-bold font-display text-xs ${getNumberBg(record.color)}`}>
                      {record.number}
                    </span>
                  </td>
                  <td className="py-3 px-2 font-medium capitalize text-xs">{record.size}</td>
                  <td className="py-3 px-2">
                    <div className="flex justify-center gap-1">
                      {record.color.map((c, j) => (
                        <span key={j} className={`w-3 h-3 rounded-full ${getColorBg(c)} border border-black/5`}></span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="max-h-[400px] overflow-y-auto">
            {myBets.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">No bets found for this game</div>
            ) : (
              <table className="w-full text-sm text-center">
                <thead className="bg-gray-50 text-gray-500 font-semibold text-xs border-b border-gray-100 sticky top-0">
                  <tr>
                    <th className="py-3 px-2 font-medium w-[80px]">Period</th>
                    <th className="py-3 px-2 font-medium">Select</th>
                    <th className="py-3 px-2 font-medium">Amount</th>
                    <th className="py-3 px-2 font-medium">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-gray-700">
                  {myBets.map((bet, i) => (
                    <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-2 font-mono text-[10px] sm:text-xs text-gray-500">{bet.periodId}</td>
                      <td className="py-3 px-2">
                        <span className={`px-1.5 py-0.5 rounded capitalize text-xs text-white font-bold inline-block
                          ${bet.option === 'red' ? 'bg-[#F44336]' : 
                            bet.option === 'green' ? 'bg-[#4CAF50]' : 
                            bet.option === 'violet' ? 'bg-[#9C27B0]' : 
                            typeof bet.option === 'number' ? 'bg-indigo-500' : 'bg-orange-500'}`}
                        >
                          {bet.option}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-xs font-semibold text-gray-600">₹{bet.amount}</td>
                      <td className="py-3 px-2 font-medium text-xs">
                        {bet.status === 'pending' ? (
                          <span className="text-orange-500 bg-orange-50 px-2 py-0.5 rounded">Pending</span>
                        ) : bet.status === 'won' ? (
                          <div className="flex flex-col items-center leading-tight">
                            <span className="text-green-600 font-bold text-sm">+₹{bet.payout}</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center leading-tight">
                            <span className="text-red-500 font-bold text-sm">-₹{bet.amount}</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function getNumberBg(colors: GameColor[]) {
  if (colors.length > 1) {
    if (colors.includes('red') && colors.includes('violet')) return 'bg-gradient-to-br from-[#F44336] 50% to-[#9C27B0] 50%';
    if (colors.includes('green') && colors.includes('violet')) return 'bg-gradient-to-br from-[#4CAF50] 50% to-[#9C27B0] 50%';
  }
  if (colors.includes('red')) return 'bg-[#F44336]';
  if (colors.includes('green')) return 'bg-[#4CAF50]';
  if (colors.includes('violet')) return 'bg-[#9C27B0]';
  return 'bg-gray-500';
}

function getColorBg(color: GameColor) {
  switch (color) {
    case 'red': return 'bg-[#F44336]';
    case 'green': return 'bg-[#4CAF50]';
    case 'violet': return 'bg-[#9C27B0]';
  }
}
