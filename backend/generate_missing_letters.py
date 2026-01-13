import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

# 1. Try to get the Cloud Database URL from the environment (Render/Neon)
# 2. If not found, fall back to your local laptop database
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://neondb_owner:npg_vNcXiWoH1rF8@ep-steep-morning-aht60b75-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require")

# Fix for some cloud providers that use "postgres://" instead of "postgresql://"
if SQLALCHEMY_DATABASE_URL and SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()