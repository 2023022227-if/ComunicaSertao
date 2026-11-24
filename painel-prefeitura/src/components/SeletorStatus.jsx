import React, { useState } from 'react';
import { AlertCircle, Clock, Check, X } from 'lucide-react';

export default function SeletorStatus({ onChange, mostrarRotulo = true }) {
  const [aberto, setAberto] = useState(false);

  const escolher = (status) => {
    if (typeof onChange === 'function') onChange(status);
    setAberto(false);
  };

  return (
    <div className="relative flex flex-col items-center justify-center">
      {aberto && (
        <div className="fixed inset-0 z-20" onClick={() => setAberto(false)} />
      )}

      {mostrarRotulo && (
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
          Alterar status
        </span>
      )}

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
            Alterar status para:
          </p>

          <button
            type="button"
            onClick={() => escolher('Pendente')}
            className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
          >
            <AlertCircle size={14} />
            <span>Pendente</span>
          </button>

          <button
            type="button"
            onClick={() => escolher('Em andamento')}
            className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Clock size={14} />
            <span>Em Andamento</span>
          </button>

          <button
            type="button"
            onClick={() => escolher('Concluído')}
            className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-green-600 hover:bg-green-50 transition-colors cursor-pointer"
          >
            <Check size={14} />
            <span>Concluído</span>
          </button>

          <div className="h-px bg-slate-100 my-1 mx-2" />

          <button
            type="button"
            onClick={() => escolher('Cancelado')}
            className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <X size={14} />
            <span>Cancelado</span>
          </button>
        </div>
      )}
    </div>
  );
}