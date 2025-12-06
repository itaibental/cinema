import React from 'react';
import { Film, Clapperboard } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="w-full py-6 px-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-500 rounded-lg text-slate-900">
            <Clapperboard size={28} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">CinemAI</h1>
            <p className="text-xs text-slate-400 font-medium tracking-wide">ניתוח מבע קולנועי חכם</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-slate-500 text-sm">
          <Film size={16} />
          <span>מופעל ע"י Gemini 2.5</span>
        </div>
      </div>
    </header>
  );
};

export default Header;