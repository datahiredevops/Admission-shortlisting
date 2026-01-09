from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base, AdminUser, Institution
from database import SQLALCHEMY_DATABASE_URL
from auth import get_password_hash

# 1. Connect to DB
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

def create_all_admins():
    print("🚀 Starting Bulk Admin Creation...\n")
    
    # Fetch all institutions from the DB
    institutions = db.query(Institution).all()
    
    if not institutions:
        print("❌ No institutions found! Please run 'python import_data.py' first.")
        return

    created_count = 0
    existing_count = 0

    print(f"{'INSTITUTION':<40} | {'LOGIN EMAIL':<35} | {'PASSWORD'}")
    print("-" * 90)

    for inst in institutions:
        # Generate a standard email: admin + domain
        # Example: admin@sairamschool.edu.in
        # If admin_domain is missing, fallback to code (e.g., admin@SEC.com)
        domain = inst.admin_domain if inst.admin_domain else f"@{inst.code.lower()}.edu"
        email = f"admin{domain}"
        
        # Check if this specific admin already exists
        existing_admin = db.query(AdminUser).filter_by(email=email).first()
        
        if existing_admin:
            existing_count += 1
            print(f"{inst.name[:38]:<40} | {email:<35} | (Already Exists)")
        else:
            # Create New Admin
            new_admin = AdminUser(
                full_name=f"Principal, {inst.code}",
                email=email,
                password_hash=get_password_hash("admin123"), # Default Password for everyone
                position="Head of Institution",
                institution_id=inst.id
            )
            db.add(new_admin)
            created_count += 1
            print(f"{inst.name[:38]:<40} | {email:<35} | admin123")
    
    db.commit()
    print("-" * 90)
    print(f"\n🎉 Summary: Created {created_count} new admins. Skipped {existing_count} existing.")

if __name__ == "__main__":
    create_all_admins()