"use client";
import { useFormStore } from "../../store/formStore";
import api from "../../lib/api";
import { useState } from "react";

export default function Step1_BasicInfo() {
  const { formData, updateData, setStep } = useFormStore();
  const [autoFillMsg, setAutoFillMsg] = useState("");
  
  // 1. DETERMINE THE "WORLD"
  const isSchool = formData.institutionType === "School";
  const isHigherEd = !isSchool; 

  // --- AUTO-FILL HANDLER ---
  const handleEmailBlur = async () => {
    if (!formData.email || !formData.email.includes("@")) return;

    try {
      const res = await api.get(`/student/lookup/?email=${formData.email}`);
      
      if (res.data.found) {
        const data = res.data;
        if(data.full_name) updateData("fullName", data.full_name);
        if(data.mobile) updateData("mobile", data.mobile);
        if(data.dob) updateData("dateOfBirth", data.dob);
        if(data.aadhaar_no) updateData("aadhaarNo", data.aadhaar_no);
        if(data.community) updateData("community", data.community);
        if(data.father_name) updateData("fatherName", data.father_name);
        if(data.father_mobile) updateData("fatherMobile", data.father_mobile);
        if(data.address_city) updateData("city", data.address_city);
        if(data.address_state) updateData("state", data.address_state);
        
        if(data.gender) updateData("gender", data.gender);
        if(data.blood_group) updateData("bloodGroup", data.blood_group);

        setAutoFillMsg(data.message); 
        setTimeout(() => setAutoFillMsg(""), 4000);
      }
    } catch (err) {
      console.error("Auto-fill failed", err);
    }
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.dateOfBirth) {
      alert("Please fill in all mandatory fields.");
      return;
    }
    setStep(2); 
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      
      {/* AUTO-FILL TOAST */}
      {autoFillMsg && (
        <div className="absolute top-0 left-0 w-full bg-green-100 text-green-800 text-center py-2 font-bold text-sm shadow-sm transition-all">
          ✨ {autoFillMsg}
        </div>
      )}

      {/* HEADER */}
      <div className={`p-4 ${isSchool ? 'bg-orange-500' : 'bg-blue-600'}`}>
        <h2 className="text-white text-xl font-semibold flex items-center gap-2">
          {isSchool ? "🧸 Basic Child Information" : "🎓 Basic Applicant Information"}
        </h2>
        <p className="text-white/80 text-xs mt-1">
          {isSchool ? "Enter details as per Birth Certificate" : "Enter details as per 10th/12th Marksheet"}
        </p>
      </div>

      <form onSubmit={handleNext} className="p-8 space-y-8">

        {/* --- COMMON FIELDS (Email First) --- */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-1">
                {isSchool ? "Parent's Email ID *" : "Applicant's Personal Email *"}
            </label>
            <input 
              type="email" 
              required 
              className="w-full p-3 border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 bg-white"
              placeholder="e.g. yourname@gmail.com"
              value={formData.email}
              onChange={(e) => updateData("email", e.target.value)}
              onBlur={handleEmailBlur} 
            />
            <p className="text-xs text-gray-500 mt-1">
                Use your personal email. If you have applied before, we will auto-fill your details.
            </p>
        </div>

        {/* --- HIGHER EDUCATION --- */}
        {isHigherEd && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Board of Study *</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['State Board (TN)', 'CBSE', 'ICSE', 'Other'].map((board) => (
                    <label key={board} className={`flex items-center space-x-2 p-3 border rounded cursor-pointer transition ${formData.boardOfStudy === board ? 'bg-blue-50 border-blue-500' : 'hover:bg-gray-50'}`}>
                      <input 
                        type="radio" name="board" 
                        checked={formData.boardOfStudy === board}
                        onChange={() => updateData("boardOfStudy", board)}
                      />
                      <span className="text-sm">{board}</span>
                    </label>
                  ))}
                </div>
             </div>

             <div>
                <label className="block text-sm font-semibold text-gray-700">10th Registration No *</label>
                <input type="text" required className="w-full mt-1 p-3 border rounded"
                  value={formData.sslcRegNo} onChange={(e) => updateData("sslcRegNo", e.target.value)} />
             </div>
             <div>
                <label className="block text-sm font-semibold text-gray-700">Aadhaar Number *</label>
                <input type="text" required maxLength={12} className="w-full mt-1 p-3 border rounded"
                  value={formData.aadhaarNo} onChange={(e) => updateData("aadhaarNo", e.target.value)} />
             </div>
             <div>
                <label className="block text-sm font-semibold text-gray-700">Applicant Full Name *</label>
                <input type="text" required className="w-full mt-1 p-3 border rounded"
                  value={formData.fullName} onChange={(e) => updateData("fullName", e.target.value)} />
             </div>
             <div>
                <label className="block text-sm font-semibold text-gray-700">Date of Birth *</label>
                <input type="date" required className="w-full mt-1 p-3 border rounded"
                  value={formData.dateOfBirth} onChange={(e) => updateData("dateOfBirth", e.target.value)} />
             </div>
             <div>
                <label className="block text-sm font-semibold text-gray-700">Mobile Number *</label>
                <input type="tel" required className="w-full mt-1 p-3 border rounded"
                  value={formData.mobile} onChange={(e) => updateData("mobile", e.target.value)} />
             </div>
          </div>
        )}

        {/* --- SCHOOLS --- */}
        {isSchool && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 bg-orange-50 p-6 rounded-lg border border-orange-100">
                <div>
                   <label className="block text-sm font-bold text-gray-700">Child's Full Name *</label>
                   <input type="text" required className="w-full mt-1 p-3 border rounded"
                      value={formData.fullName} onChange={(e) => updateData("fullName", e.target.value)} />
                </div>
                <div>
                   <label className="block text-sm font-bold text-gray-700">Date of Birth *</label>
                   <input type="date" required className="w-full mt-1 p-3 border rounded"
                      value={formData.dateOfBirth} onChange={(e) => updateData("dateOfBirth", e.target.value)} />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700">Gender *</label>
                    <select className="w-full mt-1 p-3 border rounded" value={formData.gender} onChange={(e) => updateData("gender", e.target.value)}>
                       <option value="">-- Select --</option>
                       <option value="Male">Boy</option>
                       <option value="Female">Girl</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700">Blood Group *</label>
                    <select className="w-full mt-1 p-3 border rounded" value={formData.bloodGroup} onChange={(e) => updateData("bloodGroup", e.target.value)}>
                       <option value="">-- Select --</option>
                       <option value="A+">A+</option>
                       <option value="B+">B+</option>
                       <option value="O+">O+</option>
                       <option value="AB+">AB+</option>
                    </select>
                </div>
             </div>

             <div>
                <label className="block text-sm font-semibold text-gray-700">Parent's Mobile No *</label>
                <input type="tel" required className="w-full mt-1 p-3 border rounded"
                  value={formData.mobile} onChange={(e) => updateData("mobile", e.target.value)} />
             </div>
             
             <div>
                <label className="block text-sm font-semibold text-gray-700">EMIS Number</label>
                <input type="text" className="w-full mt-1 p-3 border rounded"
                  value={formData.emisNumber} onChange={(e) => updateData("emisNumber", e.target.value)} />
             </div>
             <div>
                <label className="block text-sm font-semibold text-gray-700">Aadhaar Number</label>
                <input type="text" className="w-full mt-1 p-3 border rounded"
                  value={formData.aadhaarNo} onChange={(e) => updateData("aadhaarNo", e.target.value)} />
             </div>
          </div>
        )}

        <div className="flex justify-between pt-6 border-t">
          <button type="button" onClick={() => setStep(0)} className="px-6 py-2 border rounded hover:bg-gray-50">← Back</button>
          <button type="submit" className={`text-white px-8 py-2 rounded shadow transition ${isSchool ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
            Next ➔
          </button>
        </div>
      </form>
    </div>
  );
}