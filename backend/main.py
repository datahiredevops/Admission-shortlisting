from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import models, database, logic, auth

# Create tables (Auto-update if models changed)
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Sairam Group Admission Portal")

# CORS (Allows Frontend to talk to Backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# 1. SCHEMAS (Data Rules)
# ==========================================

# --- Institution & Courses ---
class InstitutionResponse(BaseModel):
    id: int
    name: str
    code: str
    institution_type: str

    class Config:
        from_attributes = True

class DepartmentSchema(BaseModel):
    id: int
    name: str
    
    class Config:
        from_attributes = True

# --- Student Application Submission ---
class ApplicationSchema(BaseModel):
    institution_id: int
    full_name: str
    email: str
    mobile: str
    
    # Optional fields (Schools might not have these)
    aadhaar_no: Optional[str] = None
    community: Optional[str] = None
    dob: Optional[str] = None
    
    # Marks (Optional default 0.0 for Schools)
    physics: Optional[float] = 0.0
    chemistry: Optional[float] = 0.0
    maths: Optional[float] = 0.0
    
    # Polytechnic / 10th Marks
    sslcMarksObtained: Optional[str] = None
    sslcMaxMarks: Optional[str] = None

    # Flags
    is_management_quota: bool = False
    
    # School Specific Fields
    emis_number: Optional[str] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    transport_needed: Optional[str] = None
    previous_school_name: Optional[str] = None
    previous_board: Optional[str] = None
    transfer_certificate_status: Optional[str] = None
    
    # Preferences
    course_pref_1: str
    course_pref_2: Optional[str] = None
    course_pref_3: Optional[str] = None
    
    # College Specific
    board_of_study: Optional[str] = None
    sslc_reg_no: Optional[str] = None
    
    # Parent Info
    father_name: Optional[str] = None
    father_mobile: Optional[str] = None
    address_city: Optional[str] = None
    address_state: Optional[str] = None

# --- Student Login & Actions ---
class StudentLoginSchema(BaseModel):
    email: str
    dob: str  # Format YYYY-MM-DD

class StudentActionSchema(BaseModel):
    action: str # "Accept" or "Decline"

class ProfileUpdateSchema(BaseModel):
    mobile: str
    email: str
    address_city: str
    address_state: str

# --- Admin Login ---
class AdminLoginSchema(BaseModel):
    email: str
    password: str

class StatusUpdateSchema(BaseModel):
    status: str  # "Accepted", "Declined"


# ==========================================
# 2. PUBLIC ENDPOINTS (Setup)
# ==========================================

@app.get("/")
def read_root():
    return {"status": "System Online", "cycle": "2026-27"}

@app.get("/institutions/", response_model=List[InstitutionResponse])
def get_institutions(db: Session = Depends(database.get_db)):
    return db.query(models.Institution).all()

@app.get("/institutions/{institution_id}/courses", response_model=List[DepartmentSchema])
def get_courses(institution_id: int, db: Session = Depends(database.get_db)):
    courses = db.query(models.Department).filter(models.Department.institution_id == institution_id).all()
    return courses


# ==========================================
# 3. APPLICATION SUBMISSION (The Core)
# ==========================================

