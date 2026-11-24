import React, { useState, useEffect } from 'react';
import { Filter, Search, FileText, Download, AlertCircle } from 'lucide-react';

const converterDataBRParaISO = (valor) => {
  if (!valor) return null;
  const texto = String(valor).trim().split(' ')[0];
  if (/^\d{4}-\d{2}-\d{2}$/.test(texto)) return texto;
  const partes = texto.split('/');
  if (partes.length !== 3) return null;
  const [dia, mes, ano] = partes;
  return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
};

const formatarDataBR = (valor) => {
  if (!valor) return '—';
  const texto = String(valor).trim().split(' ')[0];
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(texto)) return texto;
  if (/^\d{4}-\d{2}-\d{2}$/.test(texto)) {
    const [ano, mes, dia] = texto.split('-');
    return `${dia}/${mes}/${ano}`;
  }
  return texto;
};

const normalizarStatus = (st) => {
  const s = String(st || 'Pendente').toLowerCase();
  if (s.includes('conclu')) return 'Concluído';
  if (s.includes('andamento')) return 'Em andamento';
  if (s.includes('cancel')) return 'Cancelado';
  return 'Pendente';
};

const identificarCategoriaId = (categoriaNome) => {
  const catLower = String(categoriaNome || '').toLowerCase();
  if (catLower.includes('ilumina')) return 'iluminacao';
  if (catLower.includes('pavimenta')) return 'pavimentacao';
  if (catLower.includes('limpeza')) return 'limpeza';
  if (catLower.includes('agua') || catLower.includes('água')) return 'agua';
  if (catLower.includes('poda')) return 'poda';
  return 'outros';
};

const escaparCelulaCSV = (valor) => {
  const texto = String(valor ?? '');
  return `"${texto.replace(/"/g, '""')}"`;
};

