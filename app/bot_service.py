"""
Módulo responsável pelo fluxo conversacional (Máquina de Estados) do bot ComunicaSertão.
Ele guarda em que etapa da conversa cada cidadão está com base no número de telefone.
"""

from typing import Dict, Optional, List
from enum import Enum
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.schemas import CategoriaProblema, StatusOcorrencia
from app.models import OcorrenciaModel


class EstadoConversa(str, Enum):
    INICIO = "inicio"
    AGUARDANDO_OPCAO_INICIAL = "aguardando_opcao_inicial"
    AGUARDANDO_PROTOCOLO = "aguardando_protocolo"
    AGUARDANDO_NOME = "aguardando_nome"
    AGUARDANDO_CATEGORIA = "aguardando_categoria"
    AGUARDANDO_DESCRICAO = "aguardando_descricao"
    AGUARDANDO_LOCALIZACAO = "aguardando_localizacao"
    AGUARDANDO_FOTO = "aguardando_foto"
    FINALIZADO = "finalizado"

# Mapeamento do menu numérico para as categorias do painel da prefeitura
MAPA_CATEGORIAS = {
    "1": CategoriaProblema.ILUMINACAO,
    "2": CategoriaProblema.PAVIMENTACAO,
    "3": CategoriaProblema.LIMPEZA,
    "4": CategoriaProblema.AGUA_ESGOTO,
    "5": CategoriaProblema.PODA_ARVORES,
    "6": CategoriaProblema.OUTROS,
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


def formatar_resposta_consulta(ocorrencia: OcorrenciaModel) -> str:
    """Formata a mensagem de retorno com o status atualizado do protocolo."""
    status_atual = (ocorrencia.status or "Pendente").strip()
    status_lower = status_atual.lower()

    if status_lower == "pendente":
        icone_status = "🟡"
        explicacao = "Sua solicitação já foi recebida e aguarda triagem da equipe responsável."
    elif status_lower == "em andamento":
        icone_status = "🔵"
        explicacao = "A equipe da Prefeitura já está trabalhando na resolução deste chamado!"
    elif status_lower == "concluído":
        icone_status = "🟢"
        explicacao = "O serviço referente a este chamado foi concluído pela Prefeitura."
    elif status_lower == "cancelado":
        icone_status = "🔴"
        explicacao = "Este chamado foi encerrado ou cancelado pela administração."
    else:
        icone_status = "📋"
        explicacao = "Chamado registrado no sistema municipal."

    data_str = ocorrencia.criado_em.strftime("%d/%m/%Y às %H:%M") if ocorrencia.criado_em else "Recente"

    return (
        "🔍 *CONSULTA DE PROTOCOLO - COMUNICASERTÃO*\n\n"
        f"📋 *Protocolo:* `{ocorrencia.protocolo}`\n"
        f"👤 *Solicitante:* {ocorrencia.cidadao_nome}\n"
        f"🛠️ *Categoria:* {ocorrencia.categoria}\n"
        f"📍 *Local:* {ocorrencia.localizacao}\n"
        f"📅 *Abertura:* {data_str}\n\n"
        f"{icone_status} *Status Atual:* *{status_atual.upper()}*\n"
        f"💬 _{explicacao}_\n\n"
        "Se precisar de mais alguma coisa, basta mandar um *Oi*!"
    )


def buscar_protocolo_no_banco(termo: str, db_session: Session) -> Optional[OcorrenciaModel]:
    """Busca uma ocorrência pelo código completo (ex: CMS-2026-0001) ou apenas pelos números finais."""
    limpo = termo.strip().upper().lstrip("#")
    ocorrencia = db_session.query(OcorrenciaModel).filter(
        func.upper(OcorrenciaModel.protocolo) == limpo
    ).first()

    if not ocorrencia and limpo.isdigit():
        codigo_formatado = f"CMS-2026-{int(limpo):04d}"
        ocorrencia = db_session.query(OcorrenciaModel).filter(
            func.upper(OcorrenciaModel.protocolo) == codigo_formatado
        ).first()
        if not ocorrencia:
            ocorrencia = db_session.query(OcorrenciaModel).filter(
                OcorrenciaModel.id == int(limpo)
            ).first()

    return ocorrencia


def processar_mensagem(
    telefone: str,
    texto: str,
    url_foto: Optional[str] = None,
    db_session: Optional[Session] = None,
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
    if texto_limpo.lower() in ["cancelar", "sair", "reiniciar", "menu"]:
        reiniciar_sessao(telefone)
        return "❌ Atendimento reiniciado. Quando precisar, é só me mandar um *Oi*!"

    # Atalho inteligente: se o cidadão digitar diretamente um código CMS-2026-XXXX em qualquer etapa inicial
    if texto_limpo.upper().startswith("CMS-") and db_session is not None:
        encontrada = buscar_protocolo_no_banco(texto_limpo, db_session)
        reiniciar_sessao(telefone)
        if encontrada:
            return formatar_resposta_consulta(encontrada)
        return (
            f"⚠️ Não encontramos nenhum chamado com o protocolo *{texto_limpo.upper()}*.\n\n"
            "Verifique o código digitado ou envie *Oi* para voltar ao menu inicial."
        )

    # ETAPA 1: Boas-vindas e Menu Principal (ou quando o cidadão envia "Oi" / recarrega a página)
    if estado == EstadoConversa.INICIO or texto_limpo.lower() in ["oi", "olá", "ola", "bom dia", "boa tarde", "boa noite", "início", "inicio"]:
        reiniciar_sessao(telefone)
        sessao = obter_ou_criar_sessao(telefone)
        sessao["estado"] = EstadoConversa.AGUARDANDO_OPCAO_INICIAL
        return (
            "🏛️ *Bem-vindo(a) ao ComunicaSertão!* 🌿\n\n"
            "Este é o canal oficial da Prefeitura de Sertão - RS para atendimento ao cidadão.\n\n"
            "Como podemos ajudar você hoje? Digite o *número* da opção desejada:\n\n"
            "1️⃣ - 📝 Relatar um novo problema urbano\n"
            "2️⃣ - 🔍 Consultar o andamento de um protocolo"
        )

    # ETAPA 1.5: Escolha entre Novo Chamado (1) ou Consultar Protocolo (2)
    elif estado == EstadoConversa.AGUARDANDO_OPCAO_INICIAL:
        if texto_limpo == "1" or texto_limpo.lower() in ["novo", "relatar", "abrir"]:
            sessao["estado"] = EstadoConversa.AGUARDANDO_NOME
            return (
                "Perfeito! Vamos registrar a sua solicitação. 📝\n\n"
                "Para começarmos, por favor, informe o seu *Nome Completo*:"
            )
        elif texto_limpo == "2" or texto_limpo.lower() in ["consultar", "protocolo", "status"]:
            sessao["estado"] = EstadoConversa.AGUARDANDO_PROTOCOLO
            dica_protocolos = ""
            if db_session is not None:
                meus_chamados = db_session.query(OcorrenciaModel).filter(
                    OcorrenciaModel.cidadao_telefone == telefone
                ).order_by(OcorrenciaModel.id.desc()).limit(3).all()
                if meus_chamados:
                    lista_codigos = ", ".join([f"`{c.protocolo}`" for c in meus_chamados])
                    dica_protocolos = f"\n\n💡 _Protocolos recentes deste telefone:_ {lista_codigos}"

            return (
                "🔍 *Consulta de Protocolo*\n\n"
                "Por favor, digite o *código do protocolo* que você recebeu (exemplo: `CMS-2026-0001`):"
                f"{dica_protocolos}"
            )
        else:
            return (
                "⚠️ Opção inválida. Por favor, digite:\n\n"
                "1️⃣ - Para *relatar um novo problema*\n"
                "2️⃣ - Para *consultar um protocolo existente*"
            )

    # ETAPA DE CONSULTA DE PROTOCOLO
    elif estado == EstadoConversa.AGUARDANDO_PROTOCOLO:
        if db_session is not None:
            encontrada = buscar_protocolo_no_banco(texto_limpo, db_session)
            if encontrada:
                reiniciar_sessao(telefone)
                return formatar_resposta_consulta(encontrada)

        return (
            f"⚠️ Não foi encontrado nenhum chamado com o protocolo *{texto_limpo.upper()}*.\n\n"
            "Por favor, confira o código e tente novamente (ex: `CMS-2026-0001`), ou digite *Cancelar* para voltar ao início."
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
            "1️⃣ - 💡 Iluminação Pública\n"
            "2️⃣ - 🕳️ Pavimentação (buracos na via)\n"
            "3️⃣ - 🧹 Limpeza Urbana\n"
            "4️⃣ - 🚰 Água e Esgoto\n"
            "5️⃣ - 🌳 Poda de Árvores\n"
            "6️⃣ - 📌 Outros"
        )

    # ETAPA 3: Recebendo a Categoria
    elif estado == EstadoConversa.AGUARDANDO_CATEGORIA:
        if texto_limpo not in MAPA_CATEGORIAS:
            return (
                "⚠️ Opção inválida. Por favor, digite apenas o *número* de 1 a 6 referente à sua ocorrência:\n"
                "1 - Iluminação Pública | 2 - Pavimentação | 3 - Limpeza Urbana | 4 - Água e Esgoto | 5 - Poda de Árvores | 6 - Outros"
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
        protocolo = "CMS-2026-0001"
        fotos_str = ",".join(dados["fotos"]) if dados["fotos"] else ""

        # Persistência no Banco de Dados Relacional (SQLite/PostgreSQL)
        if db_session is not None:
            total = db_session.query(OcorrenciaModel).count() + 1
            protocolo = f"CMS-2026-{total:04d}"
            
            nova_entidade = OcorrenciaModel(
                protocolo=protocolo,
                cidadao_nome=dados["cidadao_nome"],
                cidadao_telefone=dados["cidadao_telefone"],
                categoria=dados["categoria"].value if hasattr(dados["categoria"], "value") else str(dados["categoria"]),
                descricao=dados["descricao"],
                localizacao=dados["localizacao"],
                fotos=fotos_str,
                status=StatusOcorrencia.PENDENTE.value,
                prioridade="MÉDIA"
            )
            db_session.add(nova_entidade)
            db_session.commit()
            db_session.refresh(nova_entidade)

        # Suporte legado para lista em memória
        if db_ocorrencias_ref is not None:
            novo_id = len(db_ocorrencias_ref) + 1
            if db_session is None:
                protocolo = f"CMS-2026-{novo_id:04d}"
            
            nova_ocorrencia = {
                "id": protocolo,
                "numeric_id": novo_id,
                "protocolo": protocolo,
                "cidadao_nome": dados["cidadao_nome"],
                "cidadao_telefone": dados["cidadao_telefone"],
                "categoria": dados["categoria"],
                "descricao": dados["descricao"],
                "localizacao": dados["localizacao"],
                "fotos": dados["fotos"],
                "status": StatusOcorrencia.PENDENTE.value,
                "prioridade": "MÉDIA",
                "criado_em": datetime.now()
            }
            db_ocorrencias_ref.append(nova_ocorrencia)

        # Mensagem final para o cidadão
        resposta = (
            "✅ *OCORRÊNCIA REGISTRADA COM SUCESSO!* 🏛️\n\n"
            f"📋 *Protocolo:* `{protocolo}`\n"
            f"👤 *Cidadão:* {dados['cidadao_nome']}\n"
            f"🛠️ *Tipo:* {dados['categoria'].value}\n"
            f"📍 *Local:* {dados['localizacao']}\n"
            f"🕒 *Status:* Pendente\n\n"
            "Guarde o seu número de protocolo! Você pode consultar o andamento a qualquer momento por aqui.\n"
            "Agradecemos a sua colaboração para tornar Sertão uma cidade cada vez melhor! 🤝"
        )

        # Limpa a sessão para permitir um novo chamado no futuro
        reiniciar_sessao(telefone)
        return resposta

    return "Desculpe, ocorreu uma instabilidade. Digite *Oi* para reiniciar o atendimento."
