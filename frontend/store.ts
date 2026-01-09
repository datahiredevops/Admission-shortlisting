import { create } from 'zustand';

interface AppState {
  step: number;
  formData: any;
  setStep: (step: number) => void;
  updateFormData: (data: any) => void;
}

export const useFormStore = create<AppState>((set) => ({
  step: 1,
  formData: {},
  setStep: (step) => set({ step }),
  updateFormData: (data) => set((state) => ({ 
    formData: { ...state.formData, ...data } 
  })),
}));