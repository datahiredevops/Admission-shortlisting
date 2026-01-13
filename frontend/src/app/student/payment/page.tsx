"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react"; // <--- Import Suspense
import api from "../../../lib/api";

// 1. Create a Sub-Component for the Logic
function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Get data from URL
  const amount = searchParams.get("amount");
  const appId = searchParams.get("appId");
  
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
        // Simulate Payment API Call
        await api.post("/student/pay-fee/", {
            amount: Number(amount),
            application_id: appId
        });
        
        alert("Payment Successful! Admission Confirmed.");
        router.push("/student/dashboard");
        
    } catch (error) {
        alert("Payment Failed. Try again.");
    } finally {
        setLoading(false);
    }
  };

  if (!amount || !appId) {
      return <div className="p-10 text-center text-red-500">Invalid Payment Link</div>;
  }

  return (
    <div className="max-w-md mx-auto mt-20 bg-white p-8 rounded-xl shadow-lg border border-gray-200 text-center">
        <div className="text-4xl mb-4">💳</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Confirm Payment</h1>
        <p className="text-gray-500 mb-6">Complete your admission process.</p>
        
        <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
            <div className="flex justify-between mb-2">
                <span className="text-gray-600">Application Ref:</span>
                <span className="font-mono font-bold">{appId}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-blue-900">
                <span>Total Amount:</span>
                <span>₹ {Number(amount).toLocaleString()}</span>
            </div>
        </div>

        <button 
            onClick={handlePayment}
            disabled={loading}
            className={`w-full py-3 rounded-lg font-bold text-white shadow-md transition-all ${
                loading ? "bg-gray-400 cursor-wait" : "bg-green-600 hover:bg-green-700 hover:shadow-lg"
            }`}
        >
            {loading ? "Processing..." : "Pay Now & Confirm Seat"}
        </button>
        
        <button 
            onClick={() => router.back()}
            className="mt-4 text-sm text-gray-500 hover:text-gray-800 underline"
        >
            Cancel
        </button>
    </div>
  );
}

// 2. Main Page Component (Wraps Content in Suspense)
export default function PaymentPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <Suspense fallback={<div className="text-center p-10">Loading Payment Gateway...</div>}>
        <PaymentContent />
      </Suspense>
    </div>
  );
}