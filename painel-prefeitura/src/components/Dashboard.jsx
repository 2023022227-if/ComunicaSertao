import React, { useState } from 'react';
import { Ticket, Disc, Check, ArrowUpRight, ArrowRight } from 'lucide-react';

export default function Dashboard({ chamados = [], onSelectChamado, setActivePage }) {
  const [periodo, setPeriodo] = useState('Jan - Jul, 2026');
  const [statusHover, setStatusHover] = useState(null);

  const categorias = [
    { nome: 'Iluminação', largura: '88%', total: 412 },
    { nome: 'Pavimentação', largura: '74%', total: 348 },
    { nome: 'Limpeza Urbana', largura: '58%', total: 275 },
    { nome: 'Água e Esgoto', largura: '45%', total: 210 },
    { nome: 'Saúde / Transporte', largura: '32%', total: 154 },
  ];

  const statusData = [
    { nome: 'Concluídos',   valor: 1104, cor: '#16a34a', dot: 'bg-[#16a34a]' },
    { nome: 'Em Andamento', valor: 253,  cor: '#1e3a8a', dot: 'bg-[#1e3a8a]' },
    { nome: 'Pendentes',    valor: 187,  cor: '#f59e0b', dot: 'bg-amber-500' },
    { nome: 'Cancelados',   valor: 42,   cor: '#ef4444', dot: 'bg-red-500' },
  ];
  const totalStatus = statusData.reduce((s, i) => s + i.valor, 0);
  const RAIO = 42;
  const CIRC = 2 * Math.PI * RAIO;
  const irParaKanban = () => setActivePage && setActivePage('kanban');

  const chamadosRecentesPadrao = [
    {
      id: 'CH-2847',
      solicitante: 'Maria Aparecida S.',
      resumo: 'Iluminação Pública - Centro',
      status: 'PENDENTE',
      data: '28/07/2026'
    },
    {
      id: 'CH-2846',
      solicitante: 'Carlos Eduardo M.',
      resumo: 'Pavimentação - São José',
      status: 'EM ANDAMENTO',
      data: '28/07/2026'
    },
    {
      id: 'CH-2845',
      solicitante: 'Ana Lúcia Ferreira',
      resumo: 'Limpeza Urbana - Vila Nova',
      status: 'CONCLUÍDO',
      data: '27/07/2026'
    },
    {
      id: 'CH-2844',
      solicitante: 'Roberto Nascimento',
      resumo: 'Água e Saneamento - Centro',
      status: 'CONCLUÍDO',
      data: '27/07/2026'
    }
  ];

  const listaRecentes = chamados && chamados.length > 0
    ? chamados.slice(0, 4).map((c, i) => ({
        id: c.id || `CH-284${7 - i}`,
        solicitante: c.solicitante || c.cidadao || 'Maria Aparecida S.',
        resumo: `${c.categoria || 'Iluminação Pública'} - ${c.bairro || 'Centro'}`,
        status: (c.status || 'PENDENTE').toUpperCase(),
        data: c.data || '28/07/2026',
        original: c
      }))
    : chamadosRecentesPadrao;

  const renderBadge = (status) => {
    if (status === 'CONCLUÍDO' || status === 'CONCLUIDO') {
      return (
        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-green-50 text-green-700 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span> CONCLUÍDO
        </span>
      );
    }
    if (status === 'EM ANDAMENTO') {
      return (
        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span> EM ANDAMENTO
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> PENDENTE
      </span>
    );
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen space-y-6">

      {/* ======================================================= */}
      {/* 1. CARTÕES DE INDICADORES NO TOPO                       */}
      {/* ======================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Total de Chamados */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm relative overflow-hidden flex flex-col justify-between">
  <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
    <span>Total de Chamados</span>
    <Ticket size={16} className="text-[#16a34a]" />
  </div>
  <div>
    <h2 className="text-3xl font-extrabold text-slate-900">1.586</h2>
    <p className="text-xs text-slate-400 mt-1 font-medium">+14% este mês</p>
  </div>
  <div className="h-1 bg-[#f8e000] rounded-full mt-5"></div>
</div>

        {/* Em Andamento */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            <span>Em Andamento</span>
            <Disc size={16} className="text-[#1e3a8a]" />
          </div>
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900">253</h2>
            <p className="text-xs text-slate-400 mt-1 font-medium">16% do total</p>
          </div>
          <div className="h-1 bg-[#1e3a8a] rounded-full mt-5"></div>
        </div>

        {/* Concluídos */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            <span>Concluídos</span>
            <Check size={16} className="text-[#16a34a]" />
          </div>
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900">1.104</h2>
            <p className="text-xs text-slate-400 mt-1 font-medium">Taxa: 69,6%</p>
          </div>
          <div className="h-1 bg-[#16a34a] rounded-full mt-5"></div>
        </div>

        {/* Tempo Médio */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            <span>Tempo Médio</span>
            <ArrowUpRight size={16} className="text-cyan-600" />
          </div>
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900">4,2 dias</h2>
            <p className="text-xs text-slate-400 mt-1 font-medium">Meta: 5 dias ✓</p>
          </div>
          <div className="h-1 bg-cyan-500 rounded-full mt-5"></div>
        </div>

      </div>

      {/* ======================================================= */}
      {/* 2. CHAMADOS POR CATEGORIA E DISTRIBUIÇÃO POR STATUS     */}
      {/* ======================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Chamados por Categoria */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col">
          <h3 className="text-base font-bold text-slate-800 mb-6">Chamados por Categoria</h3>
          <div className="flex-1 flex flex-col justify-center space-y-8">
            {categorias.map((cat, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <span className="w-28 text-xs font-medium text-slate-500 text-right shrink-0">
                  {cat.nome}
                </span>
                <div className="flex-1 bg-slate-100 h-4 rounded-r-md overflow-hidden">
                  <div
                    className="bg-[#16a34a] h-full rounded-r-md transition-all duration-500"
                    style={{ width: cat.largura }}
                  ></div>
                </div>
                <span className="w-10 text-xs font-bold text-slate-700">
                  {cat.total}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Gráfico Donut: Distribuição por Status */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col">
          <h3 className="text-base font-bold text-slate-800">Distribuição por Status</h3>

          <div className="flex-1 flex items-center justify-center py-6">
            <svg viewBox="0 0 120 120" className="w-52 h-52">
              <g transform="rotate(-90 60 60)">
                {(() => {
                  let acumulado = 0;
                  return statusData.map((s) => {
                    const comprimento = (s.valor / totalStatus) * CIRC;
                    const offset = -acumulado;
                    acumulado += comprimento;
                    return (
                      <circle
                        key={s.nome}
                        cx="60"
                        cy="60"
                        r={RAIO}
                        fill="transparent"
                        stroke={s.cor}
                        strokeWidth={statusHover === s.nome ? 17 : 14}
                        strokeDasharray={`${Math.max(comprimento - 1.5, 0)} ${CIRC}`}
                        strokeDashoffset={offset}
                        style={{
                          cursor: 'pointer',
                          transition: 'stroke-width 150ms',
                          opacity: statusHover && statusHover !== s.nome ? 0.45 : 1,
                        }}
                        onMouseEnter={() => setStatusHover(s.nome)}
                        onMouseLeave={() => setStatusHover(null)}
                        onClick={irParaKanban}
                      />
                    );
                  });
                })()}
              </g>

              {/* Texto central */}
              <text x="60" y="58" textAnchor="middle" className="fill-slate-900" style={{ fontSize: 16, fontWeight: 800 }}>
                {statusHover
                  ? statusData.find((s) => s.nome === statusHover).valor
                  : totalStatus}
              </text>
              <text x="60" y="71" textAnchor="middle" className="fill-slate-400" style={{ fontSize: 7 }}>
                {statusHover || 'Total'}
              </text>
            </svg>
          </div>

          <div className="space-y-1 text-xs">
            {statusData.map((s) => (
              <button
                key={s.nome}
                onClick={irParaKanban}
                onMouseEnter={() => setStatusHover(s.nome)}
                onMouseLeave={() => setStatusHover(null)}
                className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2 text-slate-600 font-medium">
                  <span className={`w-2.5 h-2.5 rounded-full ${s.dot}`}></span> {s.nome}
                </span>
                <span className="font-bold text-slate-900">{s.valor}</span>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* ======================================================= */}
      {/* 3. EVOLUÇÃO MENSAL E CHAMADOS RECENTES                  */}
      {/* ======================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Gráfico de Linhas: Evolução Mensal de Chamados */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-800">Evolução Mensal de Chamados</h3>
              <p className="text-xs text-slate-400 mt-0.5">Acompanhe o volume de solicitações ao longo do tempo.</p>
            </div>
            <select
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 bg-white focus:outline-none"
            >
              <option>Jan - Jul, 2026</option>
              <option>Ago - Dez, 2026</option>
            </select>
          </div>

          {/* Gráfico SVG */}
          <div className="relative w-full flex-1 flex items-center justify-center pt-2">
            <svg
              viewBox="0 0 650 230"
              preserveAspectRatio="xMidYMid meet"
              className="w-full h-auto overflow-visible"
            >
              {/* Linhas Horizontais de Grade e Eixo Y */}
              {[
                { y: 20, label: '260' },
                { y: 65, label: '195' },
                { y: 110, label: '130' },
                { y: 155, label: '65' },
                { y: 200, label: '0' }
              ].map((grid, i) => (
                <g key={i}>
                  <text x="25" y={grid.y + 4} textAnchor="end" className="text-[10px] fill-slate-400">
                    {grid.label}
                  </text>
                  <line x1="40" y1={grid.y} x2="630" y2={grid.y} stroke="#f1f5f9" strokeWidth="1" />
                </g>
              ))}

              {/* Curva Vermelha (Pendentes) */}
              <path
                d="M 45 102 C 95 90, 110 76, 142 76 C 180 76, 200 84, 239 84 C 280 84, 300 48, 336 48 C 375 48, 395 28, 433 28 C 470 28, 495 44, 530 44 C 565 44, 595 20, 625 20"
                fill="none"
                stroke="#ef4444"
                strokeWidth="2.5"
              />

              {/* Curva Verde (Concluídos) */}
              <path
                d="M 45 130 C 95 118, 110 110, 142 110 C 180 110, 200 118, 239 118 C 280 118, 300 86, 336 86 C 375 86, 395 94, 433 94 C 470 94, 495 72, 530 72 C 565 72, 595 64, 625 64"
                fill="none"
                stroke="#16a34a"
                strokeWidth="2.5"
              />

              {/* Pontos da Linha Vermelha (Pendentes) */}
              {[
                { x: 45, y: 102 },
                { x: 142, y: 76 },
                { x: 239, y: 84 },
                { x: 336, y: 48 },
                { x: 433, y: 28 },
                { x: 530, y: 44 },
                { x: 625, y: 20 }
              ].map((pt, i) => (
                <circle key={i} cx={pt.x} cy={pt.y} r="3.5" className="fill-white stroke-[#ef4444]" strokeWidth="2" />
              ))}

              {/* Pontos da Linha Verde (Concluídos) */}
              {[
                { x: 45, y: 130 },
                { x: 142, y: 110 },
                { x: 239, y: 118 },
                { x: 336, y: 86 },
                { x: 433, y: 94 },
                { x: 530, y: 72 },
                { x: 625, y: 64 }
              ].map((pt, i) => (
                <circle key={i} cx={pt.x} cy={pt.y} r="3.5" className="fill-white stroke-[#16a34a]" strokeWidth="2" />
              ))}

              {/* Rótulos dos Meses (Eixo X) */}
              {[
                { x: 45, mes: 'Jan' },
                { x: 142, mes: 'Fev' },
                { x: 239, mes: 'Mar' },
                { x: 336, mes: 'Abr' },
                { x: 433, mes: 'Mai' },
                { x: 530, mes: 'Jun' },
                { x: 625, mes: 'Jul' }
              ].map((item, i) => (
                <text key={i} x={item.x} y="222" textAnchor="middle" className="text-[10px] fill-slate-400">
                  {item.mes}
                </text>
              ))}
            </svg>
          </div>

          {/* Legenda */}
          <div className="flex items-center justify-center gap-6 mt-4 pt-2 text-xs text-slate-600 font-medium">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-1 rounded-full bg-[#ef4444]"></span>
              <span>Pendentes</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-1 rounded-full bg-[#16a34a]"></span>
              <span>Concluídos</span>
            </div>
          </div>
        </div>

        {/* Chamados Recentes */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-bold text-slate-800">Chamados Recentes</h3>
              <button
                onClick={() => setActivePage && setActivePage('chamados')}
                className="text-xs font-bold text-[#16a34a] hover:underline flex items-center gap-1 cursor-pointer"
              >
                Ver todos <ArrowRight size={13} />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {listaRecentes.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    if (onSelectChamado && item.original) onSelectChamado(item.original);
                    else if (setActivePage) setActivePage('chamados');
                  }}
                  className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-2 hover:bg-slate-50/70 rounded-lg px-2 -mx-2 transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="text-xs font-mono text-slate-400 mt-0.5 shrink-0">{item.id}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{item.solicitante}</p>
                      <p className="text-[11px] text-slate-400 truncate">{item.resumo}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {renderBadge(item.status)}
                    <span className="text-[10px] text-slate-400">{item.data}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}