@app.post("/submit-application/")
def submit_application(app_data: ApplicationSchema, db: Session = Depends(database.get_db)):
    
    # 1. Fetch Institution Type (CRITICAL for Logic)
    institution = db.query(models.Institution).filter(models.Institution.id == app_data.institution_id).first()
    if not institution:
        raise HTTPException(status_code=404, detail="Institution not found")
    
    inst_type = institution.institution_type 
    
    # --- PREPARE DATA FOR LOGIC ---
    try:
        sslc_obt = float(app_data.sslcMarksObtained) if app_data.sslcMarksObtained else 0.0
        sslc_max = float(app_data.sslcMaxMarks) if app_data.sslcMaxMarks else 500.0
    except:
        sslc_obt = 0.0
        sslc_max = 500.0

    # 2. Run Qualification Logic (With AI Prediction)
    result = logic.process_qualification(
        physics=app_data.physics or 0.0, 
        chemistry=app_data.chemistry or 0.0, 
        maths=app_data.maths or 0.0, 
        community=app_data.community or "OC",
        institution_type=inst_type,
        sslc_marks=sslc_obt,
        sslc_max=sslc_max
    )
    
    # 3. Handle Management Quota
    final_status = result["status"]
    if final_status == "Not Qualified" and app_data.is_management_quota:
        final_status = "Management Review"
    
    # 4. Create Database Record
    new_application = models.StudentApplication(
        institution_id=app_data.institution_id,
        full_name=app_data.full_name,
        email=app_data.email,
        mobile=app_data.mobile,
        dob=app_data.dob if app_data.dob else "2000-01-01",
        aadhaar_no=app_data.aadhaar_no,
        community=app_data.community,
        
        # --- FIX: SAVE ACADEMIC IDENTITY ---
        board_of_study=app_data.board_of_study, 
        sslc_reg_no=app_data.sslc_reg_no,
        # -----------------------------------
        
        # School Specifics
        emis_number=app_data.emis_number,
        gender=app_data.gender,
        blood_group=app_data.blood_group,
        transport_needed=app_data.transport_needed,
        previous_school_name=app_data.previous_school_name,
        previous_board=app_data.previous_board,
        transfer_certificate_status=app_data.transfer_certificate_status,
        
        # Preferences
        course_pref_1=app_data.course_pref_1,
        course_pref_2=app_data.course_pref_2,
        course_pref_3=app_data.course_pref_3,
        father_name=app_data.father_name,
        father_mobile=app_data.father_mobile,
        address_city=app_data.address_city,
        address_state=app_data.address_state,
        
        # Marks
        sslc_marks_obtained=str(sslc_obt),
        sslc_max_marks=str(sslc_max),
        physics=app_data.physics,
        chemistry=app_data.chemistry,
        maths=app_data.maths,
        
        # Logic Results
        pcm_average=result["score"], 
        ai_probability=result["ai_prediction"]["percentage"], # Save AI Score
        
        is_management_quota=app_data.is_management_quota,
        application_status="Pending",
        qualification_status=final_status
    )
    
    db.add(new_application)
    db.commit()
    db.refresh(new_application)
    
    # 5. Generate Reference ID
    code = institution.code if institution.code else "APP"
    ref_id = f"{code}-2026-{1000 + new_application.id}"
    
    new_application.application_ref_id = ref_id
    db.commit()
    
    return {
        "message": "Application Submitted Successfully",
        "app_id": new_application.id,
        "application_ref_id": ref_id,
        "final_status": final_status,
        "ai_probability": result["ai_prediction"]["percentage"]
    }


# ==========================================
# 4. STUDENT PORTAL (Login & Dashboard)
# ==========================================

@app.post("/student/login/")
def login_student(creds: StudentLoginSchema, db: Session = Depends(database.get_db)):
    # Verify Identity via Email + DOB
    student = db.query(models.StudentApplication).filter(
        models.StudentApplication.email == creds.email,
        models.StudentApplication.dob == creds.dob
    ).first()
    
    if not student:
        raise HTTPException(status_code=400, detail="Invalid Email or Date of Birth")
    
    # Return Identity Token (Email)
    return {
        "email": student.email,
        "full_name": student.full_name,
        "message": "Login Successful"
    }

@app.get("/student/lookup/")
def lookup_student_by_email(email: str, db: Session = Depends(database.get_db)):
    # Find the most recent application by this email for auto-fill
    student = db.query(models.StudentApplication).filter(
        models.StudentApplication.email == email
    ).order_by(models.StudentApplication.created_at.desc()).first()
    
    if not student:
        return {"found": False}
    
    # Return common fields for auto-fill
    return {
        "found": True,
        "full_name": student.full_name,
        "mobile": student.mobile,
        "dob": student.dob,
        "aadhaar_no": student.aadhaar_no,
        "community": student.community,
        "father_name": student.father_name,
        "father_mobile": student.father_mobile,
        "address_city": student.address_city,
        "address_state": student.address_state,
        "gender": student.gender,
        "blood_group": student.blood_group,
        "message": f"Welcome back, {student.full_name}! We auto-filled your details."
    }

@app.get("/student/my-applications/")
def get_student_applications(email: str, db: Session = Depends(database.get_db)):
    # Fetch ALL applications for this student email
    apps = db.query(models.StudentApplication).filter(
        models.StudentApplication.email == email
    ).all()
    
    result = []
    for app in apps:
        app_data = app.__dict__.copy()
        if "_sa_instance_state" in app_data:
            del app_data["_sa_instance_state"]
            
        if app.institution:
             app_data['institution_name'] = app.institution.name
             app_data['institution_type'] = app.institution.institution_type
        result.append(app_data)
        
    return result

