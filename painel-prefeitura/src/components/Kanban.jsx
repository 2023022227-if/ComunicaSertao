import React, { useState, useEffect } from 'react';
import { MessageSquare, Paperclip, Clock } from 'lucide-react';
import { buscarChamados, atualizarStatusChamado } from '../api';

export default function Kanban({ setActivePage, setSelectedChamado }) {
  const [cards, setCards] = useState({
    pendentes: [],
    emAndamento: [],
    concluidos: [],
    cancelados: []
  });

  const statusMap = {
    pendentes: 'Pendente',
    emAndamento: 'Em Andamento',
    concluidos: 'Concluído',
    cancelados: 'Cancelado'
  };

  const carregarKanban = async () => {
    try {
      const lista = await buscarChamados();
      const agrupado = {
        pendentes: [],
        emAndamento: [],
        concluidos: [],
        cancelados: []
      };

      lista.forEach(item => {
        const st = (item.status || '').toLowerCase();
        if (st === 'pendente') agrupado.pendentes.push(item);
        else if (st === 'em andamento') agrupado.emAndamento.push(item);
        else if (st === 'concluído') agrupado.concluidos.push(item);
        else if (st === 'cancelado') agrupado.cancelados.push(item);
        else agrupado.pendentes.push(item);
      });

      setCards(agrupado);
    } catch (erro) {
      console.error('Erro ao carregar Kanban:', erro);
    }
  };

  useEffect(() => {
    carregarKanban();
    const intervalo = setInterval(carregarKanban, 4000);
    return () => clearInterval(intervalo);
  }, []);

  const handleDragStart = (e, cardId, sourceCol) => {
    e.dataTransfer.setData('cardId', cardId);
    e.dataTransfer.setData('sourceCol', sourceCol);
    setTimeout(() => { e.target.style.opacity = '0.4'; }, 0);
  };

  const handleDragEnd = (e) => { e.target.style.opacity = '1'; };
  const handleDragOver = (e) => { e.preventDefault(); };

  const handleDrop = async (e, targetCol) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData('cardId');
    const sourceCol = e.dataTransfer.getData('sourceCol');
    if (sourceCol === targetCol || !cardId) return;

    const novoStatus = statusMap[targetCol];

    setCards(prevCards => {
      const sourceList = [...prevCards[sourceCol]];
      const targetList = [...prevCards[targetCol]];

      const cardIndex = sourceList.findIndex(c => c.id === cardId);
      if (cardIndex === -1) return prevCards;

      const [movedCard] = sourceList.splice(cardIndex, 1);
      movedCard.status = novoStatus;
      targetList.push(movedCard);
      return { ...prevCards, [sourceCol]: sourceList, [targetCol]: targetList };
    });

    try {
      await atualizarStatusChamado(cardId, novoStatus);
    } catch (erro) {
      console.error('Erro ao salvar status do Kanban:', erro);
    }
  };

  const handleCardClick = (card, columnKey) => {
    setSelectedChamado({ ...card, status: statusMap[columnKey], origem: 'kanban' });
    setActivePage('detalhes_chamado');
  };

  const renderPriorityBadge = (prioridade) => {
    switch (prioridade) {
      case 'ALTA': return <span className="px-2 py-0.5 text-[10px] font-bold text-red-700 bg-red-100 rounded">ALTA</span>;
      case 'MÉDIA': return <span className="px-2 py-0.5 text-[10px] font-bold text-yellow-700 bg-yellow-100 rounded">MÉDIA</span>;
      case 'BAIXA': return <span className="px-2 py-0.5 text-[10px] font-bold text-green-700 bg-green-100 rounded">BAIXA</span>;
      default: return null;
    }
  };

  const KanbanCard = ({ card, columnKey }) => (
    <div
      draggable
      onDragStart={(e) => handleDragStart(e, card.id, columnKey)}
      onDragEnd={handleDragEnd}
      onClick={() => handleCardClick(card, columnKey)}
      className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 cursor-grab active:cursor-grabbing hover:shadow-md hover:border-slate-300 transition-all group"
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs font-semibold text-slate-400 group-hover:text-[#4b5e28] transition-colors">{card.id}</span>
        {renderPriorityBadge(card.prioridade)}
      </div>
      <h4 className="font-bold text-slate-800 text-sm mb-1">{card.titulo}</h4>
      <p className="text-xs text-slate-500 mb-1">{card.autor}</p>
      {card.local && <p className="text-[11px] text-slate-400 mb-3 truncate">{card.local}</p>}
      <div className="flex justify-between items-center text-slate-400">
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
      <div className="flex h-full gap-6 overflow-x-auto pb-4">
        {/* COLUNA 1 */}
        <div className="flex flex-col min-w-[320px] w-[320px] bg-slate-100/50 rounded-2xl border border-slate-200">
          <div className="p-4 border-b border-slate-200 border-t-4 border-t-yellow-500 rounded-t-2xl flex justify-between items-center bg-white">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-800">Pendentes</h3>
              <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">{cards.pendentes.length}</span>
            </div>
          </div>
          <div className="p-4 flex-1 flex flex-col gap-4 overflow-y-auto" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, 'pendentes')}>
            {cards.pendentes.map(card => <KanbanCard key={card.id} card={card} columnKey="pendentes" />)}
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
            {cards.emAndamento.map(card => <KanbanCard key={card.id} card={card} columnKey="emAndamento" />)}
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
            {cards.concluidos.map(card => <KanbanCard key={card.id} card={card} columnKey="concluidos" />)}
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
            {cards.cancelados.map(card => <KanbanCard key={card.id} card={card} columnKey="cancelados" />)}
          </div>
        </div>
      </div>
    </div>
  );
}