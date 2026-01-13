import os
import pandas as pd
from sqlalchemy.orm import Session
import models
from datetime import date

# Optional: Import OpenAI if you have a key
try:
    from openai import OpenAI
    client = OpenAI(api_key="YOUR_OPENAI_API_KEY_HERE") 
    HAS_OPENAI = False 
except:
    HAS_OPENAI = False

def ask_admission_agent(question: str, db: Session, institution_id: int = None):
    """
    AI Brain with Role-Based Access Control.
    - institution_id: None (Management) or Integer (Principal)
    """
    question = question.lower()
    
    # --- GUARDRAIL 1: REVENUE BLOCK FOR PRINCIPALS ---
    # If a specific college admin asks for money, block them immediately.
    if institution_id is not None:
        if any(word in question for word in ["revenue", "collected", "money", "fee", "amount", "paid"]):
            return "🚫 Access Denied: Financial data is restricted to Management only."

    # --- 1. FETCH CONTEXT (DATA) ---
    apps = db.query(models.StudentApplication).all()
    institutions = db.query(models.Institution).all()
    inst_map = {inst.id: inst.name for inst in institutions}

    data = []
    for app in apps:
        data.append({
            "status": app.application_status,
            "college_name": inst_map.get(app.institution_id, "Unknown"),
            "college_id": app.institution_id,
            "amount": app.amount_paid or 0,
            "payment": app.payment_status,
            "date": app.created_at.strftime("%Y-%m-%d")
        })
    
    df = pd.DataFrame(data)

    # --- GUARDRAIL 2: DATA SCOPE FILTER ---
    # If it's a Principal, THROW AWAY all data not related to their college.
    if institution_id is not None:
        df = df[df['college_id'] == institution_id]
        
        # If no data found for this college
        if df.empty:
            return "No application data found for your institution yet."

    # --- 2. THE INTELLIGENCE (Pattern Matching) ---

    # REVENUE QUERY (Only Management reaches here because of Guardrail 1)
    if "revenue" in question or "collected" in question:
        total_revenue = df[df['payment'] == 'Paid']['amount'].sum()
        return f"The total revenue collected is ₹ {total_revenue:,.2f}."
    
    # PENDING QUERY
    if "pending" in question:
        count = len(df[df['status'] == 'Pending'])
        return f"There are currently {count} applications pending review."
    
    # ADMISSION COUNT QUERY
    if "how many" in question and ("admission" in question or "accepted" in question or "admitted" in question):
        count = len(df[df['status'].isin(['Accepted', 'Offer Accepted', 'Admission Confirmed'])])
        return f"Total admitted students: {count}."

    # LIST COLLEGES (Management sees all, Principal sees only theirs)
    if "college" in question or "where" in question or "list" in question or "breakdown" in question:
        admitted = df[df['status'].isin(['Accepted', 'Offer Accepted', 'Admission Confirmed'])]
        
        if admitted.empty:
            return "No students have been admitted yet."
        
        counts = admitted['college_name'].value_counts()
        response = "Here is the breakdown:\n"
        for college, count in counts.items():
            response += f"- {college}: {count} student(s)\n"
        return response

    # TOTAL APPS
    if "total application" in question or "how many applied" in question:
        return f"Total applications received: {len(df)}."
    
    # DAILY STATS
    if "today" in question:
        today_str = date.today().strftime("%Y-%m-%d")
        today_count = len(df[df['date'] == today_str])
        return f"Received {today_count} applications today."

    # --- 3. REAL AI FALLBACK ---
    if HAS_OPENAI:
        try:
            # (Logic remains same, but using the filtered 'df')
            pass
        except:
            pass

    return "I can help with admission stats. Try asking: 'How many pending?', 'Total Admitted', or 'Admissions today'."