import React, { useState } from 'react';
import { ArrowLeft, Clock, User, FileText, MessageSquare, Paperclip, ChevronDown, MapPin, Phone, Image } from 'lucide-react';
import { atualizarPrioridadeChamado } from '../api';

export default function ChamadoDetalhes({ chamado, setActivePage }) {
  const [prioridadeAtiva, setPrioridadeAtiva] = useState(chamado?.prioridade || 'MÉDIA');

  if (!chamado) {
    return (
      <div className="p-8 flex flex-col items-center justify-center h-full">
        <p className="text-slate-500 mb-4">Nenhum chamado selecionado.</p>
        <button onClick={() => setActivePage('chamados')} className="px-4 py-2 bg-[#4b5e28] text-white rounded-lg font-medium">
          Voltar aos Chamados
        </button>
      </div>
    );
  }

  const origem = chamado.origem || 'chamados';
  let textoVoltar = 'Voltar aos Chamados';
  let destinoVoltar = 'chamados';

  if (origem === 'kanban') {
    textoVoltar = 'Voltar ao fluxo Kanban';
    destinoVoltar = 'kanban';
  } else if (origem === 'dashboard') {
    textoVoltar = 'Voltar ao Dashboard';
    destinoVoltar = 'dashboard';
  }

  const handleAlterarPrioridade = async (novaPrioridade) => {
    setPrioridadeAtiva(novaPrioridade);
    try {
      await atualizarPrioridadeChamado(chamado.id, novaPrioridade);
    } catch (erro) {
      console.error('Erro ao atualizar prioridade:', erro);
    }
  };

  const getStatusColor = (status = '') => {
    switch (status.toLowerCase()) {
      case 'pendente': return 'bg-[#f59e0b] text-white';
      case 'em andamento': return 'bg-[#1e3a8a] text-white';
      case 'concluído': return 'bg-[#4b5e28] text-white';
      case 'cancelado': return 'bg-red-500 text-white';
      default: return 'bg-slate-500 text-white';
    }
  };

  const getPriorityStyle = (pri) => {
    switch (pri) {
      case 'ALTA': return 'text-red-700 bg-red-100 border-red-200 hover:bg-red-200';
      case 'MÉDIA': return 'text-yellow-700 bg-yellow-100 border-yellow-200 hover:bg-yellow-200';
      case 'BAIXA': return 'text-green-700 bg-green-100 border-green-200 hover:bg-green-200';
      default: return 'text-slate-700 bg-slate-100 border-slate-200';
    }
  };

  const fotos = Array.isArray(chamado.fotos) ? chamado.fotos : [];

  return (
    <div className="p-8 space-y-6 bg-slate-50 min-h-full pb-16">

      <button
        onClick={() => setActivePage(destinoVoltar)}
        className="flex items-center gap-2 text-slate-500 hover:text-[#4b5e28] transition-colors font-medium mb-2"
      >
        <ArrowLeft size={18} /> {textoVoltar}
      </button>

      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">

        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-slate-800">{chamado.titulo}</h2>
              <span className="px-2.5 py-1 text-xs font-bold bg-slate-100 text-slate-600 rounded-md border border-slate-200">
                {chamado.id}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mt-1">
              <span className="flex items-center gap-1.5">
                <User size={16} /> Solicitado por: <strong className="text-slate-700">{chamado.autor}</strong>
              </span>
              {chamado.cidadao_telefone && (
                <span className="flex items-center gap-1.5">
                  <Phone size={15} /> WhatsApp: <strong className="text-slate-700">{chamado.cidadao_telefone}</strong>
                </span>
              )}
              {(chamado.local || chamado.localizacao) && (
                <span className="flex items-center gap-1.5">
                  <MapPin size={15} /> Local: <strong className="text-slate-700">{chamado.local || chamado.localizacao}</strong>
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2.5">
            <span className={`px-4 py-1.5 text-sm font-bold rounded-lg shadow-sm ${getStatusColor(chamado.status)}`}>
              {chamado.status}
            </span>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Prioridade:</span>
              <div className="relative">
                <select
                  value={prioridadeAtiva}
                  onChange={(e) => handleAlterarPrioridade(e.target.value)}
                  className={`pl-3 pr-7 py-1 text-[11px] font-bold rounded border outline-none cursor-pointer appearance-none transition-colors ${getPriorityStyle(prioridadeAtiva)}`}
                >
                  <option value="BAIXA">BAIXA</option>
                  <option value="MÉDIA">MÉDIA</option>
                  <option value="ALTA">ALTA</option>
                </select>
                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
              </div>
            </div>
          </div>
        </div>

        <hr className="border-slate-100 my-8" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          <div className="md:col-span-2 space-y-6">
            <div className="space-y-3">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <FileText size={18} className="text-[#4b5e28]" /> Descrição da Ocorrência
              </h3>
              <div className="bg-slate-50 p-5 rounded-lg border border-slate-100 text-slate-700 text-sm leading-relaxed">
                {chamado.descricao ? (
                  <>
                    <p className="font-medium text-slate-800 mb-3">"{chamado.descricao}"</p>
                    <p className="text-xs text-slate-500">
                      Local informado pelo cidadão: <strong>{chamado.local || chamado.localizacao || 'Sertão - RS'}</strong>
                    </p>
                  </>
                ) : (
                  <>
                    O cidadão <strong>{chamado.autor}</strong> reportou uma ocorrência relacionada com a categoria <strong>{chamado.titulo}</strong> no município.
                    <br /><br />
                    A equipe técnica deve avaliar a situação presencialmente e proceder com as devidas ações de manutenção para garantir a resolução do problema dentro do prazo estabelecido.
                  </>
                )}
              </div>
            </div>

            {fotos.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <Image size={18} className="text-[#4b5e28]" /> Fotos Enviadas pelo Cidadão ({fotos.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {fotos.map((url, idx) => (
                    <a
                      key={idx}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="block overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <img
                        src={url}
                        alt={`Anexo ${idx + 1} do chamado ${chamado.id}`}
                        className="w-full h-56 object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-slate-800">Métricas do Chamado</h3>
            <ul className="space-y-3 text-sm text-slate-600 bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
              <li className="flex items-center gap-3 pb-3 border-b border-slate-50">
                <Clock size={16} className="text-slate-400" />
                <span>Data de registro:<br /><strong className="text-slate-800">{chamado.tempo}</strong></span>
              </li>
              <li className="flex items-center gap-3 pb-3 border-b border-slate-50">
                <MessageSquare size={16} className="text-slate-400" />
                <span>Atendimento via Bot:<br /><strong className="text-slate-800">{chamado.mensagens || 1} atendimento(s)</strong></span>
              </li>
              <li className="flex items-center gap-3">
                <Paperclip size={16} className="text-slate-400" />
                <span>Arquivos em anexo:<br /><strong className="text-slate-800">{fotos.length || chamado.anexos || 0} foto(s)</strong></span>
              </li>
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
}