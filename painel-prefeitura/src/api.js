export const API_URL = 'http://127.0.0.1:8000';

export async function buscarChamados() {
  const response = await fetch(`${API_URL}/ocorrencias`);
  if (!response.ok) {
    throw new Error('Erro ao buscar chamados da API');
  }
  return response.json();
}

export async function criarChamado(dados) {
  const response = await fetch(`${API_URL}/ocorrencias`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  });
  if (!response.ok) {
    throw new Error('Erro ao criar chamado');
  }
  return response.json();
}

export async function atualizarStatusChamado(id, status) {
  const response = await fetch(`${API_URL}/ocorrencias/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) {
    throw new Error('Erro ao atualizar status');
  }
  return response.json();
}

export async function atualizarPrioridadeChamado(id, prioridade) {
  const response = await fetch(`${API_URL}/ocorrencias/${encodeURIComponent(id)}/prioridade`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prioridade }),
  });
  if (!response.ok) {
    throw new Error('Erro ao atualizar prioridade');
  }
  return response.json();
}

export async function enviarFotoChamado(arquivo) {
  const formData = new FormData();
  formData.append('arquivo', arquivo);

  const response = await fetch(`${API_URL}/upload/foto`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) {
    throw new Error('Erro ao enviar foto');
  }
  return response.json();
}

export async function buscarCidadaos() {
  const response = await fetch(`${API_URL}/cidadaos`);
  if (!response.ok) {
    throw new Error('Erro ao buscar cidadãos');
  }
  return response.json();
}
