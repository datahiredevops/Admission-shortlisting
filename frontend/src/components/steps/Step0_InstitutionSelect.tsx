"use client";
import { useEffect, useState } from "react";
import { useFormStore } from "../../store/formStore";
import api from "../../lib/api"; // Ensure this path is correct

interface Institution {
  id: number;
  name: string;
  code: string;
  institution_type: string;
}

export default function Step0_InstitutionSelect() {
  const { updateData, setStep } = useFormStore();
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState("");

  // 1. Fetch the list from Backend on load
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/institutions/");
        setInstitutions(res.data);
      } catch (err) {
        console.error("Failed to load institutions", err);
        alert("Error connecting to server. Is backend running?");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleNext = () => {
    if (!selectedId) {
      alert("Please select an Institution to proceed.");
      return;
    }
    
    // Find the full object to save details
    const selectedInst = institutions.find(i => i.id.toString() === selectedId);
    if (selectedInst) {
      updateData("institutionId", selectedInst.id.toString());
      updateData("institutionName", selectedInst.name);
      updateData("institutionType", selectedInst.institution_type);
      
      // Move to Step 1 (Basic Info)
      setStep(1);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading Institutions...</div>;

  return (
    <div className="w-full max-w-2xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden mt-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-blue-900 p-6 text-center">
        <h1 className="text-white text-2xl font-bold">Admission Portal 2026-27</h1>
        <p className="text-blue-200 mt-2">Sairam Group of Institutions</p>
      </div>

      <div className="p-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-gray-800">Select Your Institution</h2>
          <p className="text-sm text-gray-500">
            Please choose the campus you wish to apply for. This will determine your application type.
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Institution Name</label>
          <select
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-lg"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            <option value="">-- Select Institution --</option>
            {institutions.map((inst) => (
              <option key={inst.id} value={inst.id}>
                {inst.name} ({inst.institution_type})
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleNext}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold shadow hover:bg-blue-700 transition transform hover:scale-[1.01]"
        >
          Start Application ➔
        </button>
      </div>
    </div>
  );
}