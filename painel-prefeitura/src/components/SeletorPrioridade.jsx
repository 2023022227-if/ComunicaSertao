import React, { useState } from 'react';
import { ArrowUp, Minus, ArrowDown } from 'lucide-react';

export default function SeletorPrioridade({ onChange }) {
  const [aberto, setAberto] = useState(false);

  const escolher = (prioridade) => {
    if (typeof onChange === 'function') onChange(prioridade);
    setAberto(false);
  };

  return (
    <div className="relative flex flex-col items-center justify-center">
      {aberto && (
        <div className="fixed inset-0 z-20" onClick={() => setAberto(false)} />
      )}

      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
        Alterar prioridade
      </span>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setAberto(!aberto);
        }}
        className={`relative z-30 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
          aberto
            ? 'bg-[#4b5e28] text-white border-[#4b5e28] shadow-sm'
            : 'bg-white text-slate-700 border-slate-300 hover:border-[#4b5e28] hover:text-[#4b5e28]'
        }`}
      >
        Selecionar ▾
      </button>

      {aberto && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 text-left">
          <p className="px-4 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Alterar prioridade para:
          </p>

          <button
            type="button"
            onClick={() => escolher('BAIXA')}
            className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-green-600 hover:bg-green-50 transition-colors cursor-pointer"
          >
            <ArrowDown size={14} />
            <span>Baixa</span>
          </button>

          <button
            type="button"
            onClick={() => escolher('MÉDIA')}
            className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-yellow-600 hover:bg-yellow-50 transition-colors cursor-pointer"
          >
            <Minus size={14} />
            <span>Média</span>
          </button>

          <button
            type="button"
            onClick={() => escolher('ALTA')}
            className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <ArrowUp size={14} />
            <span>Alta</span>
          </button>
        </div>
      )}
    </div>
  );
}