@app.post("/student/respond-offer/")
def respond_to_offer(action: StudentActionSchema, application_id: str, db: Session = Depends(database.get_db)):
    app = db.query(models.StudentApplication).filter(models.StudentApplication.application_ref_id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Student not found")
    
    if action.action == "Accept":
        app.application_status = "Offer Accepted"
    elif action.action == "Decline":
        app.application_status = "Offer Declined"
    
    db.commit()
    return {"message": f"You have {action.action}ed the offer."}

@app.put("/student/update-profile/")
def update_student_profile(data: ProfileUpdateSchema, application_id: str, db: Session = Depends(database.get_db)):
    app = db.query(models.StudentApplication).filter(models.StudentApplication.application_ref_id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Student not found")
    
    app.mobile = data.mobile
    app.email = data.email
    app.address_city = data.address_city
    app.address_state = data.address_state
    
    db.commit()
    return {"message": "Profile updated successfully"}


# ==========================================
# 5. ADMIN PORTAL (Management & Principals)
# ==========================================

@app.post("/admin/login/")
def login_admin(creds: AdminLoginSchema, db: Session = Depends(database.get_db)):
    admin = db.query(models.AdminUser).filter_by(email=creds.email).first()
    if not admin:
        raise HTTPException(status_code=400, detail="Invalid Email")
    
    if not auth.verify_password(creds.password, admin.password_hash):
        raise HTTPException(status_code=400, detail="Invalid Password")
    
    # Handle Institution Info (Management has None)
    inst_name = admin.institution.name if admin.institution else "Sairam Group"
    inst_type = admin.institution.institution_type if admin.institution else "Management"

    return {
        "admin_id": admin.id,
        "name": admin.full_name,
        "institution_id": admin.institution_id, 
        "institution_name": inst_name, 
        "institution_type": inst_type,
        "role": "admin"
    }

@app.get("/admin/applications/{institution_id}")
def get_admin_applications(institution_id: int, db: Session = Depends(database.get_db)):
    # Fetch only applications for this specific college
    apps = db.query(models.StudentApplication).filter(models.StudentApplication.institution_id == institution_id).all()
    return apps

@app.put("/admin/application/{app_id}/status")
def update_status(app_id: int, update: StatusUpdateSchema, db: Session = Depends(database.get_db)):
    application = db.query(models.StudentApplication).filter(models.StudentApplication.id == app_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    application.application_status = update.status
    db.commit()
    return {"message": f"Application marked as {update.status}"}

# --- ANALYTICS ENDPOINT (For Chairman) ---
# --- UPDATED ANALYTICS ENDPOINT ---
@app.get("/admin/analytics/group-overview")
def get_group_analytics(db: Session = Depends(database.get_db)):
    # Fetch all institutions
    institutions = db.query(models.Institution).all()
    breakdown = []
    
    # Calculate global totals while looping
    global_total = 0
    
    for inst in institutions:
        # Get counts for this specific institution
        total = db.query(models.StudentApplication).filter(models.StudentApplication.institution_id == inst.id).count()
        accepted = db.query(models.StudentApplication).filter(models.StudentApplication.institution_id == inst.id, models.StudentApplication.application_status == "Accepted").count()
        declined = db.query(models.StudentApplication).filter(models.StudentApplication.institution_id == inst.id, models.StudentApplication.application_status == "Declined").count()
        waitlisted = db.query(models.StudentApplication).filter(models.StudentApplication.institution_id == inst.id, models.StudentApplication.application_status == "Waitlisted").count()
        pending = db.query(models.StudentApplication).filter(models.StudentApplication.institution_id == inst.id, models.StudentApplication.application_status == "Pending").count()
        
        breakdown.append({
            "id": inst.id,
            "name": inst.name,
            "type": inst.institution_type, # "Medical", "Engineering", etc.
            "stats": {
                "total": total,
                "accepted": accepted,
                "declined": declined,
                "waitlisted": waitlisted,
                "pending": pending
            }
        })
        global_total += total

    return {
        "overall_total": global_total,
        "breakdown": breakdown
    }