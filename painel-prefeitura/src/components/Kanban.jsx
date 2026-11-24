import React, { useState } from 'react';
import { MessageSquare, Paperclip, Clock } from 'lucide-react';

const STATUS_POR_COLUNA = {
  pendentes: 'Pendente',
  emAndamento: 'Em andamento',
  concluidos: 'Concluído',
  cancelados: 'Cancelado'
};

const obterColunaPorStatus = (status) => {
  const s = String(status || '').toLowerCase();
  if (s.includes('conclu')) return 'concluidos';
  if (s.includes('andamento')) return 'emAndamento';
  if (s.includes('cancel')) return 'cancelados';
  return 'pendentes';
};

export default function Kanban({
  chamados = [],
  setChamados,
  onAlterarStatus,
  onSelectChamado
}) {
  const initialCards = {
    pendentes: [
      { id: 'CH-2847', titulo: 'Iluminação Pública', autor: 'Maria Aparecida S.', tempo: 'Hoje', mensagens: 2, anexos: 1, prioridade: 'ALTA' },
      { id: 'CH-2844', titulo: 'Água e Esgoto', autor: 'Roberto F.', tempo: 'Há 1 dia', mensagens: 0, anexos: 3, prioridade: 'MÉDIA' },
      { id: 'CH-2850', titulo: 'Limpeza Urbana', autor: 'Carlos Eduardo', tempo: 'Há 2 dias', mensagens: 1, anexos: 0, prioridade: 'BAIXA' },
    ],
    emAndamento: [
      { id: 'CH-2846', titulo: 'Pavimentação', autor: 'João Carlos M.', tempo: 'Há 3 dias', mensagens: 4, anexos: 2, prioridade: 'ALTA' },
      { id: 'CH-2843', titulo: 'Poda de Árvores', autor: 'Claudia B.', tempo: 'Há 4 dias', mensagens: 1, anexos: 1, prioridade: 'MÉDIA' },
    ],
    concluidos: [
      { id: 'CH-2845', titulo: 'Limpeza Urbana', autor: 'Ana Paula R.', tempo: 'Concluído ontem', mensagens: 0, anexos: 1, prioridade: 'BAIXA' },
      { id: 'CH-2840', titulo: 'Iluminação Pública', autor: 'Fernando Costa', tempo: 'Concluído há 3 dias', mensagens: 3, anexos: 2, prioridade: 'MÉDIA' },
    ],
    cancelados: [
      { id: 'CH-2831', titulo: 'Solicitação Duplicada', autor: 'Mário Silva', tempo: 'Cancelado ontem', mensagens: 1, anexos: 0, prioridade: 'BAIXA' }
    ]
  };

  const [cardsLocais, setCardsLocais] = useState(initialCards);

  const usarEstadoGlobal = Array.isArray(chamados) && chamados.length > 0;

  const cards = usarEstadoGlobal
    ? chamados.reduce(
        (acc, item) => {
          const coluna = obterColunaPorStatus(item.status);
          acc[coluna].push({
            ...item,
            titulo: item.titulo || item.categoria || 'Solicitação',
            autor: item.autor || item.solicitante || item.cidadao || 'Cidadão',
            tempo: item.tempo || item.ultimaModificacao || item.dataAbertura || '—',
            prioridade: item.prioridade || 'BAIXA',
            mensagens: item.mensagens ?? 0,
            anexos: item.anexos ?? 0
          });
          return acc;
        },
        { pendentes: [], emAndamento: [], concluidos: [], cancelados: [] }
      )
    : cardsLocais;

  const handleDragStart = (e, cardId, sourceCol) => {
    e.dataTransfer.setData('cardId', cardId);
    e.dataTransfer.setData('sourceCol', sourceCol);
    setTimeout(() => { e.target.style.opacity = '0.4'; }, 0);
  };

  const handleDragEnd = (e) => { e.target.style.opacity = '1'; };
  const handleDragOver = (e) => { e.preventDefault(); };

  const handleDrop = (e, targetCol) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData('cardId');
    const sourceCol = e.dataTransfer.getData('sourceCol');
    if (sourceCol === targetCol || !cardId) return;

    if (usarEstadoGlobal) {
      const novoStatus = STATUS_POR_COLUNA[targetCol];
      if (typeof onAlterarStatus === 'function') {
        onAlterarStatus(cardId, novoStatus);
      } else if (typeof setChamados === 'function') {
        const agora = new Date();
        const ultimaModificacao =
          `${agora.toLocaleDateString('pt-BR')} às ` +
          agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

        setChamados((prev) =>
          prev.map((c) =>
            c.id === cardId ? { ...c, status: novoStatus, ultimaModificacao } : c
          )
        );
      }
      return;
    }

    setCardsLocais((prevCards) => {
      const sourceList = [...prevCards[sourceCol]];
      const targetList = [...prevCards[targetCol]];

      const cardIndex = sourceList.findIndex((c) => c.id === cardId);
      if (cardIndex === -1) return prevCards;

      const [movedCard] = sourceList.splice(cardIndex, 1);
      targetList.push(movedCard);
      return { ...prevCards, [sourceCol]: sourceList, [targetCol]: targetList };
    });
  };

  const handleCardClick = (card, columnKey) => {
    if (onSelectChamado) {
      onSelectChamado({ ...card, status: STATUS_POR_COLUNA[columnKey], origem: 'kanban' });
    }
  };

  const renderPriorityBadge = (prioridade) => {
    switch (prioridade) {
      case 'ALTA': return <span className="px-2 py-0.5 text-[10px] font-bold text-red-700 bg-red-100 rounded">ALTA</span>;
      case 'MÉDIA': return <span className="px-2 py-0.5 text-[10px] font-bold text-yellow-700 bg-yellow-100 rounded">MÉDIA</span>;
      case 'BAIXA': return <span className="px-2 py-0.5 text-[10px] font-bold text-green-700 bg-green-100 rounded">BAIXA</span>;
      default: return null;
    }
  };

  const renderCard = (card, columnKey) => (
    <div
      key={card.id}
      draggable
      onDragStart={(e) => handleDragStart(e, card.id, columnKey)}
      onDragEnd={handleDragEnd}
      onClick={() => handleCardClick(card, columnKey)}
      className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 cursor-grab active:cursor-grabbing hover:shadow-md hover:border-slate-300 transition-all group"
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs font-semibold text-slate-500 group-hover:text-[#4b5e28] transition-colors">{card.id}</span>
        {renderPriorityBadge(card.prioridade)}
      </div>
      <h4 className="font-bold text-slate-800 text-sm mb-1">{card.titulo}</h4>
      <p className="text-xs text-slate-600 mb-4">{card.autor}</p>
      <div className="flex justify-between items-center text-slate-500">
        <div className="flex items-center gap-1.5 text-xs"><Clock size={12} /><span>{card.tempo}</span></div>
        <div className="flex items-center gap-3 text-xs">
          {card.mensagens > 0 && (<div className="flex items-center gap-1"><MessageSquare size={12} /> {card.mensagens}</div>)}
          {card.anexos > 0 && (<div className="flex items-center gap-1"><Paperclip size={12} /> {card.anexos}</div>)}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-8 h-full bg-slate-50">
      <div className="flex h-full overflow-x-auto pb-4">
        <div className="flex h-full gap-6 mx-auto">
          {/* COLUNA 1 */}
          <div className="flex flex-col min-w-[320px] w-[320px] bg-slate-100/50 rounded-2xl border border-slate-200 ml-8">
            <div className="p-4 border-b border-slate-200 border-t-4 border-t-yellow-500 rounded-t-2xl flex justify-between items-center bg-white">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-800">Pendentes</h3>
                <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">{cards.pendentes.length}</span>
              </div>
            </div>
            <div className="p-4 flex-1 flex flex-col gap-4 overflow-y-auto" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, 'pendentes')}>
              {cards.pendentes.map((card) => renderCard(card, 'pendentes'))}
            </div>
          </div>
          {/* COLUNA 2 */}
          <div className="flex flex-col min-w-[320px] w-[320px] bg-slate-100/50 rounded-2xl border border-slate-200">
            <div className="p-4 border-b border-slate-200 border-t-4 border-t-[#1e3a8a] rounded-t-2xl flex justify-between items-center bg-white">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-800">Em Andamento</h3>
                <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">{cards.emAndamento.length}</span>
              </div>
            </div>
            <div className="p-4 flex-1 flex flex-col gap-4 overflow-y-auto" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, 'emAndamento')}>
              {cards.emAndamento.map((card) => renderCard(card, 'emAndamento'))}
            </div>
          </div>
          {/* COLUNA 3 */}
          <div className="flex flex-col min-w-[320px] w-[320px] bg-slate-100/50 rounded-2xl border border-slate-200">
            <div className="p-4 border-b border-slate-200 border-t-4 border-t-[#4b5e28] rounded-t-2xl flex justify-between items-center bg-white">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-800">Concluídos</h3>
                <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">{cards.concluidos.length}</span>
              </div>
            </div>
            <div className="p-4 flex-1 flex flex-col gap-4 overflow-y-auto" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, 'concluidos')}>
              {cards.concluidos.map((card) => renderCard(card, 'concluidos'))}
            </div>
          </div>
          {/* COLUNA 4 */}
          <div className="flex flex-col min-w-[320px] w-[320px] bg-slate-100/50 rounded-2xl border border-slate-200 mr-8">
            <div className="p-4 border-b border-slate-200 border-t-4 border-t-red-500 rounded-t-2xl flex justify-between items-center bg-white opacity-80">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-800">Cancelados</h3>
                <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">{cards.cancelados.length}</span>
              </div>
            </div>
            <div className="p-4 flex-1 flex flex-col gap-4 overflow-y-auto opacity-75" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, 'cancelados')}>
              {cards.cancelados.map((card) => renderCard(card, 'cancelados'))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}