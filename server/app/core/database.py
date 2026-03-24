from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv
import os
from pathlib import Path

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    server_root = Path(__file__).resolve().parents[2]
    DATABASE_URL = f"sqlite:///{(server_root / 'app.db').as_posix()}"
elif DATABASE_URL.startswith("sqlite:///./"):
    # Resolve relative sqlite path against server root for consistent behavior
    # no matter where uvicorn is started from.
    server_root = Path(__file__).resolve().parents[2]
    relative_part = DATABASE_URL.replace("sqlite:///./", "", 1)
    DATABASE_URL = f"sqlite:///{(server_root / relative_part).as_posix()}"

engine_kwargs = {}
if DATABASE_URL.startswith("sqlite"):
    engine_kwargs["connect_args"] = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, **engine_kwargs)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
