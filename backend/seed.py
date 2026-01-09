from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base, Institution, Department, AdminUser
from database import SQLALCHEMY_DATABASE_URL
from auth import get_password_hash # Make sure you created auth.py in the previous step!

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

def seed_data():
    print("🌱 Seeding Master Data...")
    Base.metadata.create_all(bind=engine)
    
    # 1. Add Institution (SEC)
    sec = db.query(Institution).filter_by(code="SEC").first()
    if not sec:
        sec = Institution(
            name="Sairam Engineering College",
            code="SEC",
            institution_type="Engineering",
            location="West Tambaram",
            admin_domain="@sairam.edu.in"
        )
        db.add(sec)
        db.commit()
        db.refresh(sec)
        print(f"✅ Added Institution: {sec.name}")
    
    # 2. Add Courses
    courses = [
        "Computer Science and Engineering", "Civil Engineering", 
        "Electronics and Communication Engineering", "Electrical and Electronics Engineering", 
        "Information Technology", "Mechanical Engineering", 
        "Artificial Intelligence and Data Science", "Cyber Security"
    ]
    
    for course_name in courses:
        if not db.query(Department).filter_by(name=course_name, institution_id=sec.id).first():
            db.add(Department(name=course_name, institution_id=sec.id))
    
    db.commit()

    # 3. Add Default Admin (Principal)
    admin_email = "admin@sairam.edu.in"
    if not db.query(AdminUser).filter_by(email=admin_email).first():
        admin = AdminUser(
            full_name="Dr. Principal",
            email=admin_email,
            password_hash=get_password_hash("admin123"), # Default Password
            position="Principal",
            institution_id=sec.id # Link to SEC
        )
        db.add(admin)
        db.commit()
        print(f"👤 Added Default Admin: {admin_email} (Pass: admin123)")

    print("🎉 Seeding Complete!")

if __name__ == "__main__":
    seed_data()