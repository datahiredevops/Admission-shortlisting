from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base, AdminUser
from database import SQLALCHEMY_DATABASE_URL
from auth import get_password_hash

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

def create_super_admin():
    print("🏢 Creating Management (Chairman) Account...")
    
    email = "chairman@sairam.edu.in"
    
    # Check if exists
    if db.query(AdminUser).filter_by(email=email).first():
        print(f"⚠️ Account {email} already exists.")
        return

    # Create Admin with NO Institution ID (The Key Difference)
    new_admin = AdminUser(
        full_name="Dr. Leo Muthu",
        email=email,
        password_hash=get_password_hash("admin123"), 
        position="Chairman",
        institution_id=None # <--- This makes them a SUPER ADMIN
    )
    
    db.add(new_admin)
    db.commit()
    print(f"✅ Success! Login with: {email} / admin123")

if __name__ == "__main__":
    create_super_admin()