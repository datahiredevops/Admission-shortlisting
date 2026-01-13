"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  Building2, GraduationCap, Stethoscope, 
  ChevronDown, FileText, 
  MessageSquare, Send, X, Sparkles 
} from "lucide-react";
import api from "../../../lib/api";

// --- Types ---
interface Application {
  id: number;
  application_ref_id: string;
  full_name: string;
  email: string;
  mobile: string;
  community: string;
  pcm_average: number; 
  physics: number;     
  course_pref_1: string; 
  qualification_status: string; 
  application_status: string;
  ai_probability: number; 
  is_management_quota: boolean;
  admit_letter_url: string;
}

interface InstitutionStats {
  id: number;
  name: string;
  type: string;
  stats: {
    total: number;
    accepted: number;
    declined: number;
    waitlisted: number;
    pending: number;
    revenue: number;
  };
}

interface ChatMessage {
  sender: "user" | "ai";
  text: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [admin, setAdmin] = useState<any>(null);
  const [apps, setApps] = useState<Application[]>([]);
  
  // Management State
  const [breakdown, setBreakdown] = useState<InstitutionStats[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // --- AI CHAT STATE ---
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: "ai", text: "Hello! I am your Admission Analyst. Ask me about revenue, counts, or daily trends." }
  ]);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // PREMADE QUESTIONS
  const suggestions = [
    "💰 Total Revenue Collected",
    "📊 How many admitted?",
    "⏳ Pending Applications",
    "📅 Admissions Today"
  ];

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) { router.push("/admin"); return; }
    const adminData = JSON.parse(token);
    setAdmin(adminData);

    if (!adminData.institution_id) { 
        // Management: Fetch Analytics
        api.get("/admin/analytics/group-overview")
           .then(res => setBreakdown(res.data.breakdown))
           .finally(() => setLoading(false));
    } else {
        // Principal: Fetch Student List
        api.get(`/admin/applications/${adminData.institution_id}`)
           .then(res => setApps(res.data))
           .finally(() => setLoading(false));
    }
  }, []);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isChatOpen]);

  // --- AI HANDLER ---
  const handleAskAi = async (question: string) => {
    if (!question.trim()) return;
    
    // Add User Message
    const newMessages = [...messages, { sender: "user", text: question } as ChatMessage];
    setMessages(newMessages);
    setChatInput("");
    setIsAiThinking(true);

    try {
        // Call Backend with Institution ID for RBAC
        const res = await api.post("/admin/ask-ai/", { 
            question,
            institution_id: admin.institution_id 
        });
        setMessages([...newMessages, { sender: "ai", text: res.data.answer }]);
    } catch (err) {
        setMessages([...newMessages, { sender: "ai", text: "⚠️ Sorry, I couldn't process that. Please try again." }]);
    } finally {
        setIsAiThinking(false);
    }
  };

  // --- HELPER: Calculate Category Totals ---
  const getCategoryStats = (category: string) => {
    const relevantInsts = breakdown.filter(i => 
       category === 'Engineering' ? (i.type === 'Engineering' || i.type === 'Polytechnic') : i.type === category
    );

    return relevantInsts.reduce((acc, curr) => ({
        total: acc.total + curr.stats.total,
        accepted: acc.accepted + curr.stats.accepted,
        declined: acc.declined + curr.stats.declined,
        waitlisted: acc.waitlisted + curr.stats.waitlisted,
        revenue: acc.revenue + curr.stats.revenue
    }), { total: 0, accepted: 0, declined: 0, waitlisted: 0, revenue: 0 });
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await api.put(`/admin/application/${id}/status`, { status: newStatus });
      setApps(apps.map(app => app.id === id ? { ...app, application_status: newStatus } : app));
    } catch (error) { alert("Failed to update status"); }
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Loading Dashboard...</div>;

  // ==========================================
  // VIEW 1: MANAGEMENT (Super Admin)
  // ==========================================
  const renderManagementView = () => {
    const engStats = getCategoryStats('Engineering');
    const medStats = getCategoryStats('Medical');
    const schoolStats = getCategoryStats('School');

    // --- DEMO CAPACITY LOGIC ---
    const getCapacity = (category: string) => {
        if (category === 'Engineering') return 100; // Demo Capacity
        if (category === 'Medical') return 50;      // Demo Capacity
        if (category === 'School') return 200;      // Demo Capacity
        return 100;
    };

    const renderCard = (title: string, category: string, stats: any, Icon: any, color: string, bg: string, border: string) => {
        const capacity = getCapacity(category);
        const admitted = stats.accepted;
        // Calculate percentage (max 100 to avoid breaking layout)
        const percentage = Math.min(100, Math.round((admitted / capacity) * 100));
        
        return (
            <div 
                onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                className={`bg-white p-6 rounded-xl shadow-sm border-l-8 cursor-pointer transition-all transform hover:-translate-y-1 ${selectedCategory === category ? `border-${color}-600 ring-2 ring-${color}-100` : border}`}
            >
                <div className="flex justify-between items-start mb-4">
                    <div className={`${bg} p-3 rounded-full text-${color}-600`}><Icon size={28}/></div>
                    <ChevronDown className={`text-gray-400 transition-transform ${selectedCategory === category ? 'rotate-180' : ''}`}/>
                </div>
                
                <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                
                {/* --- NEW PROGRESS BAR SECTION --- */}
                <div className="mt-4 mb-2">
                    <div className="flex justify-between text-xs font-semibold mb-1 text-gray-600">
                        <span>{percentage > 90 ? "Critical Availability" : "Admissions Open"}</span>
                        <span className="text-gray-900">{admitted} / {capacity} Seats Filled</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                            className={`h-2.5 rounded-full transition-all duration-500 ${percentage > 90 ? 'bg-red-500' : 'bg-green-500'}`} 
                            style={{ width: `${percentage}%` }}
                        ></div>
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-y-2 text-sm">
                    <div className="text-gray-500">Applied: <span className="font-bold text-gray-900">{stats.total}</span></div>
                    <div className="text-green-600">Admitted: <span className="font-bold">{stats.accepted}</span></div>
                    <div className="text-red-500">Declined: <span className="font-bold">{stats.declined}</span></div>
                    <div className="text-yellow-600">Waitlist: <span className="font-bold">{stats.waitlisted}</span></div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-400 uppercase font-bold">Revenue Collected</p>
                    <p className="text-2xl font-bold text-green-700">₹ {stats.revenue.toLocaleString()}</p>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8 font-sans pb-24">
             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8 flex justify-between items-center">
                <div><h1 className="text-3xl font-bold text-gray-900">Admissions Overview</h1><p className="text-gray-500">Academic Year 2026-27 • Group-wide Statistics</p></div>
                <button onClick={() => { localStorage.removeItem("admin_token"); router.push("/admin"); }} className="text-red-600 hover:text-red-800 font-bold text-sm">Logout</button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {renderCard("Engineering & Poly", "Engineering", engStats, Building2, "blue", "bg-blue-100", "border-blue-500")}
                {renderCard("Medical Colleges", "Medical", medStats, Stethoscope, "green", "bg-green-100", "border-green-500")}
                {renderCard("Schools", "School", schoolStats, GraduationCap, "orange", "bg-orange-100", "border-orange-500")}
             </div>

             {selectedCategory && (
                 <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                        <h3 className="font-bold text-gray-800 text-lg">{selectedCategory} Breakdown</h3>
                        <button onClick={() => setSelectedCategory(null)} className="text-sm text-gray-500 hover:text-gray-800">Close View</button>
                    </div>
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Institution Name</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Total Apps</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-green-600 uppercase">Admitted</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-red-500 uppercase">Declined</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-yellow-600 uppercase">Waitlist</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase">Revenue</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {breakdown
                                .filter(i => selectedCategory === 'Engineering' ? (i.type === 'Engineering' || i.type === 'Polytechnic') : i.type === selectedCategory)
                                .map((inst) => (
                                <tr key={inst.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm font-bold text-gray-800">{inst.name}</td>
                                    <td className="px-6 py-4 text-center text-sm font-bold text-blue-600">{inst.stats.total}</td>
                                    <td className="px-6 py-4 text-center text-sm font-bold text-green-600 bg-green-50">{inst.stats.accepted}</td>
                                    <td className="px-6 py-4 text-center text-sm font-bold text-red-600 bg-red-50">{inst.stats.declined}</td>
                                    <td className="px-6 py-4 text-center text-sm font-bold text-yellow-600 bg-yellow-50">{inst.stats.waitlisted}</td>
                                    <td className="px-6 py-4 text-right text-sm font-bold text-gray-800">₹ {inst.stats.revenue.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
             )}
        </div>
    );
  };

  // ==========================================
  // VIEW 2: PRINCIPAL (List View)
  // ==========================================
  const renderPrincipalView = () => {
    const isSchool = admin?.institution_type === "School";
    const isMedical = admin?.institution_type === "Medical";
    const isEngineering = admin?.institution_type === "Engineering" || admin?.institution_type === "Polytechnic";

    return (
        <div className="min-h-screen bg-gray-50 p-8 pb-24">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-blue-900">{admin?.institution_name || "Admission Dashboard"}</h1>
              <p className="text-gray-500 text-sm mt-1">Logged in as: <span className="font-semibold text-gray-800">{admin?.name}</span> • <span className={`ml-2 px-2 py-0.5 rounded text-xs font-bold ${isSchool ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>{admin?.institution_type || "Admin"} Panel</span></p>
            </div>
            <button onClick={() => { localStorage.removeItem("admin_token"); router.push("/admin"); }} className="bg-red-50 text-red-600 px-4 py-2 rounded hover:bg-red-100 text-sm font-medium transition">Logout</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-blue-500"><h3 className="text-gray-400 text-xs uppercase font-bold">Total Applications</h3><p className="text-3xl font-bold text-gray-800 mt-1">{apps.length}</p></div>
            <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-orange-500"><h3 className="text-gray-400 text-xs uppercase font-bold">Pending Action</h3><p className="text-3xl font-bold text-orange-600 mt-1">{apps.filter(a => a.application_status === "Pending").length}</p></div>
            <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-yellow-500"><h3 className="text-gray-400 text-xs uppercase font-bold">Waitlisted</h3><p className="text-3xl font-bold text-yellow-600 mt-1">{apps.filter(a => a.application_status === "Waitlisted").length}</p></div>
            <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-green-500"><h3 className="text-gray-400 text-xs uppercase font-bold">Admitted</h3><p className="text-3xl font-bold text-green-600 mt-1">{apps.filter(a => a.application_status === "Accepted").length}</p></div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Ref ID</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{isSchool ? "Child / Parent Name" : "Applicant Name"}</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{isSchool ? "Grade Applied" : isMedical ? "NEET Score" : "PCM Cutoff"}</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">AI Match Score</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{isSchool ? "Parent Contact" : "Community / Quota"}</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Decision</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {apps.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600 font-mono">{app.application_ref_id}</td>
                    <td className="px-6 py-4"><div className="text-sm font-medium text-gray-900">{app.full_name}</div><div className="text-xs text-gray-500">{app.email}</div></td>
                    <td className="px-6 py-4 text-sm text-gray-700 font-medium">{isSchool && <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">{app.course_pref_1}</span>}{isMedical && <span className="font-mono">{app.physics} / 720</span>}{isEngineering && <span className={`font-bold ${app.pcm_average > 50 ? 'text-green-600' : 'text-orange-500'}`}>{app.pcm_average?.toFixed(2) || 0} / 200</span>}</td>
                    <td className="px-6 py-4">{app.ai_probability ? (<div className="flex items-center gap-2"><div className="w-12 bg-gray-200 rounded-full h-1.5"><div className={`h-1.5 rounded-full ${app.ai_probability > 80 ? 'bg-green-500' : app.ai_probability > 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${app.ai_probability}%` }}></div></div><span className="text-xs font-bold text-gray-700">{app.ai_probability}%</span></div>) : <span className="text-xs text-gray-400">N/A</span>}</td>
                    
                    {/* COMMUNITY & QUOTA */}
                    <td className="px-6 py-4 text-sm">
                        {isSchool ? (app.mobile) : (
                            <div className="flex flex-col gap-1 items-start">
                                <span className="text-gray-700 font-medium">{app.community}</span>
                                {app.is_management_quota && (<span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded border border-orange-200">MGMT</span>)}
                                {!app.is_management_quota && (<span className="text-xs text-gray-400">Merit</span>)}
                            </div>
                        )}
                    </td>

                    {/* DECISION BUTTONS & PDF ICON */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {app.application_status === "Pending" ? (
                        <>
                          <button onClick={() => handleStatusChange(app.id, "Accepted")} className="text-green-600 hover:bg-green-50 px-3 py-1 rounded border border-green-200 text-xs uppercase font-bold">Accept</button>
                          <button onClick={() => handleStatusChange(app.id, "Waitlisted")} className="text-yellow-600 hover:bg-yellow-50 px-3 py-1 rounded border border-yellow-200 text-xs uppercase font-bold">Waitlist</button>
                          <button onClick={() => handleStatusChange(app.id, "Declined")} className="text-red-600 hover:bg-red-50 px-3 py-1 rounded border border-red-200 text-xs uppercase font-bold">Decline</button>
                        </>
                      ) : (
                        <div className="flex items-center gap-3">
                            <span className={`font-bold text-xs px-2 py-1 rounded ${app.application_status === "Accepted" ? "bg-green-50 text-green-700" : app.application_status === "Waitlisted" ? "bg-yellow-50 text-yellow-700" : "bg-red-50 text-red-700"}`}>{app.application_status.toUpperCase()}</span>
                            {/* Admit Letter Icon */}
                            {app.application_status === "Accepted" && app.admit_letter_url && (
                                <a href={app.admit_letter_url} target="_blank" className="text-blue-600 hover:text-blue-800" title="View Admit Letter"><FileText size={18}/></a>
                            )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
    );
  };

  return (
    <>
        {/* Render the correct dashboard view */}
        {!admin?.institution_id ? renderManagementView() : renderPrincipalView()}

        {/* --- FLOATING AI CHAT WIDGET --- */}
        <div className="fixed bottom-6 right-6 z-50">
            {isChatOpen ? (
                <div className="bg-white rounded-2xl shadow-2xl w-96 border border-gray-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 duration-300" style={{ height: "500px" }}>
                    {/* Header */}
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 flex justify-between items-center text-white">
                        <div className="flex items-center gap-2">
                            <Sparkles size={18} />
                            <span className="font-bold">Admission AI Analyst</span>
                        </div>
                        <button onClick={() => setIsChatOpen(false)} className="hover:bg-white/20 p-1 rounded transition"><X size={18}/></button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3 rounded-lg text-sm ${
                                    msg.sender === 'user' 
                                    ? 'bg-purple-600 text-white rounded-br-none' 
                                    : 'bg-white border text-gray-700 rounded-bl-none shadow-sm'
                                }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isAiThinking && (
                            <div className="flex justify-start">
                                <div className="bg-gray-100 p-3 rounded-lg text-xs text-gray-500 italic animate-pulse">Thinking...</div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Suggestions */}
                    <div className="p-2 bg-white border-t border-gray-100 overflow-x-auto flex gap-2 whitespace-nowrap scrollbar-hide">
                        {suggestions.map((q, i) => (
                            <button 
                                key={i} 
                                onClick={() => handleAskAi(q)}
                                className="px-3 py-1 bg-gray-100 hover:bg-purple-50 hover:text-purple-700 text-xs rounded-full border border-gray-200 transition"
                            >
                                {q}
                            </button>
                        ))}
                    </div>

                    {/* Input */}
                    <div className="p-3 bg-white border-t border-gray-200 flex gap-2">
                        <input 
                            type="text" 
                            className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                            placeholder="Ask me anything..."
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAskAi(chatInput)}
                        />
                        <button 
                            onClick={() => handleAskAi(chatInput)}
                            disabled={!chatInput.trim()}
                            className="bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 disabled:opacity-50 transition"
                        >
                            <Send size={18}/>
                        </button>
                    </div>
                </div>
            ) : (
                <button 
                    onClick={() => setIsChatOpen(true)}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:scale-105 text-white p-4 rounded-full shadow-lg transition-transform flex items-center gap-2 font-bold"
                >
                    <MessageSquare size={24} />
                    <span className="hidden md:inline">Ask AI</span>
                </button>
            )}
        </div>
    </>
  );
}