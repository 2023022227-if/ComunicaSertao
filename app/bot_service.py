"""
Módulo responsável pelo fluxo conversacional (Máquina de Estados) do bot ComunicaSertão.
Ele guarda em que etapa da conversa cada cidadão está com base no número de telefone.
"""

from typing import Dict, Optional, List
from enum import Enum
from datetime import datetime
from app.schemas import CategoriaProblema, StatusOcorrencia

class EstadoConversa(str, Enum):
    INICIO = "inicio"
    AGUARDANDO_NOME = "aguardando_nome"
    AGUARDANDO_CATEGORIA = "aguardando_categoria"
    AGUARDANDO_DESCRICAO = "aguardando_descricao"
    AGUARDANDO_LOCALIZACAO = "aguardando_localizacao"
    AGUARDANDO_FOTO = "aguardando_foto"
    FINALIZADO = "finalizado"

# Mapeamento do menu numérico para as categorias reais do sistema
MAPA_CATEGORIAS = {
    "1": CategoriaProblema.ILUMINACAO,
    "2": CategoriaProblema.BURACO_VIA,
    "3": CategoriaProblema.SANEAMENTO,
    "4": CategoriaProblema.LIMPEZA_PODA,
    "5": CategoriaProblema.OUTROS,
}

# Armazena as sessões ativas dos usuários na memória: { telefone: { estado, dados } }
sessoes_ativas: Dict[str, dict] = {}


def obter_ou_criar_sessao(telefone: str) -> dict:
    """Busca a sessão do usuário ou cria uma nova se for o primeiro contato."""
    if telefone not in sessoes_ativas:
        sessoes_ativas[telefone] = {
            "estado": EstadoConversa.INICIO,
            "dados": {
                "cidadao_nome": "",
                "cidadao_telefone": telefone,
                "categoria": None,
                "descricao": "",
                "localizacao": "",
                "fotos": []
            }
        }
    return sessoes_ativas[telefone]


def reiniciar_sessao(telefone: str):
    """Limpa o fluxo para uma nova ocorrência futura."""
    if telefone in sessoes_ativas:
        del sessoes_ativas[telefone]


