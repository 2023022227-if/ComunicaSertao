import React, { useState, useEffect } from 'react';
import {
  AlertCircle, CheckCircle, Clock,
  Check, Filter
} from 'lucide-react';
import { buscarChamados } from '../api';

export default function HistoricoNotificacoes() {
  const [notificacoes, setNotificacoes] = useState([]);
  const [apenasNaoLidas, setApenasNaoLidas] = useState(false);

  useEffect(() => {
    const carregar = async () => {
      try {
        const chamados = await buscarChamados();
        const lista = chamados.map((c, idx) => {
          const st = (c.status || '').toLowerCase();
          let icone = AlertCircle;
          let cor = 'text-yellow-600';
          let bg = 'bg-yellow-100';
          let titulo = `Novo Chamado Recebido (${c.id})`;

          if (st === 'concluído') {
            icone = CheckCircle;
            cor = 'text-green-600';
            bg = 'bg-green-100';
            titulo = `Chamado Concluído (${c.id})`;
          } else if (st === 'em andamento') {
            icone = Clock;
            cor = 'text-blue-600';
            bg = 'bg-blue-100';
            titulo = `Chamado em Atendimento (${c.id})`;
          }

          return {
            id: c.id || idx + 1,
            titulo,
            msg: `${c.autor} registrou ocorrência de ${c.titulo} em ${c.local}: "${c.descricao}".`,
            data: c.tempo,
            icone,
            cor,
            bg,
            lida: st === 'concluído'
          };
        });
        setNotificacoes(lista);
      } catch (erro) {
        console.error('Erro ao carregar histórico de notificações:', erro);
      }
    };
    carregar();
  }, []);

  const marcarTodasComoLidas = () => {
    setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })));
  };

  const marcarUmaComoLida = (id) => {
    setNotificacoes(prev => prev.map(n => n.id === id ? { ...n, lida: true } : n));
  };

  const exibidas = apenasNaoLidas ? notificacoes.filter(n => !n.lida) : notificacoes;

  return (
    <div className="p-8 max-w-5xl">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50">
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => setApenasNaoLidas(false)}
              className={`px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2 ${!apenasNaoLidas ? 'bg-white text-slate-800 font-bold' : 'bg-slate-50 text-slate-500'}`}
            >
              <Filter size={16} /> Todas ({notificacoes.length})
            </button>
            <button
              onClick={() => setApenasNaoLidas(true)}
              className={`px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium transition-colors shadow-sm ${apenasNaoLidas ? 'bg-white text-slate-800 font-bold' : 'bg-slate-50 text-slate-500'}`}
            >
              Não Lidas ({notificacoes.filter(n => !n.lida).length})
            </button>
          </div>

          <div className="flex gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={marcarTodasComoLidas}
              className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
              title="Marcar todas como lidas"
            >
              <Check size={18} />
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {exibidas.map((notif) => {
            const Icone = notif.icone;
            return (
              <div key={notif.id} className={`p-5 flex gap-4 transition-colors hover:bg-slate-50 ${!notif.lida ? 'bg-blue-50/30' : ''}`}>
                <div className="mt-1">
                  <div className={`p-2.5 rounded-full ${notif.bg} ${notif.cor}`}>
                    <Icone size={20} />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`text-sm font-bold ${!notif.lida ? 'text-slate-900' : 'text-slate-700'}`}>
                      {notif.titulo}
                    </h4>
                    <span className="text-xs text-slate-400 font-medium">{notif.data}</span>
                  </div>
                  <p className={`text-sm ${!notif.lida ? 'text-slate-700' : 'text-slate-500'}`}>
                    {notif.msg}
                  </p>

                  {!notif.lida && (
                    <div className="mt-3 flex gap-3">
                      <button
                        onClick={() => marcarUmaComoLida(notif.id)}
                        className="text-xs font-medium text-blue-600 hover:underline"
                      >
                        Marcar como lida
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}