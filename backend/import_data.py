import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
# CRITICAL: Import models so SQLAlchemy knows what tables to build
from models import Base, Institution, Department 
from database import SQLALCHEMY_DATABASE_URL

# 1. Connect to DB
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

def import_excel():
    print("🔨 Creating Database Tables...")
    # --- FIX IS HERE: Create tables if they don't exist ---
    Base.metadata.create_all(bind=engine)
    # ------------------------------------------------------

    print("📂 Reading 'institutions_master.xlsx'...")
    
    try:
        # Read the Excel File
        df = pd.read_excel("institutions_master.xlsx")
        
        # Loop through each row in the Excel sheet
        for index, row in df.iterrows():
            
            # Check if Institution exists (by Code)
            inst = db.query(Institution).filter_by(code=row['Code']).first()
            
            if not inst:
                print(f"➕ Adding New Institution: {row['Name']}")
                inst = Institution(
                    name=row['Name'],
                    code=row['Code'],
                    institution_type=row['Type'],
                    location=row['Location'],
                    admin_domain=row['Admin_Domain']
                )
                db.add(inst)
                db.commit()
                db.refresh(inst)
            else:
                print(f"🔄 Updating Existing: {row['Name']}")
            
            # Process Courses (Comma Separated in Excel)
            course_list = [c.strip() for c in str(row['Courses']).split(',')]
            
            for course_name in course_list:
                # Check if course exists
                dept = db.query(Department).filter_by(name=course_name, institution_id=inst.id).first()
                if not dept:
                    print(f"   ↳ Adding Course: {course_name}")
                    db.add(Department(name=course_name, institution_id=inst.id))
            
            db.commit()
            
        print("\n✅ Import Complete! Database is updated.")
        
    except FileNotFoundError:
        print("❌ Error: 'institutions_master.xlsx' not found. Please create it first.")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    import_excel()