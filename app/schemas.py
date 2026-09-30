from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class StatusOcorrencia(str, Enum):
    ABERTO = "Aberto"
    EM_ANALISE = "Em Análise"
    RESOLVIDO = "Resolvido"

class CategoriaProblema(str, Enum):
    ILUMINACAO = "Iluminação Pública"
    BURACO_VIA = "Buraco / Pavimentação"
    SANEAMENTO = "Saneamento / Esgoto"
    LIMPEZA_PODA = "Limpeza Urbana e Poda"
    OUTROS = "Outros"

class Cidadao(BaseModel):
    nome: str = Field(..., description="Nome do cidadão")
    telefone: str = Field(..., description="Número de WhatsApp com DDD")
    bairro: Optional[str] = Field(None, description="Bairro de residência")

class OcorrenciaBase(BaseModel):
    categoria: CategoriaProblema
    descricao: str = Field(..., description="Descrição detalhada do problema")
    localizacao: str = Field(..., description="Endereço ou ponto de referência em Sertão - RS")
    fotos: List[str] = Field(default=[], description="URLs das fotos anexadas")

class OcorrenciaCreate(OcorrenciaBase):
    cidadao_nome: str
    cidadao_telefone: str

class OcorrenciaUpdateStatus(BaseModel):
    status: StatusOcorrencia

class OcorrenciaResponse(OcorrenciaBase):
    id: int
    protocolo: str
    cidadao_nome: str
    cidadao_telefone: str
    status: StatusOcorrencia
    criado_em: datetime

class MensagemSimulador(BaseModel):
    telefone: str = Field(..., example="54999887766", description="Número de telefone do cidadão")
    mensagem: str = Field(..., example="Oi", description="Texto da mensagem enviada")
    url_foto: Optional[str] = Field(None, example=None, description="URL da foto se houver")

