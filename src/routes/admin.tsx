import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { 
  LayoutDashboard, BookOpen, Layers, Calendar, FileText, Users, 
  Plus, Edit, Trash2, LogOut, ArrowLeft,
  Image as ImageIcon, ExternalLink, X
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin")({
  component: AdminCMS,
});

function LoginView({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === "admin@nexora.id" && password === "nexora123") {
      onLogin();
    } else {
      setError("Email atau Password salah!");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md">
        <form onSubmit={handleLogin} className="space-y-4 rounded-3xl bg-white p-8 shadow-xl">
          <h1 className="text-2xl font-bold text-center mb-6">Nexora Admin</h1>
          {error && <div className="text-red-500 text-xs text-center">{error}</div>}
          <input 
            type="email" 
            placeholder="Email" 
            className="w-full p-3 border rounded-xl"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="w-full p-3 border rounded-xl"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button type="submit" className="w-full bg-primary text-white p-3 rounded-xl font-bold">Login</button>
        </form>
      </div>
    </div>
  );
}

function AdminCMS() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("admin_auth") === "true";
    }
    return false;
  });

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [stats, setStats] = useState({ courses: 0, categories: 0, submissions: 0, materials: 0 });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === "dashboard") {
        const [cat, crs, sub, mat] = await Promise.all([
          supabase.from("categories").select("*", { count: "exact", head: true }),
          supabase.from("courses").select("*", { count: "exact", head: true }),
          supabase.from("form_submissions").select("*", { count: "exact", head: true }),
          supabase.from("materials").select("*", { count: "exact", head: true })
        ]);
        setStats({
          categories: cat.count || 0,
          courses: crs.count || 0,
          submissions: sub.count || 0,
          materials: mat.count || 0
        });
      } else {
        const table = activeTab === "submissions" ? "form_submissions" : activeTab;
        const { data: res } = await supabase.from(table).select(
          activeTab === "materials" || activeTab === "schedules" ? "*, courses(title)" : "*"
        ).order("created_at", { ascending: false });
        setData(res || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    if (isLoggedIn) fetchData();
  }, [fetchData, isLoggedIn]);

  const handleLoginSuccess = () => {
    sessionStorage.setItem("admin_auth", "true");
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_auth");
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) return <LoginView onLogin={handleLoginSuccess} />;

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <aside className="w-64 bg-white border-r p-6 space-y-4">
        <h2 className="font-bold text-xl text-primary mb-8">Nexora CMS</h2>
        <nav className="space-y-2">
          {["dashboard", "categories", "courses", "schedules", "materials", "submissions"].map(t => (
            <button 
              key={t} 
              onClick={() => setActiveTab(t)}
              className={`w-full text-left p-3 rounded-xl capitalize ${activeTab === t ? 'bg-primary text-white' : 'hover:bg-slate-100'}`}
            >
              {t}
            </button>
          ))}
          <button onClick={handleLogout} className="w-full text-left p-3 text-red-500 mt-8">Logout</button>
          <Link to="/" className="block p-3 text-slate-500">Back to Site</Link>
        </nav>
      </aside>

      <main className="flex-1 p-8">
        <header className="mb-8">
          <h1 className="text-2xl font-bold capitalize">{activeTab}</h1>
        </header>

        {activeTab === "dashboard" ? (
          <div className="grid grid-cols-4 gap-6">
            {Object.entries(stats).map(([k, v]) => (
              <div key={k} className="bg-white p-6 rounded-3xl border shadow-sm">
                <p className="text-slate-500 capitalize">{k}</p>
                <p className="text-3xl font-bold">{v}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="p-4">Info</th>
                  {activeTab !== "categories" && activeTab !== "submissions" && <th className="p-4">Course</th>}
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? <tr><td colSpan={3} className="p-8 text-center">Loading...</td></tr> :
                 data.length === 0 ? <tr><td colSpan={3} className="p-8 text-center">No data found.</td></tr> :
                 data.map(item => (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="p-4">
                      <p className="font-bold">{item.title || item.name || item.topic || item.email}</p>
                      <p className="text-xs text-slate-400">{item.id}</p>
                    </td>
                    {activeTab !== "categories" && activeTab !== "submissions" && (
                      <td className="p-4 text-sm text-slate-600">{item.courses?.title || "-"}</td>
                    )}
                    <td className="p-4 text-right">
                      <button 
                        onClick={async () => {
                          if (confirm("Delete?")) {
                            await supabase.from(activeTab === "submissions" ? "form_submissions" : activeTab).delete().eq("id", item.id);
                            fetchData();
                          }
                        }}
                        className="text-red-500 p-2 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
