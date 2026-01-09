"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../lib/api";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/admin/login/", { email, password });
      
      // Save Admin Details to LocalStorage (Simple Session)
      localStorage.setItem("admin_token", JSON.stringify(res.data));
      
      // Redirect to Dashboard
      router.push("/admin/dashboard");
      
    } catch (err: any) {
      setError(err.response?.data?.detail || "Login Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-200">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Admin Portal</h1>
          <p className="text-sm text-gray-500">Sairam Group of Institutions</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700">Official Email ID</label>
            <input
              type="email"
              required
              className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-blue-500"
              placeholder="admin@sairam.edu.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">Password</label>
            <input
              type="password"
              required
              className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-900 text-white py-2 rounded hover:bg-blue-800 transition disabled:bg-gray-400"
          >
            {loading ? "Verifying..." : "Login to Dashboard"}
          </button>
        </form>
        
        <div className="mt-4 text-center text-xs text-gray-400">
          Authorized Personnel Only
        </div>
      </div>
    </div>
  );
}