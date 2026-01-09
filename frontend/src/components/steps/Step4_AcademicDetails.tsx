"use client";
import { useFormStore } from "../../store/formStore";

export default function Step4_AcademicDetails() {
  const { formData, updateData, setStep, submitForm, isLoading } = useFormStore();
  
  // 1. Determine Context (Institution Type)
  const isMedical = formData.institutionType === "Medical";
  const isSchool = formData.institutionType === "School";
  const isPolytechnic = formData.institutionType === "Polytechnic";
  const isEngineering = formData.institutionType === "Engineering"; 

  // 2. Dynamic Score Display Logic
  let scoreDisplay = "0";
  
  if (isEngineering) {
    // TNEA Cutoff Formula (Out of 200)
    // Maths (100) + Physics (50) + Chemistry (50)
    const p = Number(formData.physics) || 0;
    const c = Number(formData.chemistry) || 0;
    const m = Number(formData.maths) || 0;
    
    // Divide Physics & Chem by 2, keep Maths as is
    const cutoff = m + (p / 2) + (c / 2);
    scoreDisplay = cutoff.toFixed(2) + " / 200";
    
  } else if (isPolytechnic) {
    // Polytechnic: 10th Standard Percentage
    const obtained = Number(formData.sslcMarksObtained) || 0;
    const max = Number(formData.sslcMaxMarks) || 500;
    
    if (max > 0) {
      const pct = (obtained / max) * 100;
      scoreDisplay = pct.toFixed(2) + "%";
    } else {
      scoreDisplay = "0%";
    }
    
  } else if (isMedical) {
    // Medical: NEET Score
    scoreDisplay = (formData.physics || 0) + " / 720";
    
  } else {
    // Schools
    scoreDisplay = "Direct Admission";
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Session Check
    if (!formData.institutionId) {
      alert("Session expired. Please restart your application.");
      setStep(0);
      return;
    }

    // 2. Course Preference Check (Prevents 422 Unprocessable Entity)
    if (!formData.coursePref1) {
      alert("Error: Course Preference is missing. Please go back to Step 2 and select a course.");
      setStep(2); 
      return;
    }

    await submitForm(); 
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-[#3b82f6] p-4">
        <h2 className="text-white text-xl font-semibold flex items-center gap-2">
          🎓 Academic Details
          <span className="text-sm bg-blue-800 px-2 py-1 rounded opacity-80">
            {formData.institutionType}
          </span>
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        
        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
          
          {/* DYNAMIC HEADER */}
          <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
            {isEngineering && "HSC (12th) Marks (Max 100 per subject)"}
            {isPolytechnic && "SSLC (10th) Marks"}
            {isMedical && "Entrance Exam Score (NEET)"}
            {isSchool && "Previous Academic Record"}
          </h3>
          
          {/* --- SCENARIO A: ENGINEERING (PCM Inputs) --- */}
          {isEngineering && (
            <div className="grid grid-cols-3 gap-6">
              {['physics', 'chemistry', 'maths'].map((subject) => (
                <div key={subject}>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                    {subject}
                  </label>
                  <input
                    type="number"
                    max="100"
                    placeholder="0-100"
                    className="w-full p-3 text-center text-2xl font-mono font-bold border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    value={formData[subject as keyof typeof formData] as number || ""}
                    onChange={(e) => updateData(subject as any, e.target.value)}
                  />
                  <p className="text-xs text-center text-gray-400 mt-1">out of 100</p>
                </div>
              ))}
            </div>
          )}

          {/* --- SCENARIO B: POLYTECHNIC (10th Marks) --- */}
          {isPolytechnic && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Total Marks Obtained</label>
                  <input
                    type="number"
                    className="w-full p-3 text-2xl font-mono font-bold border rounded focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. 450"
                    value={formData.sslcMarksObtained}
                    onChange={(e) => updateData("sslcMarksObtained", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Maximum Marks</label>
                  <input
                    type="number"
                    className="w-full p-3 text-2xl font-mono font-bold border rounded focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. 500"
                    value={formData.sslcMaxMarks}
                    onChange={(e) => updateData("sslcMaxMarks", e.target.value)}
                  />
                </div>
            </div>
          )}

          {/* --- SCENARIO C: MEDICAL (NEET Score) --- */}
          {isMedical && (
            <div className="max-w-xs">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">NEET Score</label>
              <input
                type="number"
                max="720"
                placeholder="0-720"
                className="w-full p-3 text-left text-2xl font-mono font-bold border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                // Storing NEET score in 'physics' field
                value={formData.physics || ""}
                onChange={(e) => updateData("physics", e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">Enter your raw score out of 720.</p>
            </div>
          )}

          {/* --- SCENARIO D: SCHOOLS (Text Input) --- */}
          {isSchool && (
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                Previous Class Percentage / Grade
              </label>
              <input
                type="text"
                placeholder="e.g. 85% or Grade A"
                className="w-full p-3 text-lg border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                onChange={(e) => updateData("physics", e.target.value)} 
              />
            </div>
          )}

          {/* LIVE SCORE DISPLAY */}
          <div className="mt-6 pt-4 border-t border-blue-200 text-center">
             <p className="text-sm text-gray-600">
               {isEngineering ? "Calculated Cutoff (TNEA): " : "Score Entered: "}
               <span className="font-bold text-lg text-blue-800">{scoreDisplay}</span>
             </p>
          </div>
        </div>

        {/* --- MANAGEMENT QUOTA TOGGLE --- */}
        {/* Only show for Engineering/Medical/Polytechnic where Merit applies */}
        {!isSchool && (
          <div className={`p-4 rounded-lg border-2 border-dashed transition-colors ${formData.isManagementQuota ? 'bg-orange-50 border-orange-300' : 'bg-gray-50 border-gray-200'}`}>
            <label className="flex items-start space-x-3 cursor-pointer">
              <input 
                type="checkbox" 
                className="mt-1 w-5 h-5 text-blue-600"
                checked={formData.isManagementQuota}
                onChange={(e) => updateData("isManagementQuota", e.target.checked)}
              />
              <div>
                <span className="font-bold text-gray-800">Consider for Management Quota?</span>
                <p className="text-sm text-gray-500 mt-1">
                   Select this if you are worried about meeting the merit cutoff. Higher fees may apply.
                </p>
              </div>
            </label>
          </div>
        )}

        {/* BUTTONS */}
        <div className="flex justify-between pt-6 border-t">
          <button type="button" onClick={() => setStep(3)} className="px-6 py-2 border rounded hover:bg-gray-50">
             ← Back
          </button>
          
          <button 
            type="submit" 
            disabled={isLoading}
            className="bg-green-600 text-white px-10 py-3 rounded-lg font-bold shadow-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? "Submitting..." : "Submit Application ✓"}
          </button>
        </div>
      </form>
    </div>
  );
}