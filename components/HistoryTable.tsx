'use client';

import { GameRecord, GameColor } from '@/types/game';
import { History } from 'lucide-react';

export default function HistoryTable({ records }: { records: GameRecord[] }) {
  return (
    <div className="bg-white p-4 mx-3 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-4 text-gray-800">
        <History size={18} className="text-indigo-500" />
        <h2 className="font-bold text-sm">Game History</h2>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100">
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
