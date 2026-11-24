import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Clock, User, FileText, Paperclip, Building2, Image as ImageIcon } from 'lucide-react';
import SeletorStatus from './SeletorStatus';
import SeletorPrioridade from './SeletorPrioridade';
import SeletorDepartamento from './SeletorDepartamento';

export default function ChamadoDetalhes({
  chamado,
  setActivePage,
  onAlterarStatus,
  onAlterarPrioridade,
  secretarias = [],
  onEncaminhar
}) {
  const [prioridadeAtiva, setPrioridadeAtiva] = useState(chamado?.prioridade || 'BAIXA');

  useEffect(() => {
    setPrioridadeAtiva(chamado?.prioridade || 'BAIXA');
  }, [chamado?.id, chamado?.prioridade]);

  if (!chamado) {
    return (
      <div className="p-8 flex flex-col items-center justify-center h-full">
        <p className="text-slate-500 mb-4">Nenhum chamado selecionado.</p>
        <button
          onClick={() => setActivePage('chamados')}
          className="px-4 py-2 bg-[#4b5e28] text-white rounded-lg font-medium"
        >
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

  const titulo = chamado.titulo || chamado.categoria || 'Solicitação';
  const autor = chamado.autor || chamado.solicitante || chamado.cidadao || chamado.nome || '—';
  const ultimaAtualizacao = chamado.ultimaModificacao || chamado.tempo || '—';
  const anexos = chamado.anexos ?? 0;
  const status = chamado.status || 'Pendente';
  const departamento = chamado.departamento || 'Ainda não encaminhado';
  const encaminhamentos = chamado.encaminhamentos || [];

  const handleAlterarPrioridade = (novaPrioridade) => {
    setPrioridadeAtiva(novaPrioridade);
    if (onAlterarPrioridade) {
      onAlterarPrioridade(chamado.id, novaPrioridade);
    }
  };

  const getStatusColor = (st) => {
    const s = String(st).toLowerCase();
    if (s.includes('conclu')) return 'bg-[#4b5e28] text-white';
    if (s.includes('andamento')) return 'bg-[#1e3a8a] text-white';
    if (s.includes('cancel')) return 'bg-red-500 text-white';
    if (s.includes('pendente')) return 'bg-[#f59e0b] text-white';
    return 'bg-slate-500 text-white';
  };

  const getPriorityStyle = (pri) => {
    switch (pri) {
      case 'ALTA': return 'text-red-700 bg-red-100 border-red-200';
      case 'MÉDIA': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'BAIXA': return 'text-green-700 bg-green-100 border-green-200';
      default: return 'text-slate-700 bg-slate-100 border-slate-200';
    }
  };

  return (
    <div className="p-8 space-y-6 bg-slate-50 min-h-full pb-16">
      <button
        onClick={() => setActivePage(destinoVoltar)}
        className="flex items-center gap-2 text-slate-500 hover:text-[#4b5e28] transition-colors font-medium mb-2"
      >
        <ArrowLeft size={18} /> {textoVoltar}
      </button>

      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-start gap-4 flex-wrap mb-6">
          <div className="min-w-0">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h2 className="text-2xl font-bold text-slate-800">{titulo}</h2>
              <span className="px-2.5 py-1 text-xs font-bold bg-slate-100 text-slate-600 rounded-md border border-slate-200">
                {chamado.id}
              </span>
              <span className={`px-3 py-1 text-xs font-bold rounded-md shadow-sm ${getStatusColor(status)}`}>
                {status}
              </span>
              <span className={`px-2.5 py-1 text-[11px] font-bold rounded-md border ${getPriorityStyle(prioridadeAtiva)}`}>
                Prioridade: {prioridadeAtiva}
              </span>
            </div>
            <p className="text-slate-500 flex items-center gap-2">
              <User size={16} /> Solicitado por:{' '}
              <span className="font-medium text-slate-700">{autor}</span>
            </p>
          </div>

          <div className="flex items-end gap-4">
            <SeletorPrioridade onChange={handleAlterarPrioridade} />
            <SeletorStatus
              onChange={(novo) => onAlterarStatus && onAlterarStatus(chamado.id, novo)}
            />
          </div>
        </div>

        <hr className="border-slate-100 my-8" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4 min-w-0">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <FileText size={18} className="text-[#4b5e28]" /> Descrição da Ocorrência
            </h3>
            <div className="bg-slate-50 p-5 rounded-lg border border-slate-100 text-slate-700 text-sm leading-relaxed break-words whitespace-pre-wrap [overflow-wrap:anywhere] overflow-hidden">
              {chamado.descricao ? (
                chamado.descricao
              ) : (
                <>
                  O cidadão <strong>{autor}</strong> reportou uma ocorrência relacionada com a categoria{' '}
                  <strong>{titulo}</strong> no município.
                  <br />
                  <br />
                  A equipa técnica deve avaliar a situação presencialmente e proceder com as devidas ações de
                  manutenção para atender a resolução do problema dentro do prazo estabelecido. Esta prioridade
                  foi classificada inicialmente de forma automática pelo sistema.
                </>
              )}
            </div>

            {Array.isArray(chamado.fotos) && chamado.fotos.length > 0 && (
              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                  <ImageIcon size={18} className="text-[#4b5e28]" /> Fotos Enviadas pelo Cidadão ({chamado.fotos.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {chamado.fotos.map((url, idx) => (
                    <a
                      key={idx}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="block overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <img
                        src={url}
                        alt={`Anexo ${idx + 1}`}
                        className="w-full h-52 object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4 min-w-0">
            <h3 className="font-bold text-slate-800">Métricas do Chamado</h3>
            <ul className="space-y-3 text-sm text-slate-600 bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
              <li className="flex items-center gap-3 pb-3 border-b border-slate-50">
                <Clock size={16} className="text-slate-400 shrink-0" />
                <span className="min-w-0 break-words">
                  Última atualização:
                  <br />
                  <strong className="text-slate-800">{ultimaAtualizacao}</strong>
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Paperclip size={16} className="text-slate-400 shrink-0" />
                <span>
                  Ficheiros em anexo:
                  <br />
                  <strong className="text-slate-800">{anexos} documentos</strong>
                </span>
              </li>
            </ul>
          </div>
        </div>

        <hr className="border-slate-100 my-8" />

        <div>
          <div className="flex justify-between items-start gap-4 mb-4">
            <div>
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Building2 size={18} className="text-[#4b5e28]" /> Encaminhamento
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Departamento responsável:{' '}
                <strong className="text-slate-800">{departamento}</strong>
              </p>
            </div>

            <SeletorDepartamento
              secretarias={secretarias}
              atual={chamado.departamento}
              onChange={(sec) => onEncaminhar && onEncaminhar(chamado.id, sec)}
            />
          </div>

          <div className="bg-slate-50 rounded-lg border border-slate-100 p-4">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">
              Histórico de encaminhamentos ({encaminhamentos.length})
            </p>

            {encaminhamentos.length === 0 ? (
              <p className="text-sm text-slate-500">Esta solicitação ainda não foi encaminhada.</p>
            ) : (
              <ul className="space-y-3">
                {[...encaminhamentos].reverse().map((enc, idx) => (
                  <li key={idx} className="text-sm text-slate-600 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2 font-medium text-slate-700">
                      <span>{enc.de || 'Sem departamento'}</span>
                      <ArrowRight size={14} className="text-slate-400 shrink-0" />
                      <span>{enc.para}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Por {enc.por} em {enc.dataHora}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}