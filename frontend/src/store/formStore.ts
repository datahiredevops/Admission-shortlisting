import { create } from 'zustand';

// 1. Define the shape of ALL data collected across the steps
interface FormData {
  // --- Step 0: Context (Institution Selection) ---
  institutionId: string;
  institutionName: string;
  institutionType: string; // "Engineering", "Medical", "School", "Polytechnic"

  // --- Step 1: Basic Information ---
  // Common Fields
  fullName: string;
  dateOfBirth: string;
  email: string; 
  mobile: string; 
  
  // College Specific
  boardOfStudy: string;
  sslcRegNo: string; // 10th Reg No
  aadhaarNo: string;

  // School Specific
  emisNumber: string;
  gender: string;      
  bloodGroup: string;  

  // --- Step 2: Course/Grade Selection ---
  coursePref1: string;
  coursePref2: string;
  coursePref3: string;
  hasSiblings: string; // "Yes" or "No"

  // --- Step 3: Personal & Family Details ---
  religion: string;
  community: string; // OC, BC, MBC, SC, etc.
  
  fatherName: string;
  fatherMobile: string;
  motherName: string;
  guardianName: string;

  // Address
  addressLine1: string;
  addressLine2: string;
  country: string;
  state: string;
  city: string;
  pincode: string;

  // School Logistics
  transportNeeded: string; // "Yes" or "No"

  // --- Step 4: Academic History ---
  // Polytechnic / Engineering
  sslcMarksObtained: string;
  sslcMaxMarks: string;
  
  // School History (Transfer)
  previousSchoolName: string;
  previousBoard: string;
  transferCertificateStatus: string; 

  // Marks for Calculation
  physics: number;    // Also stores NEET Score or Grade
  chemistry: number;
  maths: number;

  // --- Step 5: Quota & Submission ---
  isManagementQuota: boolean;
}

// 2. Define the Actions
interface FormState {
  currentStep: number;
  formData: FormData;
  isLoading: boolean;
  qualificationStatus: string | null; 

  // Actions
  setStep: (step: number) => void;
  updateData: (field: keyof FormData, value: any) => void;
  submitForm: () => Promise<void>;
  resetForm: () => void;
}

// 3. Create the Store
export const useFormStore = create<FormState>((set, get) => ({
  currentStep: 0, 
  isLoading: false,
  qualificationStatus: null,

  // Initial State
  formData: {
    institutionId: '',
    institutionName: '',
    institutionType: '',

    boardOfStudy: 'State Board (TN State)',
    sslcRegNo: '',
    aadhaarNo: '',
    fullName: '',
    email: '',
    mobile: '',
    dateOfBirth: '',
    emisNumber: '',
    gender: '',
    bloodGroup: '',

    coursePref1: '',
    coursePref2: '',
    coursePref3: '',
    hasSiblings: '',

    religion: '',
    community: '',
    fatherName: '',
    fatherMobile: '',
    motherName: '',
    guardianName: '',
    addressLine1: '',
    addressLine2: '',
    country: 'India',
    state: 'Tamil Nadu',
    city: '',
    pincode: '',
    transportNeeded: '',

    sslcMarksObtained: '',
    sslcMaxMarks: '500',
    
    previousSchoolName: '',
    previousBoard: '',
    transferCertificateStatus: '',

    physics: 0,
    chemistry: 0,
    maths: 0,

    isManagementQuota: false,
  },

  setStep: (step) => set({ currentStep: step }),

  updateData: (field, value) => 
    set((state) => ({
      formData: { ...state.formData, [field]: value }
    })),

  resetForm: () => set((state) => ({
    currentStep: 0,
    qualificationStatus: null,
    formData: { 
      ...state.formData, 
      fullName: '', 
      email: '', 
      aadhaarNo: '',
      physics: 0,
      chemistry: 0,
      maths: 0,
      emisNumber: '',
      transportNeeded: ''
    }
  })),

  submitForm: async () => {
    const { formData } = get();
    set({ isLoading: true });

    console.log("🚀 Submitting Form...", formData);
    
    try {
      const api = (await import('../lib/api')).default;
      
      const response = await api.post('/submit-application/', {
        // Core Identification
        institution_id: Number(formData.institutionId),
        full_name: formData.fullName,
        email: formData.email,
        mobile: formData.mobile, 
        aadhaar_no: formData.aadhaarNo,
        dob: formData.dateOfBirth, 
        community: formData.community, 

        // --- ACADEMIC IDENTITY (This was missing!) ---
        board_of_study: formData.boardOfStudy, 
        sslc_reg_no: formData.sslcRegNo,       
        // ---------------------------------------------

        // Preferences (Added || "" to prevent 'field required' errors)
        course_pref_1: formData.coursePref1 || "",
        course_pref_2: formData.coursePref2 || "",
        course_pref_3: formData.coursePref3 || "",

        // School Specifics
        emis_number: formData.emisNumber,
        gender: formData.gender,
        blood_group: formData.bloodGroup,
        transport_needed: formData.transportNeeded,
        previous_school_name: formData.previousSchoolName,
        previous_board: formData.previousBoard,
        transfer_certificate_status: formData.transferCertificateStatus,
        
        // Parent Info
        father_name: formData.fatherName,
        father_mobile: formData.fatherMobile,
        address_city: formData.city,
        address_state: formData.state,
        
        // Academic Marks (Safe Parsing)
        physics: formData.physics ? parseFloat(String(formData.physics)) : 0,
        chemistry: formData.chemistry ? parseFloat(String(formData.chemistry)) : 0,
        maths: formData.maths ? parseFloat(String(formData.maths)) : 0,
        
        // Polytechnic Specifics
        sslcMarksObtained: formData.sslcMarksObtained ? String(formData.sslcMarksObtained) : "0",
        sslcMaxMarks: formData.sslcMaxMarks ? String(formData.sslcMaxMarks) : "500",

        // Flags
        is_management_quota: formData.isManagementQuota
      });
      
      console.log("✅ API Response:", response.data);
      set({ qualificationStatus: response.data.final_status });
      
    } catch (error: any) {
      console.error("❌ Submission failed", error);
      if (error.response?.data?.detail) {
        alert(`Error: ${JSON.stringify(error.response.data.detail)}`);
      } else {
        alert("Submission failed. Check backend console.");
      }
    } finally {
      set({ isLoading: false });
    }
  }
}));