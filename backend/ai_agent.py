import os
import re
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
    Fine-Tuned AI Brain: Handles Lists, Score Filtering, and Lookups.
    """
    question = question.lower()
    
    # --- GUARDRAIL 1: REVENUE BLOCK FOR PRINCIPALS ---
    if institution_id is not None:
        if any(word in question for word in ["revenue", "collected", "money", "fee", "amount", "paid"]):
            return "🚫 Access Denied: Financial data is restricted to Management only."

    # --- 1. FETCH & PREPARE CONTEXT ---
    apps = db.query(models.StudentApplication).all()
    institutions = db.query(models.Institution).all()
    inst_map = {inst.id: inst.name for inst in institutions}

    data = []
    for app in apps:
        data.append({
            "name": app.full_name.title(),
            "status": app.application_status, # e.g., Accepted, Pending
            "college_name": inst_map.get(app.institution_id, "Unknown"),
            "college_id": app.institution_id,
            "amount": app.amount_paid or 0,
            "payment": app.payment_status,
            "course": app.course_pref_1,
            "score": app.pcm_average or app.physics or 0, # Fallback to physics for medical if pcm is 0
            "date": app.created_at.strftime("%Y-%m-%d")
        })
    
    df = pd.DataFrame(data)

    # --- GUARDRAIL 2: DATA SCOPE FILTER ---
    if institution_id is not None:
        df = df[df['college_id'] == institution_id]
        if df.empty: return "No application data found for your institution yet."

    # --- 2. INTELLIGENT LOGIC (The Upgrades) ---

    # A. LISTING LOGIC (Fix for Screenshot 1: "Which application is confirmed?")
    if any(q in question for q in ["which", "who", "give me", "list", "show", "names"]):
        target_status = None
        if "confirm" in question or "accept" in question or "admit" in question:
            target_status = ["Accepted", "Offer Accepted", "Admission Confirmed"]
        elif "waitlist" in question:
            target_status = ["Waitlisted"]
        elif "pending" in question:
            target_status = ["Pending"]
        elif "decline" in question:
            target_status = ["Declined"]

        if target_status:
            # Filter data
            filtered = df[df['status'].isin(target_status)]
            if filtered.empty: return f"No applications found with status: {target_status[0]}."
            
            # Create a nice list (Limit to top 5)
            names = filtered['name'].head(5).tolist()
            count = len(filtered)
            list_str = "\n- " + "\n- ".join(names)
            
            if count > 5: list_str += f"\n...and {count - 5} others."
            
            return f"Here are the {target_status[0]} applications:{list_str}"

    # B. SCORE FILTERING (Fix for Screenshot 2: "Who scored more than 70?")
    if "score" in question or "marks" in question or "cutoff" in question or "more than" in question or "above" in question:
        # Extract number from string (e.g., "70" from "more than 70")
        numbers = re.findall(r'\d+', question)
        if numbers:
            threshold = float(numbers[0])
            
            # Logic: Filter students with score > threshold
            filtered = df[df['score'] >= threshold]
            
            if filtered.empty:
                return f"No students found with a score higher than {threshold}."
            
            count = len(filtered)
            top_names = filtered.sort_values(by='score', ascending=False)['name'].head(5).tolist()
            list_str = "\n- " + "\n- ".join(top_names)
            if count > 5: list_str += f"\n...and {count - 5} others."

            return f"Found {count} students with score > {threshold}:{list_str}"

    # C. STUDENT LOOKUP ("Status of Sneha?")
    if "status" in question or "search" in question or "find" in question:
        for name in df['name']:
            if name.lower() in question:
                student = df[df['name'] == name].iloc[0]
                return f"👤 **{student['name']}**\n- Status: {student['status']}\n- Applied to: {student['college_name']}\n- Course: {student['course']}\n- Score: {student['score']}"
        
    # D. COURSE ANALYTICS ("Most popular course?")
    if "popular" in question or "course" in question or "preference" in question:
        if df.empty: return "Not enough data."
        top_course = df['course'].value_counts().idxmax()
        count = df['course'].value_counts().max()
        return f"📈 The most popular course is **{top_course}** with {count} applicants."

    # E. REVENUE (Management Only)
    if "revenue" in question or "collected" in question:
        total_revenue = df[df['payment'] == 'Paid']['amount'].sum()
        return f"💰 Total Revenue Collected: **₹ {total_revenue:,.2f}**"
    
    # F. COUNTS
    if "how many" in question or "count" in question:
        if "pending" in question:
            return f"⏳ Applications Pending: **{len(df[df['status'] == 'Pending'])}**"
        if "admit" in question or "accept" in question:
            count = len(df[df['status'].isin(['Accepted', 'Offer Accepted', 'Admission Confirmed'])])
            return f"✅ Total Admitted: **{count}**"

    # Default Fallback
    return "I can help! Try asking:\n- 'Give me confirmed applications'\n- 'Who scored more than 190?'\n- 'Status of Sneha Reddy'\n- 'Total Revenue'"