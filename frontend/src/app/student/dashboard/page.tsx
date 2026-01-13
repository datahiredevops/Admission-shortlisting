"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Home, LogOut, Edit3, Save, User, Building2, ChevronRight, 
  CheckCircle, XCircle, AlertCircle, Clock, AlertTriangle, BookOpen, Users, FileText, CreditCard 
} from "lucide-react";
import api from "../../../lib/api";

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [myApplications, setMyApplications] = useState<any[]>([]);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("home");
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ mobile: "", email: "", address_city: "", address_state: "" });

  useEffect(() => {
    const userData = localStorage.getItem("student_user");
    if (!userData) { router.push("/login"); return; }
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    fetchApplications(parsedUser.email);
  }, []);

  const fetchApplications = async (email: string) => {
    setLoading(true);
    try {
        const res = await api.get(`/student/my-applications/?email=${email}`);
        setMyApplications(res.data);
        if (selectedApp) {
            const updated = res.data.find((a:any) => a.id === selectedApp.id);
            if (updated) setSelectedApp(updated);
        } else if (res.data.length > 0) {
            setSelectedApp(res.data[0]);
        }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => {
    if (selectedApp) {
        setEditForm({
            mobile: selectedApp.mobile || "",
            email: selectedApp.email || "",
            address_city: selectedApp.address_city || "",
            address_state: selectedApp.address_state || ""
        });
    }
  }, [selectedApp]);

  const handleOfferResponse = async (appId: string, action: "Accept" | "Decline", appName: string, type: string) => {
    if (action === "Decline") {
        if(!confirm("Are you sure you want to decline this offer? This cannot be undone.")) return;
        try {
            await api.post(`/student/respond-offer/?application_id=${appId}`, { action: "Decline" });
            fetchApplications(user.email);
        } catch(err) { alert("Action failed."); }
        return;
    }
    if (action === "Accept") {
        if(!confirm(`🎉 Congratulations!\n\nTo confirm your seat at ${appName}, you need to complete the admission fee payment.\n\nClick OK to proceed to the secure payment gateway.`)) return;
        try {
            await api.post(`/student/respond-offer/?application_id=${appId}`, { action: "Accept" });
            router.push(`/student/payment?app_id=${appId}&type=${type}`);
        } catch(err) { alert("Could not proceed."); }
    }
  };

  const handlePaymentRedirect = (appId: string, type: string) => {
      router.push(`/student/payment?app_id=${appId}&type=${type}`);
  };

  const handleSaveChanges = async () => {
    if (!selectedApp) return;
    try {
        await api.put(`/student/update-profile/?application_id=${selectedApp.application_ref_id}`, editForm);
        setIsEditing(false);
        alert("Details Updated!");
        fetchApplications(user.email);
    } catch (err) { alert("Update failed."); }
  };

  if (!user) return <div className="p-10 text-center">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-64 bg-blue-900 text-white flex flex-col hidden md:flex shadow-xl z-10">
        <div className="p-6 border-b border-blue-800">
          <h2 className="text-xl font-bold tracking-tight">Student Portal</h2>
          <p className="text-xs text-blue-300 mt-1 truncate">{user.email}</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setActiveTab("home")} className={`flex items-center space-x-3 w-full p-3 rounded transition ${activeTab === "home" ? "bg-blue-700 shadow-md" : "hover:bg-blue-800"}`}>
            <Home size={20} /> <span>Home Overview</span>
          </button>
          <button onClick={() => { if(myApplications.length>0) setActiveTab("application"); }} className={`flex items-center space-x-3 w-full p-3 rounded transition ${activeTab === "application" ? "bg-blue-700 shadow-md" : "hover:bg-blue-800"}`}>
            <User size={20} /> <span>Application Details</span>
          </button>
        </nav>
        <div className="p-4 border-t border-blue-800">
          <button onClick={() => { localStorage.removeItem("student_user"); router.push("/login"); }} className="flex items-center space-x-3 text-red-300 hover:text-white transition w-full p-2 rounded hover:bg-blue-800">
            <LogOut size={20} /> <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        {/* --- HOME OVERVIEW --- */}
        {activeTab === "home" && (
            <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Hello, {user.full_name.split(' ')[0]} 👋</h1>
                    <p className="text-gray-500 mt-1">Here are your active applications.</p>
                </header>

                {loading ? <div className="text-gray-500">Refreshing data...</div> : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {myApplications.map((app) => (
                            <div key={app.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all transform hover:-translate-y-1">
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`p-3 rounded-lg ${app.institution_type === 'School' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                                            <Building2 size={24} />
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                                            app.application_status === 'Accepted' ? 'bg-green-100 text-green-700 animate-pulse' :
                                            app.application_status === 'Offer Accepted' ? 'bg-blue-100 text-blue-700' :
                                            app.application_status === 'Admission Confirmed' ? 'bg-indigo-100 text-indigo-700' :
                                            app.application_status === 'Waitlisted' ? 'bg-yellow-100 text-yellow-700' :
                                            app.application_status === 'Declined' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                                        }`}>
                                            {app.application_status === "Offer Accepted" ? "Pending Payment" : app.application_status}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-800 mb-1 leading-tight h-12 line-clamp-2">{app.institution_name}</h3>
                                    <p className="text-xs text-gray-400 font-mono mb-4">{app.application_ref_id}</p>
                                    <div className="border-t pt-4"><p className="text-xs text-gray-400 uppercase font-bold">Applying For</p><p className="font-medium text-gray-700 truncate">{app.course_pref_1}</p></div>
                                </div>
                                <div className="bg-gray-50 p-4 border-t border-gray-100">
                                    {app.application_status === "Accepted" && (
                                        <div className="flex gap-2">
                                            <button onClick={() => handleOfferResponse(app.application_ref_id, "Accept", app.institution_name, app.institution_type)} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded shadow text-sm">Accept</button>
                                            <button onClick={() => handleOfferResponse(app.application_ref_id, "Decline", app.institution_name, app.institution_type)} className="flex-1 bg-white border border-red-200 text-red-600 hover:bg-red-50 font-bold py-2 rounded text-sm">Decline</button>
                                        </div>
                                    )}
                                    {app.application_status === "Offer Accepted" && (
                                        <button onClick={() => handlePaymentRedirect(app.application_ref_id, app.institution_type)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded shadow text-sm flex items-center justify-center gap-2"><CreditCard size={16}/> Pay Admission Fee</button>
                                    )}
                                    {app.application_status !== "Accepted" && app.application_status !== "Offer Accepted" && (
                                        <button onClick={() => { setSelectedApp(app); setActiveTab("application"); }} className="w-full text-blue-600 hover:text-blue-800 font-bold text-sm flex items-center justify-center gap-2">View Full Details <ChevronRight size={16} /></button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}

        {/* --- APPLICATION DETAILS --- */}
        {activeTab === "application" && selectedApp && (
             <div className="max-w-4xl mx-auto space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <button onClick={() => setActiveTab("home")} className="text-gray-500 hover:text-gray-800 text-sm">← Back to Home</button>
                    <select className="bg-white border p-2 rounded shadow-sm text-sm font-medium" value={selectedApp.id} onChange={(e) => { const app = myApplications.find(a => a.id === Number(e.target.value)); setSelectedApp(app); }}>
                        {myApplications.map(app => (<option key={app.id} value={app.id}>{app.institution_name} ({app.application_status})</option>))}
                    </select>
                </div>

                {/* --- 1. OFFER RECEIVED (Accepted) --- */}
                {selectedApp.application_status === "Accepted" && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-6 shadow-sm">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4"><div className="bg-green-100 p-3 rounded-full"><CheckCircle className="text-green-600 w-8 h-8" /></div><div><h2 className="text-xl font-bold text-green-800">Admission Offered!</h2><p className="text-green-700 text-sm">You have been selected. Please accept to proceed.</p></div></div>
                            <div className="flex gap-3">
                                <button onClick={() => handleOfferResponse(selectedApp.application_ref_id, "Accept", selectedApp.institution_name, selectedApp.institution_type)} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold shadow-lg">Accept Offer</button>
                                <button onClick={() => handleOfferResponse(selectedApp.application_ref_id, "Decline", selectedApp.institution_name, selectedApp.institution_type)} className="bg-white border border-red-200 text-red-600 hover:bg-red-50 px-6 py-2 rounded-lg font-bold">Decline</button>
                            </div>
                        </div>
                        {/* --- OFFER LETTER DOWNLOAD (Before Payment) --- */}
                        {selectedApp.admit_letter_url && (
                            <div className="mt-4 pt-4 border-t border-green-200">
                                <a href={`http://localhost:8000/files/${selectedApp.admit_letter_url}`} target="_blank" className="flex items-center gap-2 text-green-800 font-bold hover:underline"><FileText size={18}/> View Provisional Offer Letter</a>
                            </div>
                        )}
                    </div>
                )}

                {/* --- 2. OFFER ACCEPTED (Pending Payment) --- */}
                {selectedApp.application_status === "Offer Accepted" && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 shadow-sm">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4"><div className="bg-blue-100 p-3 rounded-full"><CreditCard className="text-blue-600 w-8 h-8" /></div><div><h2 className="text-xl font-bold text-blue-900">Offer Accepted!</h2><p className="text-blue-700 text-sm">Your seat is reserved. Please complete fee payment to confirm.</p></div></div>
                            <button onClick={() => handlePaymentRedirect(selectedApp.application_ref_id, selectedApp.institution_type)} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold shadow-lg flex items-center gap-2">Proceed to Payment <ChevronRight size={18}/></button>
                        </div>
                        {selectedApp.admit_letter_url && (
                            <div className="mt-4 pt-4 border-t border-blue-200">
                                <a href={`http://localhost:8000/files/${selectedApp.admit_letter_url}`} target="_blank" className="flex items-center gap-2 text-blue-800 font-bold hover:underline"><FileText size={18}/> View Provisional Offer Letter</a>
                            </div>
                        )}
                    </div>
                )}

                {/* --- 3. CONFIRMED --- */}
                {selectedApp.application_status === "Admission Confirmed" && (
                    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 shadow-sm">
                        <div className="flex items-center gap-4"><div className="bg-indigo-100 p-3 rounded-full"><CheckCircle className="text-indigo-600 w-8 h-8" /></div><div><h2 className="text-xl font-bold text-indigo-900">Admission Confirmed!</h2><p className="text-indigo-700 text-sm">Fee payment successful. Welcome to the family!</p></div></div>
                        {selectedApp.admit_letter_url && (
                            <div className="mt-4 pt-4 border-t border-indigo-200">
                                <a href={`http://localhost:8000/files/${selectedApp.admit_letter_url}`} target="_blank" className="flex items-center gap-2 text-indigo-800 font-bold hover:underline"><FileText size={18}/> Download Official Admit Letter</a>
                            </div>
                        )}
                    </div>
                )}

                {/* OTHER STATUSES */}
                {selectedApp.application_status === "Waitlisted" && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 flex items-center gap-4 shadow-sm text-yellow-800"><div className="bg-yellow-100 p-3 rounded-full"><AlertTriangle className="text-yellow-600 w-8 h-8" /></div><div><h2 className="text-xl font-bold">You are on the Waitlist</h2><p className="text-sm mt-1 opacity-90">We will notify you immediately if a seat becomes available.</p></div></div>
                )}
                {selectedApp.application_status === "Pending" && (
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center gap-3 text-gray-700"><Clock size={20} /> <span className="font-medium">Your application is currently under review.</span></div>
                )}

                {/* AI & INFO CARDS (Same as before) */}
                {selectedApp.ai_probability > 0 && selectedApp.application_status === "Pending" && (
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6 text-white mb-6">
                        <div className="flex justify-between items-center mb-2"><h3 className="font-bold text-lg flex items-center gap-2">✨ AI Admission Predictor</h3><span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold">BETA</span></div>
                        <div className="flex items-end gap-2 mb-2"><span className="text-4xl font-extrabold">{selectedApp.ai_probability}%</span><span className="text-sm text-indigo-100 mb-1">Probability</span></div>
                        <div className="w-full bg-black/20 rounded-full h-2 mb-2"><div className="bg-white h-2 rounded-full" style={{ width: `${selectedApp.ai_probability}%` }}></div></div>
                        <p className="text-xs text-indigo-100 opacity-80">Based on your Cutoff vs Previous Trends.</p>
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <div className="flex justify-between items-center mb-6 border-b pb-4"><h2 className="text-xl font-bold text-gray-800">{selectedApp.institution_name}</h2><button onClick={() => isEditing ? handleSaveChanges() : setIsEditing(true)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold ${isEditing ? 'bg-green-600 text-white' : 'bg-white border text-gray-600'}`}>{isEditing ? <><Save size={16}/> Save</> : <><Edit3 size={16}/> Edit Contact</>}</button></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1"><label className="text-xs font-bold text-gray-400 uppercase">Mobile</label>{isEditing ? <input className="w-full border p-2 rounded" value={editForm.mobile} onChange={e=>setEditForm({...editForm, mobile: e.target.value})}/> : <p className="font-medium">{selectedApp.mobile}</p>}</div>
                        <div className="space-y-1"><label className="text-xs font-bold text-gray-400 uppercase">Email</label>{isEditing ? <input className="w-full border p-2 rounded" value={editForm.email} onChange={e=>setEditForm({...editForm, email: e.target.value})}/> : <p className="font-medium">{selectedApp.email}</p>}</div>
                        <div className="space-y-1"><label className="text-xs font-bold text-gray-400 uppercase">City</label>{isEditing ? <input className="w-full border p-2 rounded" value={editForm.address_city} onChange={e=>setEditForm({...editForm, address_city: e.target.value})}/> : <p className="font-medium">{selectedApp.address_city}</p>}</div>
                        <div className="space-y-1"><label className="text-xs font-bold text-gray-400 uppercase">Ref ID</label><p className="font-mono text-gray-500 bg-gray-50 p-1 rounded inline-block">{selectedApp.application_ref_id}</p></div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><BookOpen size={18} className="text-blue-600"/> Academic Record</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Board</span><span className="font-medium">{selectedApp.board_of_study || selectedApp.previous_board || "N/A"}</span></div>
                            <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Reg Number</span><span className="font-medium">{selectedApp.sslc_reg_no || selectedApp.emis_number || "N/A"}</span></div>
                            <div className="flex justify-between pt-2"><span className="text-gray-500">Score / Cutoff</span><span className="font-bold text-blue-600 text-lg">{selectedApp.pcm_average || selectedApp.physics || "N/A"}</span></div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><AlertCircle size={18} className="text-green-600"/> Choices & Quota</h3>
                        <div className="space-y-3 text-sm">
                            <div className="bg-gray-50 p-2 rounded"><span className="block text-gray-400 text-xs uppercase">1st Preference</span><span className="font-bold text-gray-800">{selectedApp.course_pref_1}</span></div>
                            <div className="grid grid-cols-2 gap-4 pt-2 mt-2 border-t">
                                <div><span className="block text-gray-500 text-xs uppercase">Community</span><span className="font-bold text-gray-800">{selectedApp.community}</span></div>
                                <div><span className="block text-gray-500 text-xs uppercase">Admission Quota</span><span className={`font-bold ${selectedApp.is_management_quota ? 'text-orange-600' : 'text-green-600'}`}>{selectedApp.is_management_quota ? "Management Quota" : "Merit / General"}</span></div>
                            </div>
                        </div>
                    </div>
                </div>
             </div>
        )}
      </main>
    </div>
  );
}