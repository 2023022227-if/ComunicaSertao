import React, { useState } from 'react';
import { Filter, Search, FileText, FileSpreadsheet, Download } from 'lucide-react';

export default function Relatorios() {
  const [mostrarPreview, setMostrarPreview] = useState(false);
  
  // 1. Estados para guardar as opções selecionadas nos menus
  const [filtroCategoria, setFiltroCategoria] = useState('Todas as Categorias');
  const [filtroStatus, setFiltroStatus] = useState('Todos os Status');
  
  // Estado para a tabela final que será mostrada
  const [dadosFiltrados, setDadosFiltrados] = useState([]);

  // 2. Nossa base de dados simulada
  // Adicionei um 'status' a cada linha para que o filtro funcione perfeitamente na apresentação
  const dadosBase = [
    { id: 1, periodo: 'Julho 2026', categoria: 'Iluminação Pública', status: 'Concluídos', total: 145, resolvidos: 120, tempo: 3.2 },
    { id: 2, periodo: 'Julho 2026', categoria: 'Pavimentação', status: 'Em Andamento', total: 98, resolvidos: 65, tempo: 5.1 },
    { id: 3, periodo: 'Julho 2026', categoria: 'Limpeza Urbana', status: 'Concluídos', total: 112, resolvidos: 105, tempo: 2.4 },
    { id: 4, periodo: 'Julho 2026', categoria: 'Água e Esgoto', status: 'Pendentes', total: 76, resolvidos: 40, tempo: 6.5 },
  ];

  // 3. Função que filtra os dados quando clicamos no botão
  const handleGerarPreview = (e) => {
    e.preventDefault();
    
    let resultados = dadosBase;

    // Filtra pela categoria (se não for "Todas")
    if (filtroCategoria !== 'Todas as Categorias') {
      resultados = resultados.filter(item => item.categoria === filtroCategoria);
    }

    // Filtra pelo status (se não for "Todos")
    if (filtroStatus !== 'Todos os Status') {
      resultados = resultados.filter(item => item.status === filtroStatus);
    }

    setDadosFiltrados(resultados);
    setMostrarPreview(true);
  };

  // 4. Cálculos automáticos para o rodapé da tabela
  const totalChamados = dadosFiltrados.reduce((acc, curr) => acc + curr.total, 0);
  const totalResolvidos = dadosFiltrados.reduce((acc, curr) => acc + curr.resolvidos, 0);
  const mediaTempo = dadosFiltrados.length > 0
    ? (dadosFiltrados.reduce((acc, curr) => acc + curr.tempo, 0) / dadosFiltrados.length).toFixed(1)
    : 0;

  return (
    <div className="p-8 space-y-6 bg-slate-50 min-h-full pb-16">
      
      {/* ========================================================= */}
      {/* SEÇÃO DE FILTROS */}
      {/* ========================================================= */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Filter size={20} className="text-[#4b5e28]" /> Filtros do Relatório
        </h3>
        
        <form onSubmit={handleGerarPreview} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2">Data Inicial</label>
              <input 
                type="date" 
                defaultValue="2026-09-04"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#4b5e28]/50 focus:border-[#4b5e28] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2">Data Final</label>
              <input 
                type="date" 
                defaultValue="2026-09-30"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#4b5e28]/50 focus:border-[#4b5e28] transition-colors"
              />
            </div>

            {/* Menu Categoria Integrado ao Estado */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2">Categoria</label>
              <select 
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#4b5e28]/50 focus:border-[#4b5e28] transition-colors cursor-pointer"
              >
                <option value="Todas as Categorias">Todas as Categorias</option>
                <option value="Iluminação Pública">Iluminação Pública</option>
                <option value="Pavimentação">Pavimentação</option>
                <option value="Limpeza Urbana">Limpeza Urbana</option>
                <option value="Água e Esgoto">Água e Esgoto</option>
              </select>
            </div>

            {/* Menu Status Integrado ao Estado */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2">Status</label>
              <select 
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#4b5e28]/50 focus:border-[#4b5e28] transition-colors cursor-pointer"
              >
                <option value="Todos os Status">Todos os Status</option>
                <option value="Concluídos">Concluídos</option>
                <option value="Em Andamento">Em Andamento</option>
                <option value="Pendentes">Pendentes</option>
                <option value="Cancelados">Cancelados</option>
              </select>
            </div>
            
          </div>

          <div className="flex justify-end pt-2">
            <button 
              type="submit"
              className="bg-[#4b5e28] hover:bg-[#3a4920] text-white px-5 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors shadow-sm"
            >
              <Search size={16} /> Gerar Pré-visualização
            </button>
          </div>
        </form>
      </div>

      {/* ========================================================= */}
      {/* RESULTADOS DA TABELA */}
      {/* ========================================================= */}
      {mostrarPreview && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <div className="bg-slate-100/70 border border-slate-200 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-sm font-medium text-slate-600">
              Relatório gerado com sucesso. Selecione o formato de exportação:
            </span>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
                <FileText size={16} className="text-red-500" /> PDF
              </button>
              <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
                <FileSpreadsheet size={16} className="text-green-600" /> Excel
              </button>
              <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
                <Download size={16} className="text-slate-500" /> CSV
              </button>
            </div>
          </div>

          <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-slate-800">Pré-visualização dos Dados</h3>
              <p className="text-sm text-slate-500">Resumo do período selecionado.</p>
            </div>

            {dadosFiltrados.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider py-4 px-2">Período</th>
                    <th className="border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider py-4 px-2">Categoria</th>
                    <th className="border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider py-4 px-2">Total de Chamados</th>
                    <th className="border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider py-4 px-2">Resolvidos</th>
                    <th className="border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider py-4 px-2">Tempo Médio</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-slate-700">
                  {dadosFiltrados.map((linha) => (
                    <tr key={linha.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-2 border-b border-slate-50 font-medium">{linha.periodo}</td>
                      <td className="py-4 px-2 border-b border-slate-50 text-slate-500">{linha.categoria}</td>
                      <td className="py-4 px-2 border-b border-slate-50 font-semibold">{linha.total}</td>
                      <td className="py-4 px-2 border-b border-slate-50 font-bold text-[#4b5e28]">{linha.resolvidos}</td>
                      <td className="py-4 px-2 border-b border-slate-50 text-slate-500">{linha.tempo.toString().replace('.', ',')} dias</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td className="py-5 px-2 font-bold text-slate-800">TOTAL GERAL</td>
                    <td className="py-5 px-2"></td>
                    {/* Totais dinâmicos calculados na hora */}
                    <td className="py-5 px-2 font-bold text-slate-800">{totalChamados}</td>
                    <td className="py-5 px-2 font-bold text-[#4b5e28]">{totalResolvidos}</td>
                    <td className="py-5 px-2 font-bold text-slate-600">~ {mediaTempo.toString().replace('.', ',')} dias</td>
                  </tr>
                </tfoot>
              </table>
            ) : (
              <div className="py-12 text-center text-slate-500">
                Nenhum resultado encontrado para os filtros selecionados.
              </div>
            )}
          </div>

        </div>
      )}
      
    </div>
  );
}