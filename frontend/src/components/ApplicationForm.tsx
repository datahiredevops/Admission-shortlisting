"use client";
import { useFormStore } from "../store/formStore";
import Step0_InstitutionSelect from "./steps/Step0_InstitutionSelect";
import Step1_BasicInfo from "./steps/Step1_BasicInfo";
import Step2_CourseSelection from "./steps/Step2_CourseSelection";
import Step3_PersonalDetails from "./steps/Step3_PersonalDetails";
import Step4_AcademicDetails from "./steps/Step4_AcademicDetails";

export default function ApplicationForm() {
  const { currentStep, qualificationStatus } = useFormStore();

  // ---------------------------------------------------------
  // SCENARIO 1: The Result View (After Submission)
  // ---------------------------------------------------------
  if (qualificationStatus) {
    return (
      <div className="max-w-2xl mx-auto mt-20 p-10 bg-white shadow-2xl rounded-xl text-center animate-in zoom-in duration-300">
        <div className="mb-6">
           {qualificationStatus === "Qualified" && <div className="text-6xl">🎉</div>}
           {qualificationStatus === "Management Review" && <div className="text-6xl">⚠️</div>}
           {qualificationStatus === "Not Qualified" && <div className="text-6xl">❌</div>}
        </div>
        
        <h2 className="text-3xl font-bold mb-2">Application Status</h2>
        <h3 className={`text-2xl font-extrabold mb-6 
          ${qualificationStatus === "Qualified" ? "text-green-600" : 
            qualificationStatus === "Management Review" ? "text-orange-500" : "text-red-600"}`}>
          {qualificationStatus.toUpperCase()}
        </h3>

        <div className="bg-gray-50 p-6 rounded-lg text-left text-sm text-gray-600 mb-8">
          <p className="mb-2"><strong>Application ID:</strong> SEC-2026-{Math.floor(1000 + Math.random() * 9000)}</p>
          <p>Your application has been processed by our AI Eligibility Engine. An official email has been sent to your registered address with further instructions.</p>
        </div>

        <button 
          onClick={() => window.location.reload()} 
          className="text-blue-600 font-semibold hover:underline"
        >
          Start New Application
        </button>
      </div>
    );
  }

  // ---------------------------------------------------------
  // SCENARIO 2: The Wizard View (The Form Steps)
  // ---------------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      
      {/* Progress Bar 
          (Only show if we are PAST Step 0. No need to show progress on the landing page) 
      */}
      {currentStep > 0 && (
        <div className="max-w-4xl mx-auto mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex justify-between text-xs sm:text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">
             <span className={currentStep >= 1 ? "text-blue-600 font-bold" : ""}>Basic Info</span>
             <span className={currentStep >= 2 ? "text-blue-600 font-bold" : ""}>Courses</span>
             <span className={currentStep >= 3 ? "text-blue-600 font-bold" : ""}>Personal</span>
             <span className={currentStep >= 4 ? "text-blue-600 font-bold" : ""}>Academic</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-in-out" 
              style={{ width: `${currentStep * 25}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* The Step Components 
          This acts as a "Router" switching views based on currentStep 
      */}
      {currentStep === 0 && <Step0_InstitutionSelect />}
      {currentStep === 1 && <Step1_BasicInfo />}
      {currentStep === 2 && <Step2_CourseSelection />}
      {currentStep === 3 && <Step3_PersonalDetails />}
      {currentStep === 4 && <Step4_AcademicDetails />}
      
    </div>
  );
}