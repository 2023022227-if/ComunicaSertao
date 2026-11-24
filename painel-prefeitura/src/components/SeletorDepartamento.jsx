import React, { useState } from 'react';
import { Building2, Check } from 'lucide-react';

export default function SeletorDepartamento({ secretarias = [], atual, onChange }) {
  const [aberto, setAberto] = useState(false);

  const ativas = secretarias.filter((s) => s.status === 'Ativo');

  const escolher = (secretaria) => {
    if (secretaria.nome === atual) return;
    if (typeof onChange === 'function') onChange(secretaria);
    setAberto(false);
  };

  return (
    <div className="relative flex flex-col items-end">
      {aberto && (
        <div className="fixed inset-0 z-20" onClick={() => setAberto(false)} />
      )}

      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
        Encaminhar para
      </span>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setAberto(!aberto);
        }}
        className="relative z-30 px-3 py-1.5 rounded-lg text-xs font-bold border border-[#2563eb] bg-[#2563eb] hover:bg-[#1d4ed8] hover:border-[#1d4ed8] text-white shadow-sm transition-all cursor-pointer"
      >
        Selecionar departamento ▾
      </button>

      {aberto && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 text-left max-h-64 overflow-y-auto">
          <p className="px-4 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Encaminhar para:
          </p>

          {ativas.length === 0 && (
            <p className="px-4 py-2 text-xs text-slate-500">
              Nenhuma secretaria ativa cadastrada.
            </p>
          )}

          {ativas.map((sec) => {
            const ehAtual = sec.nome === atual;
            return (
              <button
                key={sec.id}
                type="button"
                disabled={ehAtual}
                onClick={() => escolher(sec)}
                className={`w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold transition-colors ${
                  ehAtual
                    ? 'text-slate-400 cursor-default bg-slate-50'
                    : 'text-slate-700 hover:bg-slate-50 cursor-pointer'
                }`}
              >
                <Building2 size={14} className="shrink-0" />
                <span className="flex-1 text-left">{sec.nome}</span>
                {ehAtual && <Check size={14} className="shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}