def processar_mensagem(
    telefone: str,
    texto: str,
    url_foto: Optional[str] = None,
    db_ocorrencias_ref: Optional[List[dict]] = None
) -> str:
    """
    Processa a mensagem recebida de um telefone e retorna a resposta que o bot deve enviar.
    """
    sessao = obter_ou_criar_sessao(telefone)
    estado = sessao["estado"]
    dados = sessao["dados"]
    texto_limpo = texto.strip()

    # Comando global para cancelar / reiniciar
    if texto_limpo.lower() in ["cancelar", "sair", "reiniciar"]:
        reiniciar_sessao(telefone)
        return "❌ Atendimento cancelado. Quando precisar, é só me mandar um *Oi* novamente!"

    # ETAPA 1: Boas-vindas e início
    if estado == EstadoConversa.INICIO:
        sessao["estado"] = EstadoConversa.AGUARDANDO_NOME
        return (
            "🏛️ *Bem-vindo(a) ao ComunicaSertão!* 🌿\n\n"
            "Este é o canal oficial para você relatar problemas urbanos diretamente para a Prefeitura de Sertão - RS.\n\n"
            "Para começarmos o seu atendimento, por favor, me informe o seu *Nome Completo*:"
        )

    # ETAPA 2: Recebendo o Nome
    elif estado == EstadoConversa.AGUARDANDO_NOME:
        if len(texto_limpo) < 3:
            return "Por favor, digite um nome válido com pelo menos 3 letras:"
        
        dados["cidadao_nome"] = texto_limpo
        sessao["estado"] = EstadoConversa.AGUARDANDO_CATEGORIA

        return (
            f"Prazer em falar com você, *{texto_limpo}*!\n\n"
            "Qual é o tipo de problema que você gostaria de relatar? Digite o *número* da opção correspondente:\n\n"
            "1️⃣ - 💡 Iluminação Pública (lâmpada queimada, poste)\n"
            "2️⃣ - 🕳️ Buraco / Pavimentação na rua\n"
            "3️⃣ - 🚰 Saneamento / Esgoto / Vazamento de água\n"
            "4️⃣ - 🌳 Limpeza Urbana, Lixo ou Poda de Árvore\n"
            "5️⃣ - 📌 Outros problemas"
        )

    # ETAPA 3: Recebendo a Categoria
    elif estado == EstadoConversa.AGUARDANDO_CATEGORIA:
        if texto_limpo not in MAPA_CATEGORIAS:
            return (
                "⚠️ Opção inválida. Por favor, digite apenas o *número* de 1 a 5 referente à sua ocorrência:\n"
                "1 - Iluminação | 2 - Buraco | 3 - Saneamento | 4 - Limpeza/Poda | 5 - Outros"
            )

        categoria_escolhida = MAPA_CATEGORIAS[texto_limpo]
        dados["categoria"] = categoria_escolhida
        sessao["estado"] = EstadoConversa.AGUARDANDO_DESCRICAO

        return (
            f"Opção selecionada: *{categoria_escolhida.value}*.\n\n"
            "Agora, descreva com detalhes o que está acontecendo (exemplo: gravidade, há quanto tempo existe o problema):"
        )

    # ETAPA 4: Recebendo a Descrição
    elif estado == EstadoConversa.AGUARDANDO_DESCRICAO:
        if len(texto_limpo) < 5:
            return "Por favor, forneça mais detalhes sobre o problema para que a prefeitura possa entender melhor:"

        dados["descricao"] = texto_limpo
        sessao["estado"] = EstadoConversa.AGUARDANDO_LOCALIZACAO

        return (
            "Entendido! 📝\n\n"
            "Onde fica esse problema? Por favor, informe o *Bairro, Rua e um Ponto de Referência* em Sertão:"
        )

    # ETAPA 5: Recebendo a Localização
    elif estado == EstadoConversa.AGUARDANDO_LOCALIZACAO:
        if len(texto_limpo) < 3:
            return "Por favor, informe a rua ou um ponto de referência para localizarmos o local:"

        dados["localizacao"] = texto_limpo
        sessao["estado"] = EstadoConversa.AGUARDANDO_FOTO

        return (
            "Perfeito! 📍\n\n"
            "Você tem uma *foto* do local para ajudar a equipe a identificar o problema?\n\n"
            "📸 Se tiver, envie a foto agora.\n"
            "👉 Se não tiver foto, digite apenas a palavra *PULAR*."
        )

    # ETAPA 6: Recebendo a Foto ou Pular
    elif estado == EstadoConversa.AGUARDANDO_FOTO:
        # Se enviou foto (URL)
        if url_foto:
            dados["fotos"].append(url_foto)
        elif texto_limpo.lower() not in ["pular", "não", "nao", "sem foto"]:
            return (
                "Para prosseguir, envie uma foto do local ou responda com a palavra *PULAR* caso não tenha foto:"
            )

        # FINALIZAÇÃO E REGISTRO DA OCORRÊNCIA
        if db_ocorrencias_ref is not None:
            novo_id = len(db_ocorrencias_ref) + 1
            protocolo = f"CMS-2026-{novo_id:04d}"
            
            nova_ocorrencia = {
                "id": novo_id,
                "protocolo": protocolo,
                "cidadao_nome": dados["cidadao_nome"],
                "cidadao_telefone": dados["cidadao_telefone"],
                "categoria": dados["categoria"],
                "descricao": dados["descricao"],
                "localizacao": dados["localizacao"],
                "fotos": dados["fotos"],
                "status": StatusOcorrencia.ABERTO,
                "criado_em": datetime.now()
            }
            db_ocorrencias_ref.append(nova_ocorrencia)
        else:
            protocolo = "CMS-2026-TESTE"

        # Mensagem final para o cidadão
        resposta = (
            "✅ *OCORRÊNCIA REGISTRADA COM SUCESSO!* 🏛️\n\n"
            f"📋 *Protocolo:* `{protocolo}`\n"
            f"👤 *Cidadão:* {dados['cidadao_nome']}\n"
            f"🛠️ *Tipo:* {dados['categoria'].value}\n"
            f"📍 *Local:* {dados['localizacao']}\n"
            f"🕒 *Status:* Aberto\n\n"
            "As informações já foram enviadas para o painel de atendimento da Prefeitura de Sertão.\n"
            "Agradecemos a sua colaboração para tornar Sertão uma cidade cada vez melhor! 🤝"
        )

        # Limpa a sessão para permitir um novo chamado no futuro
        reiniciar_sessao(telefone)
        return resposta

    return "Desculpe, ocorreu uma instabilidade. Digite *Oi* para reiniciar o atendimento."
