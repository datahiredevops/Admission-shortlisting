import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import models, utils_pdf

# 1. Connect to Neon DB
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")
if not SQLALCHEMY_DATABASE_URL:
    print("❌ Error: DATABASE_URL is not set.")
    exit()

if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

def fix_all_letters():
    print("🚀 Re-Generating Cloud Letters with correct Extension (.pdf)...")
    
    students = db.query(models.StudentApplication).filter(
        models.StudentApplication.application_status.in_(["Accepted", "Offer Accepted", "Admission Confirmed"])
    ).all()
    
    print(f"🔍 Processing {len(students)} students...\n")

    for app in students:
        try:
            print(f"   > Processing {app.full_name}...")
            inst_name = app.institution.name if app.institution else "Sairam Institution"
            inst_type = app.institution.institution_type if app.institution else "College"

            # This now uses the UPDATED function which adds .pdf
            cloud_url = utils_pdf.generate_admit_letter(
                student_name=app.full_name,
                course=app.course_pref_1,
                ref_id=app.application_ref_id,
                institution_name=inst_name,
                institution_type=inst_type
            )
            
            if cloud_url:
                app.admit_letter_url = cloud_url
                db.commit()
                print(f"     ✅ Fixed: {cloud_url}")
            
        except Exception as e:
            print(f"     ⚠️ Error: {e}")

    print("\n✅ All letters updated successfully!")

if __name__ == "__main__":
    fix_all_letters()