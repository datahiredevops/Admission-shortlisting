import cloudinary
import cloudinary.uploader
import os
import time
from fpdf import FPDF
from datetime import date

# --- CONFIGURATION ---
# ⚠️ KEEP YOUR EXISTING KEYS ⚠️
cloudinary.config( 
  cloud_name = "daijvvffo", 
  api_key = "748244124449685", 
  api_secret = "IZCnFaNy33ydkH8I7PEEOso4Dn0",
  secure = True
)

class AdmitLetterPDF(FPDF):
    def header(self):
        pass
    def footer(self):
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.set_text_color(128)
        self.cell(0, 10, 'This is a system-generated document. Valid without signature.', 0, 0, 'C')

def generate_admit_letter(student_name, course, ref_id, institution_name, institution_type):
    
    pdf = AdmitLetterPDF()
    pdf.add_page()
    
    # [ ... HEADER & BODY ... ]
    # Copying your standard logic here (abbreviated for clarity)
    pdf.set_font("Arial", 'B', 18)
    pdf.set_text_color(0, 51, 102)
    pdf.cell(0, 10, txt=institution_name.upper(), ln=True, align='C')
    pdf.ln(10)
    pdf.set_font("Arial", '', 12)
    pdf.set_text_color(0)
    
    today = date.today().strftime("%B %d, %Y")
    content = f"\nDate: {today}\nRef: {ref_id}\n\nDear {student_name},\n\nWe are pleased to inform you that you have been provisionally selected for admission into {institution_name}.\n\nCourse: {course}\n\nPlease login to the dashboard to pay fees.\n\nSincerely,\nPrincipal"
    pdf.multi_cell(0, 8, txt=content)

    # ==========================================
    # UPLOAD LOGIC (THE FIX)
    # ==========================================
    timestamp = int(time.time())
    
    # 1. REMOVE THE FOLDER PREFIX
    # Old: public_id=f"admit_letters/{ref_id}_{timestamp}"
    # New: public_id=f"{ref_id}_{timestamp}"  <-- Matches your Root folder
    
    temp_filename = f"letter_{ref_id}_{timestamp}.pdf"

    try:
        pdf.output(temp_filename)
        print(f"☁️ Uploading {temp_filename} to Cloudinary Root...")
        
        # 2. FORCE 'auto' (creates /image/upload/ link)
        upload_result = cloudinary.uploader.upload(
            temp_filename, 
            resource_type="auto",  
            public_id=f"{ref_id}_{timestamp}", # Unique ID in Root
            format="pdf"
        )
        
        # 3. Clean up
        if os.path.exists(temp_filename):
            os.remove(temp_filename)
            
        # The result URL should now look like: .../image/upload/v1234/SEC-2026-1001_1789.pdf
        return upload_result['secure_url']

    except Exception as e:
        print(f"❌ Upload Failed: {e}")
        return None