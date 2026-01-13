"use client";
import { useRouter } from "next/navigation";
import { useFormStore } from "../store/formStore";
import Step0_InstitutionSelect from "./steps/Step0_InstitutionSelect";
import Step1_BasicInfo from "./steps/Step1_BasicInfo";
import Step2_CourseSelection from "./steps/Step2_CourseSelection";
import Step3_PersonalDetails from "./steps/Step3_PersonalDetails";
import Step4_AcademicDetails from "./steps/Step4_AcademicDetails";

export default function ApplicationForm() {
  const router = useRouter();
  // 1. Get 'resetForm' from the store
  const { currentStep, qualificationStatus, formData, resetForm } = useFormStore();

  // ---------------------------------------------------------
  // SCENARIO 1: The Result View (After Submission)
  // ---------------------------------------------------------
  if (qualificationStatus) {
    return (
      <div className="max-w-2xl mx-auto mt-20 p-10 bg-white shadow-2xl rounded-xl text-center animate-in zoom-in duration-300 border border-gray-100">
        <div className="mb-6">
           {qualificationStatus === "Qualified" && <div className="text-6xl animate-bounce">🎉</div>}
           {qualificationStatus === "Management Review" && <div className="text-6xl animate-pulse">⚠️</div>}
           {qualificationStatus === "Not Qualified" && <div className="text-6xl">❌</div>}
        </div>
        
        <h2 className="text-3xl font-bold mb-2 text-gray-800">Application Submitted!</h2>
        <h3 className={`text-xl font-bold mb-6 inline-block px-4 py-1 rounded-full 
          ${qualificationStatus === "Qualified" ? "bg-green-100 text-green-700" : 
            qualificationStatus === "Management Review" ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700"}`}>
          Status: {qualificationStatus.toUpperCase()}
        </h3>

        <div className="bg-blue-50 p-6 rounded-xl text-left text-sm text-blue-900 mb-8 border border-blue-100 shadow-sm">
          <h4 className="font-bold text-lg mb-2 text-blue-800">👉 What's Next?</h4>
          <p className="mb-4">
            Your application has been successfully recorded. You can now log in to the Student Dashboard to view your <strong>Offer Letter</strong> and pay fees.
          </p>
          <div className="bg-white p-4 rounded border border-blue-200">
            <p className="mb-1"><span className="font-bold text-gray-500 uppercase text-xs">Login ID:</span> <span className="font-mono font-bold text-lg text-gray-800">{formData.email}</span></p>
            <p><span className="font-bold text-gray-500 uppercase text-xs">Password:</span> <span className="font-mono font-bold text-lg text-gray-800">{formData.dateOfBirth}</span></p>
          </div>
        </div>

        <div className="flex flex-col gap-3 justify-center sm:flex-row">
            {/* --- FIX 1: POINT TO CORRECT LOGIN PATH (/login) --- */}
            <button 
              onClick={() => router.push('/login')} 
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
            >
              Go to Student Login →
            </button>

            {/* --- FIX 2: USE STATE RESET INSTEAD OF RELOAD --- */}
            <button 
              onClick={() => resetForm()} 
              className="px-6 py-3 text-gray-500 hover:text-gray-800 font-semibold transition hover:bg-gray-100 rounded-lg"
            >
              Start New Application
            </button>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------
  // SCENARIO 2: The Wizard View (The Form Steps)
  // ---------------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      
      {/* Progress Bar */}
      {currentStep > 0 && (
        <div className="max-w-4xl mx-auto mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex justify-between text-xs sm:text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">
             <span className={currentStep >= 1 ? "text-blue-600 font-bold" : ""}>Basic Info</span>
             <span className={currentStep >= 2 ? "text-blue-600 font-bold" : ""}>Courses</span>
             <span className={currentStep >= 3 ? "text-blue-600 font-bold" : ""}>Personal</span>
             <span className={currentStep >= 4 ? "text-blue-600 font-bold" : ""}>Academic</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden shadow-inner">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-in-out" 
              style={{ width: `${currentStep * 25}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* The Step Components */}
      {currentStep === 0 && <Step0_InstitutionSelect />}
      {currentStep === 1 && <Step1_BasicInfo />}
      {currentStep === 2 && <Step2_CourseSelection />}
      {currentStep === 3 && <Step3_PersonalDetails />}
      {currentStep === 4 && <Step4_AcademicDetails />}
      
    </div>
  );
}