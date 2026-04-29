import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { 
  LayoutDashboard, BookOpen, Layers, Calendar, FileText, Users, 
  Plus, Edit, Trash2, Save, X, ExternalLink, ChevronRight, 
  Settings, LogOut, Search, Filter, MoreHorizontal, ArrowLeft,
  Image as ImageIcon, CheckCircle2, AlertCircle
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Nexora Admin — CMS" },
    ],
  }),
  component: AdminCMS,
});

function LoginView({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple hardcoded check as requested
    if (email === "admin@nexora.id" && password === "nexora123") {
      onLogin();
    } else {
      setError("Email atau Password salah!");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[image:var(--gradient-hero)] px-4">
      <div className="noise absolute inset-0 opacity-20" />
      <div className="relative w-full max-w-md animate-fade-in">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white shadow-glow">
            <Layers className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-primary-deep">Nexora Admin</h1>
          <p className="mt-2 text-muted-foreground">Silakan login untuk mengelola konten</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 rounded-3xl border border-white/20 bg-white/80 p-8 shadow-card backdrop-blur-xl">
          {error && (
            <div className="rounded-xl bg-red-50 p-3 text-center text-xs font-bold text-red-500 border border-red-100">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</label>
            <input 
              type="email"
              required
              className="w-full rounded-xl border border-border bg-white/50 px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              placeholder="admin@nexora.id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Password</label>
            <input 
              type="password"
              required
              className="w-full rounded-xl border border-border bg-white/50 px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button 
            type="submit"
            className="w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Masuk ke Dashboard
          </button>
        </form>
        
        <p className="mt-8 text-center text-[10px] text-muted-foreground">
          &copy; {new Date().getFullYear()} Nexora Course. All rights reserved.
        </p>
      </div>
    </div>
  );
}

type Tab = "dashboard" | "categories" | "courses" | "schedules" | "materials" | "submissions";

function AdminCMS() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const auth = sessionStorage.getItem("admin_auth");
    if (auth === "true") {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLoginSuccess = () => {
    sessionStorage.setItem("admin_auth", "true");
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_auth");
    setIsLoggedIn(false);
  };

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Stats
  const [stats, setStats] = useState({
    courses: 0,
    categories: 0,
    submissions: 0,
    materials: 0
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "dashboard") {
        const [catCount, courseCount, subCount, matCount] = await Promise.all([
          supabase.from("categories").select("*", { count: "exact", head: true }),
          supabase.from("courses").select("*", { count: "exact", head: true }),
          supabase.from("form_submissions").select("*", { count: "exact", head: true }),
          supabase.from("materials").select("*", { count: "exact", head: true })
        ]);
        setStats({
          categories: catCount.count || 0,
          courses: courseCount.count || 0,
          submissions: subCount.count || 0,
          materials: matCount.count || 0
        });
      } else {
        const tableName = activeTab === "submissions" ? "form_submissions" : activeTab;
        let query = supabase.from(tableName).select("*");
        
        // Add joins for materials and schedules to get course titles
        if (activeTab === "materials" || activeTab === "schedules") {
          query = supabase.from(tableName).select("*, courses(title)");
        }
        
        const { data: result } = await query.order("created_at", { ascending: false });
        setData(result || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    const tableName = activeTab === "submissions" ? "form_submissions" : activeTab;
    await supabase.from(tableName).delete().eq("id", id);
    fetchData();
  };

  const [formData, setFormData] = useState<any>({});
  const [categories, setCategories] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    if (showModal) {
      if (editingItem) {
        setFormData(editingItem);
      } else {
        setFormData({});
      }
      
      // Fetch relations
      const fetchRelations = async () => {
        const { data: catData } = await supabase.from("categories").select("id, name");
        const { data: courseData } = await supabase.from("courses").select("id, title");
        setCategories(catData || []);
        setCourses(courseData || []);
      };
      fetchRelations();
    }
  }, [showModal, editingItem]);

  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('thumbnails')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('thumbnails')
        .getPublicUrl(filePath);

      setFormData({ ...formData, thumbnail: publicUrl });
      alert("Image uploaded successfully!");
    } catch (err) {
      console.error(err);
      alert("Error uploading image. Make sure the 'thumbnails' bucket exists and is public.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const tableName = activeTab === "submissions" ? "form_submissions" : activeTab;
      
      // Clean up formData before saving (remove joined fields)
      const { categories: _, courses: __, ...saveData } = formData;

      if (editingItem) {
        const { error } = await supabase.from(tableName).update(saveData).eq("id", editingItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from(tableName).insert([saveData]);
        if (error) throw error;
      }
      setShowModal(false);
      fetchData();
      alert("Saved successfully!");
    } catch (err: any) {
      console.error(err);
      alert(`Error saving data: ${err.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return <LoginView onLogin={handleLoginSuccess} />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-white dark:bg-card">
        <div className="flex h-16 items-center gap-2 px-6 border-b border-border">
          <Layers className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold text-primary-deep">Nexora CMS</span>
        </div>
        <nav className="p-4 space-y-1">
          {[
            { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
            { id: "categories", label: "Categories", icon: Layers },
            { id: "courses", label: "Courses", icon: BookOpen },
            { id: "schedules", label: "Schedules", icon: Calendar },
            { id: "materials", label: "Materials", icon: FileText },
            { id: "submissions", label: "Submissions", icon: Users },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
          
          <div className="pt-8 mt-8 border-t border-border">
             <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
             >
                <LogOut className="h-4 w-4" />
                Logout
             </button>
             <Link 
               to="/" 
               className="mt-2 flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary transition-all"
             >
                <ArrowLeft className="h-4 w-4" />
                Back to Site
             </Link>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="flex h-16 items-center justify-between border-b border-border bg-white px-8 dark:bg-card">
          <h1 className="text-lg font-bold capitalize text-foreground">{activeTab}</h1>
          <div className="flex items-center gap-4">
            {activeTab === "submissions" && data.length > 0 && (
              <button 
                onClick={() => {
                  const headers = ["Name", "Email", "Phone", "Course", "Class", "Date"];
                  const csvContent = [
                    headers.join(","),
                    ...data.map(row => [
                      `"${row.name}"`,
                      `"${row.email}"`,
                      `"${row.phone}"`,
                      `"${row.event_name || row.course}"`,
                      `"${row.class_name}"`,
                      `"${new Date(row.created_at).toLocaleDateString()}"`
                    ].join(","))
                  ].join("\n");
                  
                  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
                  const link = document.createElement("a");
                  link.href = URL.createObjectURL(blob);
                  link.download = `submissions_${new Date().toISOString().split('T')[0]}.csv`;
                  link.click();
                }}
                className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-2 text-sm font-bold text-green-600 transition-all hover:-translate-y-0.5 active:scale-95"
              >
                <FileText className="h-4 w-4" /> Export CSV
              </button>
            )}
            {activeTab !== "dashboard" && activeTab !== "submissions" && (
              <button 
                onClick={() => { setEditingItem(null); setFormData({}); setShowModal(true); }}
                className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 active:scale-95"
              >
                <Plus className="h-4 w-4" /> Add New
              </button>
            )}
          </div>
        </header>

        <div className="p-8">
          {activeTab === "dashboard" && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
               {[
                 { label: "Courses", value: stats.courses, icon: BookOpen, color: "bg-blue-500" },
                 { label: "Categories", value: stats.categories, icon: Layers, color: "bg-purple-500" },
                 { label: "Submissions", value: stats.submissions, icon: Users, color: "bg-green-500" },
                 { label: "Materials", value: stats.materials, icon: FileText, color: "bg-orange-500" },
               ].map((s) => (
                 <div key={s.label} className="rounded-3xl border border-border bg-white p-6 shadow-sm dark:bg-card">
                    <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${s.color} text-white`}>
                       <s.icon className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">{s.label}</p>
                    <p className="mt-1 text-3xl font-extrabold text-foreground">{s.value}</p>
                 </div>
               ))}
            </div>
          )}

          {activeTab !== "dashboard" && (
            <div className="rounded-3xl border border-border bg-white shadow-sm dark:bg-card overflow-hidden">
               <table className="w-full text-left">
                  <thead>
                     <tr className="border-b border-border bg-slate-50/50 dark:bg-secondary/20">
                        {activeTab === "submissions" ? (
                          <>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">User Info</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Course & Class</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Phone</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Date</th>
                          </>
                        ) : (
                          <>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">ID / Info</th>
                            {(activeTab === "materials" || activeTab === "schedules") && (
                              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Kelas</th>
                            )}
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Details</th>
                          </>
                        )}
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                     {loading ? (
                        <tr><td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">Loading data...</td></tr>
                     ) : data.length === 0 ? (
                        <tr><td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">No records found.</td></tr>
                     ) : data.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50 transition-colors dark:hover:bg-secondary/10">
                           {activeTab === "submissions" ? (
                             <>
                               <td className="px-6 py-4">
                                  <p className="text-sm font-bold text-foreground">{item.name}</p>
                                  <p className="text-xs text-muted-foreground">{item.email}</p>
                               </td>
                               <td className="px-6 py-4">
                                  <p className="text-sm font-medium text-foreground">{item.event_name || item.course}</p>
                                  <p className="text-[10px] text-muted-foreground">{item.class_name}</p>
                               </td>
                               <td className="px-6 py-4">
                                  <p className="text-sm text-foreground">{item.phone}</p>
                               </td>
                               <td className="px-6 py-4">
                                  <p className="text-xs text-muted-foreground">
                                     {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                  </p>
                               </td>
                             </>
                           ) : (
                             <>
                               <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                     {item.thumbnail ? (
                                        <img src={item.thumbnail} className="h-10 w-10 rounded-lg object-cover" />
                                     ) : (
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-400"><ImageIcon className="h-5 w-5" /></div>
                                     )}
                                     <div>
                                        <p className="text-sm font-bold text-foreground">{item.title || item.name || item.topic}</p>
                                        <p className="text-[10px] font-mono text-muted-foreground">{item.id}</p>
                                     </div>
                                  </div>
                               </td>
                               {(activeTab === "materials" || activeTab === "schedules") && (
                                 <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                       <p className="text-sm font-medium text-primary">
                                         {item.courses?.title || "No Course"}
                                       </p>
                                       {item.course_id && (
                                          <Link 
                                            to="/materi/$courseId" 
                                            params={{ courseId: item.course_id }}
                                            className="text-muted-foreground hover:text-primary"
                                          >
                                             <ExternalLink className="h-3 w-3" />
                                          </Link>
                                       )}
                                    </div>
                                 </td>
                               )}
                               <td className="px-6 py-4">
                                  <p className="text-xs text-muted-foreground line-clamp-1">
                                     {activeTab === "materials" ? `Order: ${item.order}` : (item.description || item.topic || "No details available")}
                                  </p>
                               </td>
                             </>
                           )}
                           <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                 {activeTab !== "submissions" && (
                                    <button 
                                      onClick={() => { setEditingItem(item); setShowModal(true); }}
                                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-slate-600 hover:bg-slate-50 dark:text-slate-400"
                                    >
                                       <Edit className="h-4 w-4" />
                                    </button>
                                 )}
                                 <button 
                                   onClick={() => handleDelete(item.id)}
                                   className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 text-red-500 hover:bg-red-50"
                                 >
                                    <Trash2 className="h-4 w-4" />
                                 </button>
                              </div>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          )}
        </div>
      </main>

      {/* Editor Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
           <div className="w-full max-w-2xl rounded-[2rem] border border-border bg-white p-8 shadow-2xl dark:bg-card max-h-[90vh] overflow-y-auto">
              <div className="mb-6 flex items-center justify-between">
                 <h2 className="text-xl font-extrabold text-foreground">
                    {editingItem ? `Edit ${activeTab}` : `Add New ${activeTab}`}
                 </h2>
                 <button onClick={() => setShowModal(false)} className="rounded-full p-2 hover:bg-slate-100">
                    <X className="h-5 w-5" />
                 </button>
              </div>
              
              <form onSubmit={handleSave} className="space-y-5">
                 {/* Common Fields */}
                 {(activeTab === "categories" || activeTab === "courses" || activeTab === "materials" || activeTab === "schedules") && (
                   <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Title / Name</label>
                      <input 
                        required
                        className="w-full rounded-xl border border-border bg-slate-50 px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        value={formData.title || formData.name || formData.topic || ""}
                        onChange={(e) => {
                          const field = activeTab === "categories" ? "name" : (activeTab === "schedules" ? "topic" : "title");
                          setFormData({ ...formData, [field]: e.target.value });
                        }}
                      />
                   </div>
                 )}

                 {activeTab === "categories" && (
                   <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Slug</label>
                      <input 
                        required
                        placeholder="e.g. front-end-development"
                        className="w-full rounded-xl border border-border bg-slate-50 px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        value={formData.slug || ""}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      />
                   </div>
                 )}

                 {(activeTab === "categories" || activeTab === "courses") && (
                   <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Thumbnail</label>
                      <div className="flex items-center gap-4">
                         {formData.thumbnail && (
                            <img src={formData.thumbnail} className="h-16 w-16 rounded-xl object-cover border border-border" />
                         )}
                         <div className="flex-1 space-y-2">
                            <input 
                              type="file" 
                              accept="image/*"
                              onChange={handleUpload}
                              className="w-full text-xs text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                            />
                            <input 
                              className="w-full rounded-xl border border-border bg-slate-50 px-4 py-2 text-xs focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all"
                              value={formData.thumbnail || ""}
                              onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                              placeholder="Or paste image URL"
                            />
                         </div>
                      </div>
                      {uploading && <p className="text-[10px] text-primary animate-pulse font-bold">Uploading image...</p>}
                   </div>
                 )}

                 {/* Relations */}
                 {activeTab === "courses" && (
                   <div className="space-y-4">
                      <div className="space-y-2">
                         <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Category</label>
                         <select 
                           className="w-full rounded-xl border border-border bg-slate-50 px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                           value={formData.category_id || ""}
                           onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                         >
                            <option value="">Select Category</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                         </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Level</label>
                            <select 
                              className="w-full rounded-xl border border-border bg-slate-50 px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                              value={formData.level || ""}
                              onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                            >
                               <option value="">Select Level</option>
                               <option value="Beginner">Beginner</option>
                               <option value="Intermediate">Intermediate</option>
                               <option value="Advanced">Advanced</option>
                            </select>
                         </div>
                         <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Duration</label>
                            <input 
                              placeholder="e.g. 4 Weeks"
                              className="w-full rounded-xl border border-border bg-slate-50 px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                              value={formData.duration || ""}
                              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                            />
                         </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Instructor</label>
                            <input 
                              placeholder="Mentor Name"
                              className="w-full rounded-xl border border-border bg-slate-50 px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                              value={formData.instructor || ""}
                              onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                            />
                         </div>
                         <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Lessons Count</label>
                            <input 
                              type="number"
                              className="w-full rounded-xl border border-border bg-slate-50 px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                              value={formData.lessons || 0}
                              onChange={(e) => setFormData({ ...formData, lessons: parseInt(e.target.value) })}
                            />
                         </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Short Description (for cards)</label>
                        <input 
                          className="w-full rounded-xl border border-border bg-slate-50 px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                          value={formData.description || ""}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Long Description</label>
                        <textarea 
                          rows={3}
                          className="w-full rounded-xl border border-border bg-slate-50 px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                          value={formData.long_description || ""}
                          onChange={(e) => setFormData({ ...formData, long_description: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Syllabus (One item per line)</label>
                        <textarea 
                          rows={4}
                          placeholder="Introduction to UI&#10;Design Thinking&#10;Prototyping"
                          className="w-full rounded-xl border border-border bg-slate-50 px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                          value={Array.isArray(formData.syllabus) ? formData.syllabus.join('\n') : ""}
                          onChange={(e) => setFormData({ ...formData, syllabus: e.target.value.split('\n').filter(s => s.trim()) })}
                        />
                      </div>
                   </div>
                 )}

                 {(activeTab === "schedules" || activeTab === "materials") && (
                   <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Course</label>
                      <select 
                        required
                        className="w-full rounded-xl border border-border bg-slate-50 px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        value={formData.course_id || ""}
                        onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                      >
                         <option value="">Select Course</option>
                         {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                      </select>
                   </div>
                 )}

                 {activeTab === "materials" && (
                   <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                           <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Order</label>
                           <input 
                             type="number"
                             required
                             className="w-full rounded-xl border border-border bg-slate-50 px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                             value={formData.order || 0}
                             onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                           />
                         </div>
                         <div className="space-y-2">
                           <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">External Link (Optional)</label>
                           <input 
                             placeholder="e.g. https://youtube.com/..."
                             className="w-full rounded-xl border border-border bg-slate-50 px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                             value={formData.link || ""}
                             onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                           />
                         </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Content (Rich Text / Markdown)</label>
                        <textarea 
                          rows={10}
                          placeholder="Tulis isi materi di sini..."
                          className="w-full rounded-xl border border-border bg-slate-50 px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-mono"
                          value={formData.content || ""}
                          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        />
                      </div>
                   </div>
                 )}

                 {activeTab === "schedules" && (
                   <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Mentor</label>
                        <input 
                          placeholder="Nama Mentor"
                          className="w-full rounded-xl border border-border bg-slate-50 px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                          value={formData.mentor || ""}
                          onChange={(e) => setFormData({ ...formData, mentor: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                           <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Date</label>
                           <input 
                             type="date"
                             required
                             className="w-full rounded-xl border border-border bg-slate-50 px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                             value={formData.date || ""}
                             onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                           />
                         </div>
                         <div className="space-y-2">
                           <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Time</label>
                           <input 
                             placeholder="e.g. 19:00 - 21:00"
                             className="w-full rounded-xl border border-border bg-slate-50 px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                             value={formData.time || ""}
                             onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                           />
                         </div>
                      </div>
                   </div>
                 )}
                 
                 <div className="flex justify-end gap-3 pt-6 border-t border-border mt-8">
                    <button type="button" onClick={() => setShowModal(false)} className="rounded-xl px-6 py-2 text-sm font-bold text-muted-foreground hover:bg-slate-50">Cancel</button>
                    <button type="submit" disabled={loading} className="rounded-xl bg-primary px-8 py-2 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-50">
                       {loading ? "Saving..." : "Save Changes"}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}

