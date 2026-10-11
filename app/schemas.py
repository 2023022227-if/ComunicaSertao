from pydantic import BaseModel, Field
from typing import Optional, List, Union
from datetime import datetime
from enum import Enum

class StatusOcorrencia(str, Enum):
    PENDENTE = "Pendente"
    EM_ANDAMENTO = "Em Andamento"
    CONCLUIDO = "Concluído"
    CANCELADO = "Cancelado"

class PrioridadeOcorrencia(str, Enum):
    BAIXA = "BAIXA"
    MEDIA = "MÉDIA"
    ALTA = "ALTA"

class CategoriaProblema(str, Enum):
    ILUMINACAO = "Iluminação Pública"
    PAVIMENTACAO = "Pavimentação"
    LIMPEZA = "Limpeza Urbana"
    AGUA_ESGOTO = "Água e Esgoto"
    PODA_ARVORES = "Poda de Árvores"
    OUTROS = "Outros"

class Cidadao(BaseModel):
    nome: str = Field(..., description="Nome do cidadão")
    telefone: str = Field(..., description="Número de WhatsApp com DDD")
    bairro: Optional[str] = Field(None, description="Bairro de residência")

class OcorrenciaBase(BaseModel):
    categoria: str
    descricao: str = Field(..., description="Descrição detalhada do problema")
    localizacao: str = Field(..., description="Endereço ou bairro em Sertão - RS")
    fotos: List[str] = Field(default=[], description="URLs das fotos anexadas")
    prioridade: Optional[str] = Field(default="MÉDIA", description="Prioridade do chamado")

class OcorrenciaCreate(OcorrenciaBase):
    cidadao_nome: str
    cidadao_telefone: str

class OcorrenciaUpdateStatus(BaseModel):
    status: str

class OcorrenciaUpdatePrioridade(BaseModel):
    prioridade: str

class OcorrenciaResponse(BaseModel):
    id: str
    numeric_id: int
    protocolo: str
    autor: str
    cidadao_nome: str
    cidadao_telefone: str
    titulo: str
    categoria: str
    descricao: str
    local: str
    localizacao: str
    fotos: List[str]
    status: str
    prioridade: str
    tempo: str
    mensagens: int
    anexos: int
    criado_em: datetime

class MensagemSimulador(BaseModel):
    telefone: str = Field(..., example="54999887766", description="Número de telefone do cidadão")
    mensagem: str = Field(..., example="Oi", description="Texto da mensagem enviada")
    url_foto: Optional[str] = Field(None, example=None, description="URL da foto se houver")
