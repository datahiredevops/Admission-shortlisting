import { create } from 'zustand';

// 1. Define the shape of ALL data collected across the steps
interface FormData {
  // --- Step 0: Context (Institution Selection) ---
  institutionId: string;
  institutionName: string;
  institutionType: string; // "Engineering", "Medical", "School", "Polytechnic"

  // --- Step 1: Basic Information ---
  fullName: string;
  dateOfBirth: string;
  email: string; 
  mobile: string; 
  boardOfStudy: string;
  sslcRegNo: string;
  aadhaarNo: string;
  emisNumber: string;
  gender: string;      
  bloodGroup: string;  

  // --- Step 2: Course/Grade Selection ---
  coursePref1: string;
  coursePref2: string;
  coursePref3: string;
  hasSiblings: string;

  // --- Step 3: Personal & Family Details ---
  religion: string;
  community: string;
  motherTongue: string; // <--- FIX ADDED HERE
  
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

  transportNeeded: string;

  // --- Step 4: Academic History ---
  sslcMarksObtained: string;
  sslcMaxMarks: string;
  previousSchoolName: string;
  previousBoard: string;
  transferCertificateStatus: string; 

  // Marks
  physics: number;
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
    motherTongue: '', // <--- FIX ADDED HERE
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
    
    try {
      const api = (await import('../lib/api')).default;
      
      const response = await api.post('/submit-application/', {
        institution_id: Number(formData.institutionId),
        full_name: formData.fullName,
        email: formData.email,
        mobile: formData.mobile, 
        aadhaar_no: formData.aadhaarNo,
        dob: formData.dateOfBirth, 
        community: formData.community, 
        
        // Note: motherTongue is now in the state, 
        // but backend might simply ignore it if not in schema.
        // That is fine for fixing the build error.

        board_of_study: formData.boardOfStudy, 
        sslc_reg_no: formData.sslcRegNo,       

        course_pref_1: formData.coursePref1 || "",
        course_pref_2: formData.coursePref2 || "",
        course_pref_3: formData.coursePref3 || "",

        emis_number: formData.emisNumber,
        gender: formData.gender,
        blood_group: formData.bloodGroup,
        transport_needed: formData.transportNeeded,
        previous_school_name: formData.previousSchoolName,
        previous_board: formData.previousBoard,
        transfer_certificate_status: formData.transferCertificateStatus,
        
        father_name: formData.fatherName,
        father_mobile: formData.fatherMobile,
        address_city: formData.city,
        address_state: formData.state,
        
        physics: formData.physics ? parseFloat(String(formData.physics)) : 0,
        chemistry: formData.chemistry ? parseFloat(String(formData.chemistry)) : 0,
        maths: formData.maths ? parseFloat(String(formData.maths)) : 0,
        
        sslcMarksObtained: formData.sslcMarksObtained ? String(formData.sslcMarksObtained) : "0",
        sslcMaxMarks: formData.sslcMaxMarks ? String(formData.sslcMaxMarks) : "500",

        is_management_quota: formData.isManagementQuota
      });
      
      set({ qualificationStatus: response.data.final_status });
      
    } catch (error: any) {
      console.error("Submission failed", error);
      alert("Submission failed. Please check your connection.");
    } finally {
      set({ isLoading: false });
    }
  }
}));