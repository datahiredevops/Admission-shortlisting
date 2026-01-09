import random

def calculate_probability(score, max_score, community, institution_type):
    """
    Simulates an AI Prediction Model based on standard cutoff trends.
    Returns: { "percentage": int, "label": str, "color": str }
    """
    
    # 1. Normalize Score to 100%
    if max_score == 0: 
        # For schools/direct admission, it's always 100%
        return {"percentage": 100, "label": "Direct Entry", "color": "green"}
    
    percent = (score / max_score) * 100
    
    # 2. Community Weighting (Simulated "AI Bias Adjustment")
    # OC usually needs higher marks, so we don't boost them.
    # BC/MBC/SC get a slight probability boost relative to the cutoff.
    boost = 0
    if community in ["BC", "MBC"]: boost = 5
    if community in ["SC", "ST"]: boost = 10
    
    final_prob = min(percent + boost, 99) # Cap at 99%
    
    # 3. Determine Label
    label = "Low Chance"
    color = "red"
    
    if final_prob >= 85:
        label = "Very High Chance"
        color = "green"
    elif final_prob >= 60:
        label = "Moderate Chance"
        color = "yellow"
    
    return {"percentage": int(final_prob), "label": label, "color": color}

def process_qualification(physics, chemistry, maths, community, institution_type, sslc_marks=0, sslc_max=500):
    
    result = {
        "score": 0,
        "is_qualified": False,
        "status": "Not Qualified",
        "logic_used": institution_type,
        "max_score": 100,
        "ai_prediction": {} # <--- NEW FIELD
    }

    # --- 1. ENGINEERING (TNEA Cutoff - Out of 200) ---
    if institution_type == "Engineering":
        cutoff_score = maths + (physics / 2) + (chemistry / 2)
        result["score"] = round(cutoff_score, 2)
        result["max_score"] = 200
        pass_mark = 80 if community == "OC" else 70
        result["is_qualified"] = cutoff_score >= pass_mark

    # --- 2. MEDICAL (NEET Score) ---
    elif institution_type == "Medical":
        result["score"] = physics
        result["max_score"] = 720
        cutoff = 500 if community == "OC" else 400
        result["is_qualified"] = physics >= cutoff
        result["status"] = "Merit List" if result["is_qualified"] else "Management Review"

    # --- 3. POLYTECHNIC (Percentage) ---
    elif institution_type == "Polytechnic":
        if sslc_max > 0: percentage = (sslc_marks / sslc_max) * 100
        else: percentage = 0
        result["score"] = round(percentage, 2)
        result["max_score"] = 100
        result["is_qualified"] = percentage >= 35

    # --- 4. SCHOOLS ---
    elif institution_type == "School":
        result["score"] = 0 
        result["max_score"] = 0
        result["is_qualified"] = True

    # Final Status Logic (Unless overridden by Medical Logic)
    if institution_type != "Medical":
        result["status"] = "Qualified" if result["is_qualified"] else "Not Qualified"

    # --- RUN AI PREDICTION ---
    result["ai_prediction"] = calculate_probability(
        result["score"], 
        result["max_score"], 
        community, 
        institution_type
    )

    return result