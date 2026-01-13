from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

# ==========================================
# 1. MASTER DATA (The Hierarchy)
# ==========================================

class Institution(Base):
    """
    Stores the list of Colleges/Schools (e.g., Sairam Engineering, Sairam Matriculation).
    """
    __tablename__ = "institutions"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)  # e.g., "Sairam Engineering College"
    code = Column(String, unique=True, index=True)  # e.g., "SEC" (Used for ID generation)
    institution_type = Column(String)               # "Engineering", "Medical", "School", "Polytechnic"
    location = Column(String)                       # e.g., "West Tambaram"
    admin_domain = Column(String)                   # e.g., "@sairam.edu.in"
    
    # Relationships
    departments = relationship("Department", back_populates="institution")
    applications = relationship("StudentApplication", back_populates="institution")


class Department(Base):
    """
    Stores Courses or Grades (e.g., CSE, MBBS, Class VI).
    """
    __tablename__ = "departments"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)                           # e.g., "Computer Science", "Class I"
    
    institution_id = Column(Integer, ForeignKey("institutions.id"))
    institution = relationship("Institution", back_populates="departments")


# ==========================================
# 2. ADMIN SYSTEM
# ==========================================

class AdminUser(Base):
    """
    Principals, Admission Officers, and Management (Chairman).
    """
    __tablename__ = "admins"
    
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    position = Column(String)       # e.g., "Principal", "Chairman"
    
    # Hierarchy Link: Which college do they manage?
    # Note: If this is NULL, they are a SUPER ADMIN (Management)
    institution_id = Column(Integer, ForeignKey("institutions.id"), nullable=True)
    institution = relationship("Institution")


# ==========================================
# 3. STUDENT APPLICATION (The "Big" Table)
# ==========================================

class StudentApplication(Base):
    """
    Stores all application data for Engineering, Medical, Polytechnic, and Schools.
    """
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    
    # --- Context Links ---
    institution_id = Column(Integer, ForeignKey("institutions.id"))
    institution = relationship("Institution", back_populates="applications")

    # --- Identity & Tracking ---
    application_ref_id = Column(String, unique=True, index=True) # Generated: e.g., SEC-2026-1001
    is_draft = Column(Boolean, default=True)
    
    # --- Step 1: Basic Info (Shared & Specific) ---
    full_name = Column(String)         # Student Name or Child's Name
    email = Column(String, index=True) # Applicant's Personal Email
    mobile = Column(String)            # Student Mobile (College) or Parent Mobile (School)
    dob = Column(String)               # YYYY-MM-DD
    aadhaar_no = Column(String(12))
    
    # College Specifics (Step 1)
    board_of_study = Column(String, nullable=True) # State/CBSE
    sslc_reg_no = Column(String, nullable=True)    # <--- FIX: ADDED THIS COLUMN
    
    # School Specifics (Step 1)
    emis_number = Column(String, nullable=True)
    gender = Column(String, nullable=True)
    blood_group = Column(String, nullable=True)
    
    # --- Step 2: Course Preferences ---
    course_pref_1 = Column(String)
    course_pref_2 = Column(String, nullable=True)
    course_pref_3 = Column(String, nullable=True)
    has_siblings = Column(String)      # "Yes" / "No"

    # --- Step 3: Personal & Logistics ---
    community = Column(String)         # OC, BC, MBC... (Critical for College Quota)
    religion = Column(String, nullable=True)
    father_name = Column(String, nullable=True)
    father_mobile = Column(String, nullable=True)
    
    # School Logistics
    transport_needed = Column(String, nullable=True) # "Yes" / "No"

    address_city = Column(String, nullable=True)
    address_state = Column(String, nullable=True)
    
    # --- Step 4: Academic History ---
    
    # Polytechnic / 10th Marks
    sslc_marks_obtained = Column(String, nullable=True) 
    sslc_max_marks = Column(String, nullable=True)
    
    # Engineering/Medical Marks (12th / NEET)
    physics = Column(Float, nullable=True)    # Also stores NEET Score or Grade
    chemistry = Column(Float, nullable=True)
    maths = Column(Float, nullable=True)
    biology = Column(Float, nullable=True)
    pcm_average = Column(Float, nullable=True) # Stores Cutoff (Out of 200) or Percentage

    # School History (Transfer)
    previous_school_name = Column(String, nullable=True)
    previous_board = Column(String, nullable=True)
    transfer_certificate_status = Column(String, nullable=True)
    
    # --- NEW: AI PREDICTION ---
    ai_probability = Column(Integer, nullable=True) # Stores calculated % chance (e.g., 92)

    admit_letter_url = Column(String, nullable=True)

    # --- Step 5: Status & Decision ---
    is_management_quota = Column(Boolean, default=False)
    application_status = Column(String, default="Pending")    # Pending, Accepted, Declined, Offer Accepted, Waitlisted
    qualification_status = Column(String, nullable=True)      # Qualified, Management Review
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    payment_status = Column(String, default="Pending") # "Pending", "Paid"
    amount_paid = Column(Float, default=0.0)           # e.g., 50000.0
    transaction_id = Column(String, nullable=True)     # e.g., "TXN_12345"
    payment_date = Column(DateTime, nullable=True)