from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Update 'password' with your actual DB password
SQLALCHEMY_DATABASE_URL = "postgresql://postgres@localhost/college_admission_db"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()