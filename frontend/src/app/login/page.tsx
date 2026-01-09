"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../lib/api";

export default function StudentLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/student/login/", { email, dob });
      
      // Save Student Identity (Email)
      localStorage.setItem("student_user", JSON.stringify(res.data));
      router.push("/student/dashboard");
      
    } catch (err: any) {
      setError("Invalid Email or Date of Birth. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-200">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-blue-900">Applicant Login</h1>
          <p className="text-sm text-gray-500">View all your applications in one place</p>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm text-center">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700">Registered Email ID</label>
            <input
              type="email"
              required
              className="w-full mt-1 p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              placeholder="student@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">Date of Birth</label>
            <input
              type="date"
              required
              className="w-full mt-1 p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition"
          >
            {loading ? "Verifying..." : "Login to Dashboard"}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <a href="/" className="text-sm text-gray-500 hover:text-blue-600">← Back to Home</a>
        </div>
      </div>
    </div>
  );
}