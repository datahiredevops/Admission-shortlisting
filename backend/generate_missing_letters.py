import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import models, utils_pdf

# 1. Connect to Neon DB
# Ensure you have run: export DATABASE_URL="..." in your terminal first
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")
if not SQLALCHEMY_DATABASE_URL:
    print("❌ Error: DATABASE_URL is not set. Run 'export DATABASE_URL=...' first.")
    exit()

# Fix URL for SQLAlchemy
if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

def fix_missing_letters():
    print("🔍 Scanning for Accepted students with missing letters...")
    
    # Find students who are Accepted but have NO letter
    students = db.query(models.StudentApplication).filter(
        models.StudentApplication.application_status.in_(["Accepted", "Offer Accepted", "Admission Confirmed"]),
        models.StudentApplication.admit_letter_url == None
    ).all()
    
    if not students:
        print("✅ Everyone has a letter!")
        return

    print(f"⚠️ Found {len(students)} students. Generating PDFs now...\n")

    for app in students:
        try:
            # 1. Get Details
            course = app.course_pref_1
            inst_name = app.institution.name if app.institution else "Sairam Institution"
            inst_type = app.institution.institution_type if app.institution else "College"
            
            print(f"   > Generating for {app.full_name}...")

            # 2. Generate PDF
            filename = utils_pdf.generate_admit_letter(
                student_name=app.full_name,
                course=course,
                ref_id=app.application_ref_id,
                institution_name=inst_name,
                institution_type=inst_type
            )
            
            # 3. Save to DB
            app.admit_letter_url = filename
            db.commit()
            print(f"     ✅ Saved: {filename}")
            
        except Exception as e:
            print(f"     ❌ Failed for {app.full_name}: {e}")

    print("\n🎉 All Done! Now the Dashboard will show the buttons.")

if __name__ == "__main__":
    fix_missing_letters()