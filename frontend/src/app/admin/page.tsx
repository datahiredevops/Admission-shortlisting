"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios"; // We will use direct Axios, no imports to break

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // --- HARDCODED CLOUD URL ---
  // This guarantees we never touch 192.168...
  const BACKEND_URL = "https://sairam-backend.onrender.com";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    console.log("Attempting login to:", `${BACKEND_URL}/admin/login/`);

    try {
      // Direct call to the cloud
      const res = await axios.post(`${BACKEND_URL}/admin/login/`, { 
        email, 
        password 
      });

      localStorage.setItem("admin_token", JSON.stringify(res.data));
      router.push("/admin/dashboard");
      
    } catch (err: any) {
      console.error("Login Error:", err);
      setError("Login Failed. Check credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-600 font-sans">
      <div className="bg-white p-10 rounded-xl shadow-2xl w-full max-w-md border border-gray-100 relative overflow-hidden">
        
        {/* --- DEBUG BADGE --- */}
        <div className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 absolute top-2 right-2 rounded">
          ● CLOUD CONNECTED V2
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Portal</h1>
          <p className="text-gray-500 text-sm uppercase tracking-wide">Sairam Group of Institutions</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center mb-6 border border-red-100 font-semibold animate-pulse">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Official Email ID</label>
            <input 
              type="email" 
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition outline-none"
              placeholder="admin@sairam.edu.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
            <input 
              type="password" 
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition outline-none font-mono"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white font-bold text-lg shadow-lg transition-all transform hover:-translate-y-1 ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-900 hover:bg-blue-800 hover:shadow-xl"
            }`}
          >
            {loading ? "Verifying..." : "Login to Dashboard"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">Authorized Personnel Only</p>
      </div>
    </div>
  );
}