export default function Relatorios({ chamados = [] }) {
  // 1. Estados dos filtros
  const [dataInicial, setDataInicial] = useState('2026-07-01');
  const [dataFinal, setDataFinal] = useState('2026-12-31');
  const [categoria, setCategoria] = useState('');
  const [status, setStatus] = useState('');
  const [localidade, setLocalidade] = useState('');
  const [erroData, setErroData] = useState('');

  // 2. Estados da Tabela de Resultados
  const [relatorioGerado, setRelatorioGerado] = useState(false);
  const [dadosTabela, setDadosTabela] = useState([]);
  const [totais, setTotais] = useState({ total: 0, resolvidos: 0, tempoMedio: '--' });
  const [periodoExibicao, setPeriodoExibicao] = useState('');

  const localidadesDisponiveis = Array.from(
    new Set(
      (Array.isArray(chamados) ? chamados : [])
        .map((c) => String(c.bairro || c.local || '').trim())
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b, 'pt-BR'));

  // Padroniza a exibição das datas: apenas dia/mês/ano
  const formatarPeriodo = (inicio, fim) => {
    const d1 = formatarDataBR(inicio);
    const d2 = formatarDataBR(fim);
    if (d1 === d2) return d1;
    return `${d1} a ${d2}`;
  };

  const renderBadgeStatus = (st) => {
    const normalizado = normalizarStatus(st);
    if (normalizado === 'Concluído') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
          Concluído
        </span>
      );
    }
    if (normalizado === 'Em andamento') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#dbeafe] text-[#2563eb]">
          Em andamento
        </span>
      );
    }
    if (normalizado === 'Cancelado') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-600">
          Cancelado
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
        Pendente
      </span>
    );
  };

  const handleGerar = (e) => {
    if (e) e.preventDefault();
    setErroData('');

    if (dataInicial && dataFinal && dataFinal < dataInicial) {
      setErroData('A data final não pode ser menor que a data inicial.');
      return;
    }

    const filtroStatus = status.toLowerCase();
    const filtroLocalidade = localidade.toLowerCase();

    const listaOrigem = Array.isArray(chamados) ? chamados : [];
    const temposPorCategoria = {
      iluminacao: 3.2,
      pavimentacao: 5.1,
      limpeza: 2.4,
      agua: 6.5,
      poda: 1.0,
      outros: 2.0
    };

    const filtrados = listaOrigem.filter((c) => {
      if (!c) return false;

      const dataItemISO = converterDataBRParaISO(c.dataAbertura || c.data);
      if (dataItemISO) {
        if (dataInicial && dataItemISO < dataInicial) return false;
        if (dataFinal && dataItemISO > dataFinal) return false;
      }

      const catId = identificarCategoriaId(c.categoria || c.assunto);
      if (categoria !== '' && catId !== categoria) return false;

      const statusNormalizado = normalizarStatus(c.status);
      if (
        filtroStatus !== '' &&
        statusNormalizado.toLowerCase().replace('í', 'i') !==
          filtroStatus.replace('í', 'i')
      ) {
        return false;
      }

      const bairroItem = String(c.bairro || c.local || 'Não informado').trim();
      if (filtroLocalidade !== '' && bairroItem.toLowerCase() !== filtroLocalidade) {
        return false;
      }

      return true;
    });

    const gruposMap = new Map();

    filtrados.forEach((c) => {
      const catNome = c.categoria || c.assunto || 'Outros';
      const catId = identificarCategoriaId(catNome);
      const secretariaNome = c.departamento || 'Não encaminhado';
      const statusNormalizado = normalizarStatus(c.status);
      const bairroNome = String(c.bairro || c.local || 'Não informado').trim();
      const dataBR = formatarDataBR(c.dataAbertura || c.data);

      const chave = `${catNome}||${secretariaNome}||${statusNormalizado}`;

      if (!gruposMap.has(chave)) {
        gruposMap.set(chave, {
          dataSet: new Set(),
          bairrosSet: new Set(),
          nome: catNome,
          secretaria: secretariaNome,
          status: statusNormalizado,
          total: 0,
          resolvidos: 0,
          tempoNum: statusNormalizado === 'Concluído' ? temposPorCategoria[catId] ?? 2.0 : null
        });
      }

      const grupo = gruposMap.get(chave);
      if (dataBR !== '—') grupo.dataSet.add(dataBR);
      grupo.bairrosSet.add(bairroNome);
      grupo.total += 1;

      // Apenas chamados com status "Concluído" contam como resolvidos
      if (statusNormalizado === 'Concluído') {
        grupo.resolvidos += 1;
      }
    });

    const linhas = Array.from(gruposMap.values())
      .map((g) => {
        const datasOrdenadas = Array.from(g.dataSet).sort((a, b) => {
          const isoA = converterDataBRParaISO(a) || '';
          const isoB = converterDataBRParaISO(b) || '';
          return isoA.localeCompare(isoB);
        });

        let dataExibicao = formatarPeriodo(dataInicial, dataFinal);
        if (datasOrdenadas.length === 1) {
          dataExibicao = datasOrdenadas[0];
        } else if (datasOrdenadas.length > 1) {
          dataExibicao = `${datasOrdenadas[0]} a ${datasOrdenadas[datasOrdenadas.length - 1]}`;
        }

        return {
          data: dataExibicao,
          localidade: Array.from(g.bairrosSet).join(', '),
          nome: g.nome,
          secretaria: g.secretaria,
          status: g.status,
          total: g.total,
          resolvidos: g.resolvidos,
          tempo: g.tempoNum !== null ? `${g.tempoNum.toFixed(1).replace('.', ',')} dias` : '--',
          tempoNum: g.tempoNum
        };
      })
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

    const tChamados = linhas.reduce((acc, curr) => acc + curr.total, 0);
    const tResolvidos = linhas.reduce((acc, curr) => acc + curr.resolvidos, 0);

    let totalTempos = 0;
    let qtdValida = 0;
    linhas.forEach((i) => {
      if (i.tempoNum !== null && !isNaN(i.tempoNum)) {
        totalTempos += i.tempoNum;
        qtdValida += 1;
      }
    });

    const tempoMedioFinal =
      qtdValida > 0
        ? `~ ${(totalTempos / qtdValida).toFixed(1).replace('.', ',')} dias`
        : '--';

    setDadosTabela(linhas);
    setTotais({ total: tChamados, resolvidos: tResolvidos, tempoMedio: tempoMedioFinal });
    setPeriodoExibicao(formatarPeriodo(dataInicial, dataFinal));
    setRelatorioGerado(true);
  };

  // Exportar CSV
  const handleExportarCSV = () => {
    const cabecalhos = [
      'Data',
      'Localidade',
      'Categoria',
      'Secretaria',
      'Status',
      'Total de Chamados',
      'Resolvidos',
      'Tempo Médio'
    ];

    const linhasCSV = [
      cabecalhos.map(escaparCelulaCSV).join(';'),
      ...dadosTabela.map((linha) =>
        [
          linha.data,
          linha.localidade,
          linha.nome,
          linha.secretaria,
          linha.status,
          linha.total,
          linha.resolvidos,
          linha.tempo
        ]
          .map(escaparCelulaCSV)
          .join(';')
      ),
      [
        'TOTAL GERAL',
        '',
        '',
        '',
        '',
        totais.total,
        totais.resolvidos,
        totais.tempoMedio
      ]
        .map(escaparCelulaCSV)
        .join(';')
    ];

    const conteudoCSV = '\uFEFF' + linhasCSV.join('\r\n');
    const blob = new Blob([conteudoCSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `relatorio-comunica-sertao-${formatarDataBR(dataInicial).replace(/\//g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Exportar PDF
  const handleExportarPDF = () => {
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        body * {
          visibility: hidden;
        }
        #area-relatorio, #area-relatorio * {
          visibility: visible;
        }
        #area-relatorio {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
        }
        ::-webkit-scrollbar { display: none; }
      }
    `;
    document.head.appendChild(style);
    window.print();
    setTimeout(() => {
      document.head.removeChild(style);
    }, 500);
  };

  useEffect(() => {
    handleGerar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chamados]);

  return (
    <div className="p-8 bg-slate-50 min-h-screen space-y-6">

      {/* 1. FILTROS DO RELATÓRIO */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center gap-2">
          <Filter size={18} className="text-[#2563eb]" />
          <h2 className="text-base font-bold text-slate-800">Filtros do Relatório</h2>
        </div>

        <form onSubmit={handleGerar} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-5">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Data Inicial</label>
              <input
                type="date"
                value={dataInicial}
                onChange={(e) => {
                  setDataInicial(e.target.value);
                  if (erroData) setErroData('');
                }}
                className={`w-full px-3 py-2.5 bg-white border rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 ${erroData ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-[#2563eb]'}`}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Data Final</label>
              <input
                type="date"
                value={dataFinal}
                min={dataInicial || undefined}
                onChange={(e) => {
                  setDataFinal(e.target.value);
                  if (erroData) setErroData('');
                }}
                className={`w-full px-3 py-2.5 bg-white border rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 ${erroData ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-[#2563eb]'}`}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Categoria</label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-slate-900"
              >
                <option value="">Todas as Categorias</option>
                <option value="iluminacao">Iluminação Pública</option>
                <option value="pavimentacao">Pavimentação</option>
                <option value="limpeza">Limpeza Urbana</option>
                <option value="agua">Água e Esgoto</option>
                <option value="poda">Poda de Árvores</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-slate-900"
              >
                <option value="">Todos os Status</option>
                <option value="pendente">Pendente</option>
                <option value="em andamento">Em andamento</option>
                <option value="concluido">Concluído</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Localidade (Bairro)</label>
              <select
                value={localidade}
                onChange={(e) => setLocalidade(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-slate-900"
              >
                <option value="">Todas as Localidades</option>
                {localidadesDisponiveis.map((bairro) => (
                  <option key={bairro} value={bairro}>
                    {bairro}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {erroData && (
            <div className="mb-5 flex items-center gap-2 bg-red-50 p-3 rounded-lg text-red-600 text-sm font-medium border border-red-100">
              <AlertCircle size={18} className="shrink-0" />
              <span>{erroData}</span>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-bold rounded-lg transition-colors cursor-pointer shadow-sm"
            >
              <Search size={16} />
              <span>Gerar Pré-visualização</span>
            </button>
          </div>
        </form>
      </div>

      {/* 2. ÁREA DE EXPORTAÇÃO */}
      {relatorioGerado && (
        <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-end gap-3 shadow-sm">
          <button
            type="button"
            onClick={handleExportarCSV}
            disabled={dadosTabela.length === 0}
            className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 hover:bg-green-50 hover:border-green-200 text-slate-700 hover:text-green-700 rounded-lg text-sm font-bold transition-all cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={16} className="text-green-600" />
            Exportar CSV
          </button>

          <button
            type="button"
            onClick={handleExportarPDF}
            className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 hover:bg-red-50 hover:border-red-200 text-slate-700 hover:text-red-600 rounded-lg text-sm font-bold transition-all cursor-pointer shadow-sm"
          >
            <FileText size={16} className="text-red-500" />
            Exportar PDF
          </button>
        </div>
      )}

      {/* 3. PRÉ-VISUALIZAÇÃO DOS DADOS */}
      {relatorioGerado && (
        <div id="area-relatorio" className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-800">Relatório de Desempenho - Comunica Sertão</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Período selecionado: {periodoExibicao}
              {localidade ? ` • Localidade: ${localidade}` : ''}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[920px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-left">
                  <th className="py-4 px-5">Data</th>
                  <th className="py-4 px-5">Localidade</th>
                  <th className="py-4 px-5">Categoria</th>
                  <th className="py-4 px-5">Secretaria</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5">Total de Chamados</th>
                  <th className="py-4 px-5">Resolvidos</th>
                  <th className="py-4 px-5">Tempo Médio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">

                {dadosTabela.length > 0 ? (
                  dadosTabela.map((linha, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-5 font-medium text-slate-700 whitespace-nowrap">{linha.data}</td>
                      <td className="py-4 px-5 text-slate-700">{linha.localidade}</td>
                      <td className="py-4 px-5 text-slate-700 font-medium">{linha.nome}</td>
                      <td className="py-4 px-5 text-slate-700">{linha.secretaria}</td>
                      <td className="py-4 px-5 whitespace-nowrap">{renderBadgeStatus(linha.status)}</td>
                      <td className="py-4 px-5 font-bold text-slate-800">{linha.total}</td>
                      <td className="py-4 px-5 font-bold text-[#2563eb]">{linha.resolvidos}</td>
                      <td className="py-4 px-5 text-slate-600 whitespace-nowrap">{linha.tempo}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-slate-500 font-medium">
                      Nenhum resultado encontrado para os filtros selecionados.
                    </td>
                  </tr>
                )}

                {dadosTabela.length > 0 && (
                  <tr className="bg-slate-50/50">
                    <td className="py-4 px-5 font-bold text-slate-800">TOTAL GERAL</td>
                    <td className="py-4 px-5"></td>
                    <td className="py-4 px-5"></td>
                    <td className="py-4 px-5"></td>
                    <td className="py-4 px-5"></td>
                    <td className="py-4 px-5 font-extrabold text-slate-900">{totais.total}</td>
                    <td className="py-4 px-5 font-extrabold text-[#2563eb]">{totais.resolvidos}</td>
                    <td className="py-4 px-5 font-bold text-slate-800 whitespace-nowrap">{totais.tempoMedio}</td>
                  </tr>
                )}

              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}