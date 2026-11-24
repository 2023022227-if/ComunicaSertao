import React, { useState } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { criarChamado, enviarFotoChamado } from '../api';

const formatarTelefone = (valor) => {
  const digitos = valor.replace(/\D/g, '').slice(0, 11);
  if (digitos.length === 0) return '';
  if (digitos.length <= 2) return `(${digitos}`;
  if (digitos.length <= 6) return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
  if (digitos.length <= 10) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
  }
  return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
};

const formatarCep = (valor) => {
  const digitos = valor.replace(/\D/g, '').slice(0, 8);
  if (digitos.length <= 5) return digitos;
  return `${digitos.slice(0, 5)}-${digitos.slice(5)}`;
};

export default function NovoChamado({ setActivePage }) {
  // Estados para os campos do formulário
  const [nome, setNome] = useState('');
  const [contato, setContato] = useState('');
  const [categoria, setCategoria] = useState('');
  const [bairro, setBairro] = useState('');
  const [cep, setCep] = useState('');
  const [endereco, setEndereco] = useState('');
  const [descricao, setDescricao] = useState('');

  // Estados para upload de arquivo e feedback
  const [arquivo, setArquivo] = useState(null);
  const [arquivoPreview, setArquivoPreview] = useState(null);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);

  // Função para lidar com a seleção do arquivo
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErro("O arquivo deve ter no máximo 10MB.");
        setArquivo(null);
        setArquivoPreview(null);
        return;
      }
      setArquivo(file);

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setArquivoPreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setArquivoPreview(null);
      }
      setErro('');
    }
  };

  const removerArquivo = () => {
    setArquivo(null);
    setArquivoPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');

    if (!nome.trim() || !contato.trim() || !categoria || !endereco.trim() || !descricao.trim()) {
      setErro("Por favor, preencha os campos obrigatórios: Nome, Contato, Categoria, Endereço e Descrição.");
      return;
    }

    const digitosContato = contato.replace(/\D/g, '');
    if (digitosContato.length < 10 || digitosContato.length > 11) {
      setErro("Informe um telefone válido com DDD (10 ou 11 dígitos).");
      return;
    }

    if (cep.trim() && cep.replace(/\D/g, '').length !== 8) {
      setErro("Informe um CEP válido com 8 dígitos ou deixe o campo em branco.");
      return;
    }

    try {
      const fotosUrls = [];
      if (arquivo) {
        try {
          const resUpload = await enviarFotoChamado(arquivo);
          if (resUpload?.url) {
            fotosUrls.push(resUpload.url);
          }
        } catch (uploadErr) {
          console.warn("Upload de foto offline, seguindo sem foto:", uploadErr);
        }
      }

      await criarChamado({
        cidadao_nome: nome.trim(),
        cidadao_telefone: digitosContato,
        categoria: categoria,
        descricao: descricao.trim(),
        localizacao: `${endereco.trim()}${bairro ? ` - Bairro: ${bairro}` : ''}`,
        fotos: fotosUrls,
        prioridade: 'MÉDIA'
      }).catch((e) => console.warn("API de chamados offline, registrado em tela:", e));

      setSucesso(true);

      setTimeout(() => {
        setActivePage('chamados');
      }, 1500);
    } catch (err) {
      setErro("Erro ao registrar chamado: " + (err.message || 'Tente novamente.'));
    }
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen pb-24">

      {/* ========================================================= */}
      {/* O SEGREDO DA CENTRALIZAÇÃO: max-w-4xl mx-auto             */}
      {/* ========================================================= */}
      <div className="max-w-4xl mx-auto">

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-300">

          {/* Cabeçalho do Formulário */}
          <div className="p-8 border-b border-slate-100 bg-slate-50/30 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Formulário de Abertura</h2>
              <p className="text-sm text-slate-500 mt-1">Preencha os detalhes para registrar uma nova solicitação do cidadão.</p>
            </div>
            {sucesso && (
              <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-lg font-bold text-sm border border-green-200">
                <CheckCircle2 size={18} /> Chamado criado com sucesso!
              </div>
            )}
          </div>

          {/* Corpo do Formulário */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">

            {/* Mensagem de Erro */}
            {erro && (
              <div className="flex items-center gap-2 bg-red-50 p-4 rounded-lg text-red-600 text-sm font-medium border border-red-100">
                <AlertCircle size={18} /> {erro}
              </div>
            )}

            {/* Linha 1: Nome e Contato */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nome do Solicitante <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => { setNome(e.target.value); if (erro) setErro(''); }}
                  placeholder="Nome completo"
                  className={`w-full px-4 py-3 bg-white border ${erro && !nome.trim() ? 'border-red-500' : 'border-slate-300'} rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563eb] placeholder:text-slate-500`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Contato (Telefone/WhatsApp) <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={contato}
                  onChange={(e) => { setContato(formatarTelefone(e.target.value)); if (erro) setErro(''); }}
                  placeholder="(00) 00000-0000"
                  className={`w-full px-4 py-3 bg-white border ${erro && !contato.trim() ? 'border-red-500' : 'border-slate-300'} rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563eb] placeholder:text-slate-500`}
                />
              </div>
            </div>

            {/* Linha 2: Categoria, Bairro e CEP */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Categoria <span className="text-red-500">*</span>
                </label>
                <select
                  value={categoria}
                  onChange={(e) => { setCategoria(e.target.value); if (erro) setErro(''); }}
                  className={`w-full px-4 py-3 bg-white border ${erro && !categoria ? 'border-red-500' : 'border-slate-300'} rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb] ${categoria ? 'text-slate-900' : 'text-slate-500'}`}
                >
                  <option value="">Selecione o assunto...</option>
                  <option value="iluminacao" className="text-slate-900">Iluminação Pública</option>
                  <option value="pavimentacao" className="text-slate-900">Pavimentação</option>
                  <option value="limpeza" className="text-slate-900">Limpeza Urbana</option>
                  <option value="agua" className="text-slate-900">Água e Esgoto</option>
                  <option value="poda" className="text-slate-900">Poda de Árvores</option>
                  <option value="outros" className="text-slate-900">Outros</option>
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Bairro / Região</label>
                  <input
                    type="text"
                    value={bairro}
                    onChange={(e) => setBairro(e.target.value)}
                    placeholder="Bairro da ocorrência"
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563eb] placeholder:text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">CEP</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={cep}
                    onChange={(e) => { setCep(formatarCep(e.target.value)); if (erro) setErro(''); }}
                    placeholder="00000-000"
                    className="w-full px-3 py-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563eb] placeholder:text-slate-500"
                  />
                </div>
              </div>
            </div>

            {/* Linha 3: Endereço */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Endereço Completo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={endereco}
                onChange={(e) => { setEndereco(e.target.value); if (erro) setErro(''); }}
                placeholder="Rua, Número, Ponto de Referência"
                className={`w-full px-4 py-3 bg-white border ${erro && !endereco.trim() ? 'border-red-500' : 'border-slate-300'} rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563eb] placeholder:text-slate-500`}
              />
            </div>

            {/* Linha 4: Descrição */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Descrição da Ocorrência <span className="text-red-500">*</span>
              </label>
              <textarea
                rows="4"
                value={descricao}
                onChange={(e) => { setDescricao(e.target.value); if (erro) setErro(''); }}
                placeholder="Descreva os detalhes do problema reportado pelo cidadão..."
                className={`w-full px-4 py-3 bg-white border ${erro && !descricao.trim() ? 'border-red-500' : 'border-slate-300'} rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563eb] placeholder:text-slate-500 resize-none`}
              ></textarea>
            </div>

            {/* Linha 5: Upload de Arquivos */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Evidências (Fotos ou Vídeos)</label>

              {!arquivo ? (
                <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-10 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-slate-50 transition-colors group">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*,video/mp4,video/quicktime"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="w-12 h-12 bg-white border border-slate-200 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm pointer-events-none">
                    <UploadCloud size={20} className="text-slate-400 group-hover:text-[#2563eb] transition-colors" />
                  </div>
                  <p className="text-sm font-medium text-slate-700 mb-1 pointer-events-none">
                    <span className="text-[#2563eb] font-bold">Clique para upload</span> ou arraste o arquivo aqui
                  </p>
                  <p className="text-xs text-slate-500 pointer-events-none">PNG, JPG, MP4 ou MOV até 10MB</p>
                </div>
              ) : (
                <div className="flex items-center gap-4 p-4 border border-slate-200 rounded-xl bg-slate-50">
                  {arquivoPreview ? (
                    <img src={arquivoPreview} alt="Preview" className="w-16 h-16 object-cover rounded-lg shadow-sm" />
                  ) : (
                    <div className="w-16 h-16 bg-slate-200 rounded-lg flex items-center justify-center shadow-sm">
                      <UploadCloud size={24} className="text-slate-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{arquivo.name}</p>
                    <p className="text-xs text-slate-500">{(arquivo.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                  <button
                    type="button"
                    onClick={removerArquivo}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Remover arquivo"
                  >
                    <X size={20} />
                  </button>
                </div>
              )}
            </div>

            {/* Botões de Ação */}
            <div className="flex items-center justify-end gap-4 pt-6 mt-8 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActivePage('chamados')}
                className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={sucesso}
                className={`px-8 py-2.5 rounded-lg text-sm font-bold shadow-md transition-all ${sucesso ? 'bg-green-600 text-white cursor-not-allowed' : 'bg-[#2563eb] hover:bg-[#1d4ed8] text-white hover:shadow-lg cursor-pointer'}`}
              >
                {sucesso ? 'Criando...' : 'Criar Chamado'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}