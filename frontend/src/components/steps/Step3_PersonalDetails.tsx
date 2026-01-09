"use client";
import { useFormStore } from "../../store/formStore";

export default function Step3_PersonalDetails() {
  const { formData, updateData, setStep } = useFormStore();

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.community || !formData.fatherName) {
      alert("Please fill in Community and Parent details.");
      return;
    }
    setStep(4); // Move to Academic Details
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-[#3b82f6] p-4">
        <h2 className="text-white text-xl font-semibold">👤 Personal & Parent Details</h2>
      </div>

      <form onSubmit={handleNext} className="p-8 space-y-8">
        
        {/* Section 1: Personal (Community is Critical here) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700">Community *</label>
            <select
              className="w-full mt-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              value={formData.community}
              onChange={(e) => updateData("community", e.target.value)}
              required
            >
              <option value="">-- Select --</option>
              <option value="OC">OC</option>
              <option value="BC">BC</option>
              <option value="MBC">MBC</option>
              <option value="SC">SC</option>
              <option value="ST">ST</option>
            </select>
          </div>
          <div>
             <label className="block text-sm font-semibold text-gray-700">Religion *</label>
             <select 
               className="w-full mt-1 p-2 border rounded"
               value={formData.religion}
               onChange={(e) => updateData("religion", e.target.value)}
             >
               <option value="">-- Select --</option>
               <option value="Hindu">Hindu</option>
               <option value="Christian">Christian</option>
               <option value="Muslim">Muslim</option>
             </select>
          </div>
          <div>
             <label className="block text-sm font-semibold text-gray-700">Mother Tongue</label>
             <select 
               className="w-full mt-1 p-2 border rounded"
               value={formData.motherTongue}
               onChange={(e) => updateData("motherTongue", e.target.value)}
             >
               <option value="">-- Select --</option>
               <option value="Tamil">Tamil</option>
               <option value="English">English</option>
               <option value="Hindi">Hindi</option>
             </select>
          </div>
        </div>

        <hr />

        {/* Section 2: Parent Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700">Father Name *</label>
            <input
              type="text"
              required
              className="w-full mt-1 p-2 border rounded"
              value={formData.fatherName}
              onChange={(e) => updateData("fatherName", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">Father Mobile No</label>
            <input
              type="tel"
              className="w-full mt-1 p-2 border rounded"
              value={formData.fatherMobile}
              onChange={(e) => updateData("fatherMobile", e.target.value)}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-between pt-6 border-t">
          <button type="button" onClick={() => setStep(2)} className="px-6 py-2 border rounded hover:bg-gray-50">
            ← Back
          </button>
          <button type="submit" className="bg-blue-600 text-white px-8 py-2 rounded hover:bg-blue-700">
            Next: Academic Details ➔
          </button>
        </div>
      </form>
    </div>
  );
}