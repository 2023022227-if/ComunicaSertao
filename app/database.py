"""
Configuração da conexão com o Banco de Dados através do SQLAlchemy.
Por padrão utiliza SQLite (arquivo local comunicasertao.db).
Para utilizar PostgreSQL no futuro, basta alterar a DATABASE_URL.
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# URL do banco. No futuro, pode vir de variável de ambiente (ex: DATABASE_URL do PostgreSQL)
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./comunicasertao.db")

# Criação do motor (engine) do banco
engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

# Fábrica de sessões do banco de dados
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Classe Base para a criação das tabelas (Models)
Base = declarative_base()


def get_db():
    """
    Função geradora (dependência do FastAPI) que abre uma conexão
    com o banco e garante seu fechamento após a requisição.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
