"use client";
import { useEffect, useState } from "react";
import { useFormStore } from "../../store/formStore";
import api from "../../lib/api";

interface Course {
  id: number;
  name: string;
}

export default function Step2_CourseSelection() {
  const { formData, updateData, setStep } = useFormStore();
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // Determine Logic Type
  const isSchool = formData.institutionType === "School";
  const isMedical = formData.institutionType === "Medical";
  // Engineering & Polytechnic usually allow multiple preferences
  const allowMultiplePreferences = !isSchool && !isMedical; 

  // 1. Fetch Courses for the Selected Institution
  useEffect(() => {
    if (!formData.institutionId) return;

    const fetchCourses = async () => {
      try {
        const res = await api.get(`/institutions/${formData.institutionId}/courses`);
        setAvailableCourses(res.data);
      } catch (err) {
        console.error("Failed to load courses");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [formData.institutionId]);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (allowMultiplePreferences) {
      if (!formData.coursePref1 || !formData.coursePref2 || !formData.coursePref3) {
        alert("Please select all 3 preferences.");
        return;
      }
    } else {
      // For School/Medical, we only check the first preference (which acts as the main course)
      if (!formData.coursePref1) {
        alert("Please select the course/grade you are applying for.");
        return;
      }
    }
    setStep(3); 
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-[#3b82f6] p-4">
        <h2 className="text-white text-xl font-semibold flex items-center gap-2">
          {isSchool ? "🏫 Select Class / Grade" : "📚 Course Selection"}
          <span className="text-sm bg-blue-800 px-2 py-1 rounded opacity-80">
            {formData.institutionType}
          </span>
        </h2>
      </div>

      <form onSubmit={handleNext} className="p-8 space-y-8">
        
        {loading ? (
          <div className="text-center p-4">Loading options...</div>
        ) : (
          <>
            {/* --- SCENARIO A: Engineering / Polytechnic (3 Preferences) --- */}
            {allowMultiplePreferences && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((num) => (
                  <div key={num}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {num === 1 ? "1st Preference" : num === 2 ? "2nd Preference" : "3rd Preference"} *
                    </label>
                    <select
                      className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-white"
                      value={formData[`coursePref${num}` as keyof typeof formData] as string}
                      onChange={(e) => updateData(`coursePref${num}` as any, e.target.value)}
                    >
                      <option value="">-- Select --</option>
                      {availableCourses.map((course) => (
                        <option 
                          key={course.id} 
                          value={course.name}
                          // Disable if selected in another slot
                          disabled={[formData.coursePref1, formData.coursePref2, formData.coursePref3].includes(course.name) && formData[`coursePref${num}` as keyof typeof formData] !== course.name}
                        >
                          {course.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            )}

            {/* --- SCENARIO B: Medical / School (Single Selection) --- */}
            {!allowMultiplePreferences && (
               <div className="max-w-md mx-auto">
                 <label className="block text-sm font-semibold text-gray-700 mb-2">
                   {isSchool ? "Select Grade / Class Applying For *" : "Select Degree / Course *"}
                 </label>
                 <select
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-white text-lg"
                    value={formData.coursePref1} // We store single choice in pref1
                    onChange={(e) => {
                        updateData("coursePref1", e.target.value);
                        // Clear others to be safe
                        updateData("coursePref2", "");
                        updateData("coursePref3", "");
                    }}
                  >
                    <option value="">-- Select Option --</option>
                    {availableCourses.map((course) => (
                      <option key={course.id} value={course.name}>
                        {course.name}
                      </option>
                    ))}
                  </select>
               </div>
            )}
          </>
        )}

        {/* Common Question: Siblings */}
        <div className="pt-6 border-t">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Any Siblings Studied/Studying in Sairam Institutions? *
          </label>
          <select
            className="w-full md:w-1/3 p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            value={formData.hasSiblings}
            onChange={(e) => updateData("hasSiblings", e.target.value)}
          >
            <option value="">-- Select --</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="flex justify-between pt-6">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
          >
            ← Back
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-8 py-2 rounded shadow hover:bg-blue-700 transition"
          >
            Next: Parent Details ➔
          </button>
        </div>
      </form>
    </div>
  );
}