"use client";
import { useFormStore } from "../../store/formStore";

export default function Step4_AcademicDetails() {
  const { formData, updateData, setStep, submitForm, isLoading } = useFormStore();

  const handleNext = async () => {
    // Basic validation
    if (!formData.physics || !formData.chemistry || !formData.maths) {
      alert("Please enter marks for Physics, Chemistry, and Maths.");
      return;
    }
    // Submit the form
    await submitForm();
  };

  const cutoff = (
    Number(formData.physics || 0) / 2 +
    Number(formData.chemistry || 0) / 4 +
    Number(formData.maths || 0) / 4
  ).toFixed(2);

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg animate-in slide-in-from-right-4 duration-500">
      <div className="flex items-center gap-3 mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
        <div className="text-2xl">🎓</div>
        <div>
          <h2 className="text-xl font-bold text-blue-900">Academic Details</h2>
          <p className="text-sm text-blue-600">Enter your 12th Grade / HSC Marks</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Marks Entry */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {["Physics", "Chemistry", "Maths"].map((subject) => (
            <div key={subject}>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                {subject}
              </label>
              <input
                type="number"
                placeholder="0-100"
                className="w-full p-3 border border-gray-300 rounded-lg text-center font-mono text-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                value={formData[subject.toLowerCase() as keyof typeof formData] as number || ""}
                onChange={(e) => updateData(subject.toLowerCase() as any, e.target.value)}
              />
              <p className="text-[10px] text-gray-400 text-center mt-1">Max 100</p>
            </div>
          ))}
        </div>

        {/* Cutoff Display */}
        <div className="bg-gray-50 p-4 rounded-lg text-center border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Calculated Engineering Cutoff</p>
          <div className="text-3xl font-extrabold text-blue-600">{cutoff} <span className="text-sm text-gray-400 font-normal">/ 200</span></div>
        </div>

        {/* Management Quota Checkbox */}
        <div className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-100 rounded-lg">
          <input
            type="checkbox"
            id="mgmtQuota"
            className="mt-1 w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
            checked={formData.isManagementQuota}
            onChange={(e) => updateData("isManagementQuota", e.target.checked)}
          />
          <label htmlFor="mgmtQuota" className="text-sm text-gray-700 cursor-pointer">
            <span className="font-bold text-orange-800 block">Consider for Management Quota?</span>
            Select this if you are worried about meeting the merit cutoff. Higher fees may apply.
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between pt-6 border-t border-gray-100">
          <button
            onClick={() => setStep(3)}
            className="px-6 py-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition"
          >
            ← Back
          </button>
          
          <button
            onClick={handleNext}
            disabled={isLoading}
            className={`px-8 py-3 rounded-lg font-bold text-white shadow-lg transition-all transform hover:-translate-y-1 ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
          >
            {isLoading ? "Submitting..." : "Submit Application ✓"}
          </button>
        </div>
      </div>
    </div>
  );
}