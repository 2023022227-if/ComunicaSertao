import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2 } from 'lucide-react';
import { criarChamado, enviarFotoChamado } from '../api';

export default function NovoChamado({ setActivePage }) {
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [categoria, setCategoria] = useState('Iluminação Pública');
  const [bairro, setBairro] = useState('');
  const [endereco, setEndereco] = useState('');
  const [descricao, setDescricao] = useState('');
  const [prioridade, setPrioridade] = useState('MÉDIA');
  const [arquivoFoto, setArquivoFoto] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const fileInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nome.trim() || !descricao.trim()) {
      alert('Por favor, preencha pelo menos o nome do solicitante e a descrição da ocorrência.');
      return;
    }

    setEnviando(true);
    try {
      const fotosUrls = [];
      if (arquivoFoto) {
        const resUpload = await enviarFotoChamado(arquivoFoto);
        if (resUpload?.url) {
          fotosUrls.push(resUpload.url);
        }
      }

      const localCompleto = [endereco.trim(), bairro.trim()].filter(Boolean).join(' - ') || 'Centro - Sertão/RS';

      await criarChamado({
        cidadao_nome: nome.trim(),
        cidadao_telefone: telefone.trim() || '(54) 99999-0000',
        categoria: categoria || 'Outros',
        descricao: descricao.trim(),
        localizacao: localCompleto,
        fotos: fotosUrls,
        prioridade
      });

      setActivePage('chamados');
    } catch (erro) {
      console.error('Erro ao criar chamado:', erro);
      alert('Não foi possível salvar o chamado. Verifique se o servidor Back-end está rodando.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen pb-24">
      <div className="max-w-4xl mx-auto">

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-300">

          {/* Cabeçalho do Formulário */}
          <div className="p-8 border-b border-slate-100 bg-slate-50/30">
            <h2 className="text-xl font-bold text-slate-800">Formulário de Abertura</h2>
            <p className="text-sm text-slate-500 mt-1">Preencha os detalhes para registrar uma nova solicitação do cidadão diretamente no sistema.</p>
          </div>

          {/* Corpo do Formulário */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">

            {/* Linha 1: Nome e Contato */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Nome do Solicitante</label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Nome completo"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4b5e28] placeholder:text-slate-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Contato (Telefone/WhatsApp)</label>
                <input
                  type="text"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="(54) 99999-0000"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4b5e28] placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Linha 2: Categoria, Bairro e Prioridade */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Categoria</label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4b5e28] text-slate-700"
                >
                  <option value="Iluminação Pública">Iluminação Pública</option>
                  <option value="Pavimentação">Pavimentação</option>
                  <option value="Limpeza Urbana">Limpeza Urbana</option>
                  <option value="Água e Esgoto">Água e Esgoto</option>
                  <option value="Poda de Árvores">Poda de Árvores</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Bairro / Região</label>
                <input
                  type="text"
                  value={bairro}
                  onChange={(e) => setBairro(e.target.value)}
                  placeholder="Ex: Centro"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4b5e28] placeholder:text-slate-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Prioridade Inicial</label>
                <select
                  value={prioridade}
                  onChange={(e) => setPrioridade(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4b5e28] text-slate-700"
                >
                  <option value="BAIXA">Baixa</option>
                  <option value="MÉDIA">Média</option>
                  <option value="ALTA">Alta</option>
                </select>
              </div>
            </div>

            {/* Linha 3: Endereço */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Endereço Completo</label>
              <input
                type="text"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                placeholder="Rua, Número, Ponto de Referência"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4b5e28] placeholder:text-slate-400"
              />
            </div>

            {/* Linha 4: Descrição */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Descrição da Ocorrência</label>
              <textarea
                rows="4"
                required
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Descreva os detalhes do problema reportado pelo cidadão..."
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4b5e28] placeholder:text-slate-400 resize-none"
              ></textarea>
            </div>

            {/* Linha 5: Upload de Arquivos */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Evidências (Foto do Local)</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setArquivoFoto(e.target.files?.[0] || null)}
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 rounded-xl p-10 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer group"
              >
                <div className="w-12 h-12 bg-white border border-slate-200 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
                  {arquivoFoto ? (
                    <CheckCircle2 size={22} className="text-[#4b5e28]" />
                  ) : (
                    <UploadCloud size={20} className="text-slate-400 group-hover:text-[#4b5e28] transition-colors" />
                  )}
                </div>
                {arquivoFoto ? (
                  <p className="text-sm font-bold text-[#4b5e28] mb-1">
                    Foto selecionada: {arquivoFoto.name}
                  </p>
                ) : (
                  <p className="text-sm font-medium text-slate-700 mb-1">
                    <span className="text-[#4b5e28] font-bold">Clique para anexar uma foto</span> do computador
                  </p>
                )}
                <p className="text-xs text-slate-500">Formatos suportados: PNG, JPG, JPEG ou WEBP</p>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex items-center justify-end gap-4 pt-6 mt-8 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActivePage('chamados')}
                className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={enviando}
                className="px-8 py-2.5 bg-[#4b5e28] hover:bg-[#3a4920] disabled:opacity-50 text-white rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all"
              >
                {enviando ? 'Salvando...' : 'Criar Chamado'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}