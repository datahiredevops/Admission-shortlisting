"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CreditCard, Lock, CheckCircle, ShieldCheck } from "lucide-react";
import api from "../../../lib/api";

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const appId = searchParams.get("app_id");
  const type = searchParams.get("type"); // "Medical", "Engineering", etc.

  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  // Determine Fee Amount based on Type (Demo Logic)
  let feeAmount = 25000; // Default School
  if (type === "Engineering") feeAmount = 50000;
  if (type === "Medical") feeAmount = 100000;
  if (type === "Polytechnic") feeAmount = 30000;

  const handlePayment = async () => {
    setProcessing(true);
    
    // Simulate Bank Delay (2 seconds)
    setTimeout(async () => {
      try {
        await api.post("/student/pay-fee/", {
          amount: feeAmount,
          application_id: appId
        });
        setSuccess(true);
        // Redirect back to dashboard after 2 more seconds
        setTimeout(() => router.push("/student/dashboard"), 2000);
      } catch (err) {
        alert("Payment Failed");
        setProcessing(false);
      }
    }, 2000);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="text-center animate-in zoom-in duration-300">
          <div className="bg-green-100 p-6 rounded-full inline-block mb-4">
            <CheckCircle className="w-16 h-16 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-green-800">Payment Successful!</h1>
          <p className="text-green-600 mt-2">Admission Confirmed. Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-xl shadow-2xl overflow-hidden">
        <div className="bg-blue-900 p-6 text-white text-center">
          <h2 className="text-xl font-bold">Secure Payment Gateway</h2>
          <p className="text-blue-300 text-sm flex items-center justify-center gap-1 mt-1">
            <Lock size={12} /> 256-bit SSL Encrypted
          </p>
        </div>

        <div className="p-8">
          <div className="mb-6 text-center">
            <p className="text-gray-500 text-sm uppercase">Admission Fee</p>
            <h1 className="text-4xl font-bold text-gray-800">₹ {feeAmount.toLocaleString()}</h1>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50">
              <CreditCard className="text-blue-600" />
              <div>
                <p className="text-sm font-bold text-gray-700">Demo Card</p>
                <p className="text-xs text-gray-500">**** **** **** 4242</p>
              </div>
            </div>
          </div>

          <button 
            onClick={handlePayment}
            disabled={processing}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all"
          >
            {processing ? "Processing..." : `Pay ₹ ${feeAmount.toLocaleString()}`}
          </button>
          
          <div className="mt-6 flex justify-center gap-4 opacity-50">
             <ShieldCheck size={20}/> 
             <span className="text-xs">Trusted by Sairam Group</span>
          </div>
        </div>
      </div>
    </div>
  );
}