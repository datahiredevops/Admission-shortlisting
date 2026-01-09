"use client";
import { useState } from "react";
import Link from "next/link";
import { 
  GraduationCap, 
  Building2, 
  BarChart3, 
  UserPlus, 
  LogIn, 
  X, 
  ArrowRight 
} from "lucide-react";

export default function LandingPage() {
  const [showStudentMenu, setShowStudentMenu] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col font-sans">
      
      {/* 1. Hero Section */}
      <header className="bg-blue-900 text-white py-20 px-4 text-center shadow-lg relative overflow-hidden">
        {/* Decorative Circles */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-800 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-800 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>

        <div className="max-w-4xl mx-auto relative z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
            Sairam Group of Institutions
          </h1>
          <p className="text-blue-200 text-lg md:text-2xl font-light">
            Common Admission Portal • Academic Year 2026-2027
          </p>
        </div>
      </header>

      {/* 2. The Three Portals (Cards) */}
      <main className="flex-grow flex items-center justify-center p-6 -mt-16 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl w-full">
          
          {/* TILE 1: STUDENT ZONE (Click to Open Menu) */}
          <div 
            onClick={() => setShowStudentMenu(true)}
            className="bg-white p-10 rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition transform hover:-translate-y-2 cursor-pointer group flex flex-col items-center text-center h-full justify-between"
          >
            <div>
                <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors mx-auto">
                <GraduationCap className="text-blue-600 w-10 h-10 group-hover:text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Student Zone</h2>
                <p className="text-gray-500 leading-relaxed text-lg">
                Apply for Engineering, Medical, or Schools, or log in to check your admission status.
                </p>
            </div>
            <div className="mt-8 text-blue-600 font-bold flex items-center gap-2">
                Enter Portal <ArrowRight size={20} />
            </div>
          </div>

          {/* TILE 2: INSTITUTION ADMIN (Principal) */}
          <Link href="/admin" className="h-full">
            <div className="bg-white p-10 rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition transform hover:-translate-y-2 group flex flex-col items-center text-center h-full justify-between">
                <div>
                    <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mb-6 group-hover:bg-green-600 transition-colors mx-auto">
                    <Building2 className="text-green-600 w-10 h-10 group-hover:text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">Institution Admin</h2>
                    <p className="text-gray-500 leading-relaxed text-lg">
                    Login for Principals and Admission Officers to manage applications for your specific campus.
                    </p>
                </div>
                <div className="mt-8 text-green-600 font-bold flex items-center gap-2">
                    Staff Login <ArrowRight size={20} />
                </div>
            </div>
          </Link>

          {/* TILE 3: CORRESPONDENT (Group Management) */}
          <Link href="/admin" className="h-full">
            <div className="bg-white p-10 rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition transform hover:-translate-y-2 group flex flex-col items-center text-center h-full justify-between">
                <div>
                    <div className="bg-purple-100 w-20 h-20 rounded-full flex items-center justify-center mb-6 group-hover:bg-purple-600 transition-colors mx-auto">
                    <BarChart3 className="text-purple-600 w-10 h-10 group-hover:text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">Management</h2>
                    <p className="text-gray-500 leading-relaxed text-lg">
                    Correspondent and Chairman login to monitor group-wide admission statistics and analytics.
                    </p>
                </div>
                <div className="mt-8 text-purple-600 font-bold flex items-center gap-2">
                    Management Login <ArrowRight size={20} />
                </div>
            </div>
          </Link>

        </div>
      </main>

      {/* --- STUDENT POPUP MODAL --- */}
      {showStudentMenu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden relative animate-in zoom-in-95 duration-200">
                
                {/* Close Button */}
                <button 
                    onClick={() => setShowStudentMenu(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 bg-gray-100 rounded-full transition"
                >
                    <X size={20} />
                </button>

                <div className="p-8 text-center bg-blue-50 border-b border-blue-100">
                    <h2 className="text-2xl font-bold text-blue-900">Student Portal</h2>
                    <p className="text-blue-600">Please select an option to proceed</p>
                </div>

                <div className="p-8 grid gap-4">
                    {/* OPTION 1: NEW APPLICANT */}
                    <Link href="/apply" onClick={() => setShowStudentMenu(false)}>
                        <div className="flex items-center gap-4 p-4 border rounded-xl hover:bg-blue-50 hover:border-blue-300 transition cursor-pointer group">
                            <div className="bg-blue-100 p-3 rounded-full text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <UserPlus size={24} />
                            </div>
                            <div className="text-left">
                                <h3 className="font-bold text-gray-800 text-lg">New Admission</h3>
                                <p className="text-sm text-gray-500">Start a fresh application for 2026-27</p>
                            </div>
                            <ArrowRight className="ml-auto text-gray-300 group-hover:text-blue-600" />
                        </div>
                    </Link>

                    {/* OPTION 2: EXISTING LOGIN */}
                    <Link href="/login" onClick={() => setShowStudentMenu(false)}>
                        <div className="flex items-center gap-4 p-4 border rounded-xl hover:bg-green-50 hover:border-green-300 transition cursor-pointer group">
                            <div className="bg-green-100 p-3 rounded-full text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                                <LogIn size={24} />
                            </div>
                            <div className="text-left">
                                <h3 className="font-bold text-gray-800 text-lg">Student Login</h3>
                                <p className="text-sm text-gray-500">Already applied? Check status or edit</p>
                            </div>
                            <ArrowRight className="ml-auto text-gray-300 group-hover:text-green-600" />
                        </div>
                    </Link>
                </div>
                
                <div className="bg-gray-50 p-4 text-center text-xs text-gray-400">
                    Sairam Group • Common Admission System
                </div>
            </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-50 text-center py-8 text-gray-400 text-sm mt-auto border-t border-gray-200">
        &copy; 2026 Sairam Group of Institutions. All rights reserved.
      </footer>
    </div>
  );
}