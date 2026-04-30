import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { 
  LayoutDashboard, BookOpen, Layers, Calendar, FileText, Users, 
  Plus, Edit, Trash2, LogOut, ArrowLeft,
  Image as ImageIcon, X, Menu, Camera, Ticket
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { AdminSidebar, AdminHeader, type Tab } from "@/components/admin/AdminSidebar";
import { AdminUsersPanel } from "@/components/admin/AdminUsersPanel";
import { AdminAbsensiPanel } from "@/components/admin/AdminAbsensiPanel";

export const Route = createFileRoute("/admin")({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw redirect({ to: "/login" });
    
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role, division_id")
      .eq("id", session.user.id)
      .maybeSingle();
      
    if (!profile || (profile.role !== "super_admin" && profile.role !== "mentor")) {
      throw redirect({ to: "/login" });
    }
  },
  component: AdminCMS,
});

function AdminCMS() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [stats, setStats] = useState({ courses: 0, categories: 0, absensi: 0, materials: 0, events: 0, gallery: 0, announcements: 0, users: 0 });
  const [adminRole, setAdminRole] = useState<string>("super_admin");
  const [adminDivisionId, setAdminDivisionId] = useState<string | null>(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [categories, setCategories] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  // Auth check - now uses Supabase session + role
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate({ to: "/login" }); return; }
      const { data: profile } = await supabase.from("user_profiles").select("role, division_id").eq("id", session.user.id).maybeSingle();
      if (!profile || (profile.role !== "super_admin" && profile.role !== "mentor")) { navigate({ to: "/login" }); return; }
      setAdminRole(profile.role);
      setAdminDivisionId(profile.division_id);
      sessionStorage.setItem("admin_auth", "true");
      sessionStorage.setItem("admin_role", profile.role);
    };
    checkAuth();
  }, [navigate]);

  // Data fetching
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === "dashboard") {
        const [cat, crs, sub, mat, evt, gal, ann, usr] = await Promise.all([
          supabase.from("categories").select("*", { count: "exact", head: true }),
          supabase.from("courses").select("*", { count: "exact", head: true }),
          supabase.from("form_submissions").select("*", { count: "exact", head: true }),
          supabase.from("materials").select("*", { count: "exact", head: true }),
          supabase.from("events").select("*", { count: "exact", head: true }),
          supabase.from("gallery").select("*", { count: "exact", head: true }),
          supabase.from("announcements").select("*", { count: "exact", head: true }),
          supabase.from("user_profiles").select("*", { count: "exact", head: true })
        ]);
        setStats({
          categories: cat.count || 0,
          courses: crs.count || 0,
          absensi: sub.count || 0,
          materials: mat.count || 0,
          events: evt.count || 0,
          gallery: gal.count || 0,
          announcements: ann.count || 0,
          users: usr.count || 0
        });
      } else if (activeTab === "absensi" || activeTab === "users") {
        // Handled by their own panels
        setData([]);
      } else {
        const table = activeTab;
        let query = supabase.from(table).select(
          activeTab === "materials" || activeTab === "schedules" ? "*, courses(title)" : "*"
        ).order("created_at", { ascending: false });
        // Mentor: filter by division
        if (adminRole === "mentor" && adminDivisionId && (activeTab === "courses" || activeTab === "materials" || activeTab === "schedules")) {
          if (activeTab === "courses") query = query.eq("category_id", adminDivisionId);
        }
        const { data: res } = await query;
        setData(res || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLogout = async () => {
    sessionStorage.removeItem("admin_auth");
    sessionStorage.removeItem("admin_role");
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus item ini?")) return;
    const table = activeTab;
    await supabase.from(table).delete().eq("id", id);
    fetchData();
  };

  const openAddModal = async () => {
    setEditingItem(null);
    setFormData({});
    // Fetch relations for dropdowns
    const { data: catData } = await supabase.from("categories").select("id, name");
    const { data: courseData } = await supabase.from("courses").select("id, title");
    setCategories(catData || []);
    setCourses(courseData || []);
    setShowModal(true);
  };

  const openEditModal = async (item: any) => {
    setEditingItem(item);
    setFormData(item);
    const { data: catData } = await supabase.from("categories").select("id, name");
    const { data: courseData } = await supabase.from("courses").select("id, title");
    setCategories(catData || []);
    setCourses(courseData || []);
    setShowModal(true);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('thumbnails').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('thumbnails').getPublicUrl(fileName);
      
      const field = (activeTab === "gallery" || activeTab === "events") ? "image_url" : "thumbnail";
      setFormData((prev: any) => ({ ...prev, [field]: publicUrl }));
    } catch (err) {
      console.error(err);
      alert("Upload gagal. Pastikan bucket 'thumbnails' sudah dibuat.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const table = activeTab;
      const { categories: _, courses: __, ...saveData } = formData;
      if (editingItem) {
        const { error } = await supabase.from(table).update(saveData).eq("id", editingItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from(table).insert([saveData]);
        if (error) throw error;
      }
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      alert(`Error: ${err.message || "Gagal menyimpan"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar - role-based */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        onLogout={handleLogout}
        role={adminRole}
      />

      {/* Main */}
      <main className="flex-1 overflow-auto w-full lg:w-auto">
        <AdminHeader activeTab={activeTab} onMenuClick={() => setIsSidebarOpen(true)}>
          {activeTab !== "dashboard" && activeTab !== "absensi" && activeTab !== "users" && (
            <button onClick={openAddModal} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all">
              <Plus className="h-4 w-4" /> Add New
            </button>
          )}
        </AdminHeader>

        <div className="p-8">
          {activeTab === "dashboard" ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Courses", value: stats.courses, icon: BookOpen, color: "bg-blue-500" },
                { label: "Categories", value: stats.categories, icon: Layers, color: "bg-purple-500" },
                { label: "Absensi", value: stats.absensi, icon: Users, color: "bg-green-500" },
                { label: "Materials", value: stats.materials, icon: FileText, color: "bg-orange-500" },
                { label: "Events", value: stats.events, icon: Ticket, color: "bg-rose-500" },
                { label: "Gallery", value: stats.gallery, icon: Camera, color: "bg-indigo-500" },
                ...(adminRole === "super_admin" ? [{ label: "Users", value: stats.users, icon: Users, color: "bg-teal-500" }] : []),
              ].map((s) => (
                <div key={s.label} className="rounded-3xl border border-border bg-white p-6 shadow-sm">
                  <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${s.color} text-white`}>
                    <s.icon className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">{s.label}</p>
                  <p className="mt-1 text-3xl font-extrabold">{s.value}</p>
                </div>
              ))}
            </div>
          ) : activeTab === "absensi" ? (
            <AdminAbsensiPanel />
          ) : activeTab === "users" ? (
            <AdminUsersPanel />
          ) : (
            <div className="rounded-3xl border border-border bg-white shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    {false ? (
                      <>
                        <th className="px-6 py-4 text-xs font-bold uppercase text-muted-foreground">User Info</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase text-muted-foreground">Course & Class</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase text-muted-foreground">Phone</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase text-muted-foreground">Date</th>
                      </>
                    ) : (
                      <>
                        <th className="px-6 py-4 text-xs font-bold uppercase text-muted-foreground">Info</th>
                        {(activeTab === "materials" || activeTab === "schedules") && (
                          <th className="px-6 py-4 text-xs font-bold uppercase text-muted-foreground">Kelas</th>
                        )}
                      </>
                    )}
                    <th className="px-6 py-4 text-xs font-bold uppercase text-muted-foreground text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loading ? (
                    <tr><td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">Loading...</td></tr>
                  ) : data.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">No records found.</td></tr>
                  ) : data.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      {false ? (
                        <>
                          <td className="px-6 py-4">
                            <p className="text-sm font-bold">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{item.email}</p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                               {item.course === "Event Registration" ? (
                                  <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[8px] font-bold text-blue-600 uppercase">Event</span>
                               ) : (
                                  <span className="rounded bg-purple-100 px-1.5 py-0.5 text-[8px] font-bold text-purple-600 uppercase">Course</span>
                               )}
                               <p className="text-sm font-medium">{item.event_name || item.course}</p>
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-1">{item.class_name}</p>
                          </td>
                          <td className="px-6 py-4 text-sm">{item.phone}</td>
                          <td className="px-6 py-4 text-xs text-muted-foreground">
                            {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
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
                                <p className="text-sm font-bold">{item.title || item.name || item.topic || item.email}</p>
                                <p className="text-[10px] font-mono text-muted-foreground">{item.slug || item.level || ""}</p>
                              </div>
                            </div>
                          </td>
                          {(activeTab === "materials" || activeTab === "schedules") && (
                            <td className="px-6 py-4 text-sm text-primary">{item.courses?.title || "-"}</td>
                          )}
                        </>
                      )}
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openEditModal(item)} className="p-2 hover:bg-slate-100 rounded-lg"><Edit className="h-4 w-4 text-slate-600" /></button>
                          <button onClick={() => handleDelete(item.id)} className="p-2 hover:bg-red-50 rounded-lg"><Trash2 className="h-4 w-4 text-red-500" /></button>
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

      {/* ═══ MODAL FORM ═══ */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-extrabold">{editingItem ? "Edit" : "Add New"} {activeTab}</h2>
              <button onClick={() => setShowModal(false)} className="rounded-full p-2 hover:bg-slate-100"><X className="h-5 w-5" /></button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              {/* Title / Name */}
              {(activeTab === "categories" || activeTab === "courses" || activeTab === "materials" || activeTab === "schedules" || activeTab === "events" || activeTab === "gallery" || activeTab === "announcements") && (
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Title / Name / Topic</label>
                  <input
                    required
                    className="w-full rounded-xl border border-border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary"
                    value={formData.title || formData.name || formData.topic || ""}
                    onChange={(e) => {
                      const field = activeTab === "categories" ? "name" : activeTab === "schedules" ? "topic" : "title";
                      setFormData((prev: any) => ({ ...prev, [field]: e.target.value }));
                    }}
                  />
                </div>
              )}

              {/* Slug (categories) */}
              {activeTab === "categories" && (
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Slug</label>
                  <input
                    required placeholder="e.g. front-end-development"
                    className="w-full rounded-xl border border-border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary"
                    value={formData.slug || ""}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, slug: e.target.value }))}
                  />
                </div>
              )}

              {/* Thumbnail / Image */}
              {(activeTab === "categories" || activeTab === "courses" || activeTab === "events" || activeTab === "gallery") && (
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">{activeTab === "gallery" || activeTab === "events" ? "Image URL" : "Thumbnail"}</label>
                  <div className="flex items-center gap-4">
                    {(formData.thumbnail || formData.image_url) && <img src={formData.thumbnail || formData.image_url} className="h-16 w-16 rounded-xl object-cover border" />}
                    <div className="flex-1 space-y-2">
                      <input type="file" accept="image/*" onChange={handleUpload} className="w-full text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-primary/10 file:text-primary" />
                      <input
                        className="w-full rounded-xl border border-border bg-slate-50 px-4 py-2 text-xs outline-none focus:border-primary"
                        value={formData.thumbnail || formData.image_url || ""} placeholder="Or paste image URL"
                        onChange={(e) => {
                          const field = (activeTab === "gallery" || activeTab === "events") ? "image_url" : "thumbnail";
                          setFormData((prev: any) => ({ ...prev, [field]: e.target.value }));
                        }}
                      />
                    </div>
                  </div>
                  {uploading && <p className="text-xs text-primary animate-pulse font-bold">Uploading...</p>}
                </div>
              )}

              {/* Course fields */}
              {activeTab === "courses" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Category</label>
                    <select className="w-full rounded-xl border border-border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary"
                      value={formData.category_id || ""}
                      onChange={(e) => setFormData((prev: any) => ({ ...prev, category_id: e.target.value }))}>
                      <option value="">Select Category</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-muted-foreground">Level</label>
                      <select className="w-full rounded-xl border border-border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary"
                        value={formData.level || ""}
                        onChange={(e) => setFormData((prev: any) => ({ ...prev, level: e.target.value }))}>
                        <option value="">Select</option>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-muted-foreground">Duration</label>
                      <input placeholder="e.g. 4 Weeks" className="w-full rounded-xl border border-border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary"
                        value={formData.duration || ""}
                        onChange={(e) => setFormData((prev: any) => ({ ...prev, duration: e.target.value }))} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-muted-foreground">Instructor</label>
                      <input placeholder="Mentor Name" className="w-full rounded-xl border border-border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary"
                        value={formData.instructor || ""}
                        onChange={(e) => setFormData((prev: any) => ({ ...prev, instructor: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-muted-foreground">Lessons</label>
                      <input type="number" className="w-full rounded-xl border border-border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary"
                        value={formData.lessons || 0}
                        onChange={(e) => setFormData((prev: any) => ({ ...prev, lessons: parseInt(e.target.value) }))} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Description</label>
                    <input className="w-full rounded-xl border border-border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary"
                      value={formData.description || ""}
                      onChange={(e) => setFormData((prev: any) => ({ ...prev, description: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Long Description</label>
                    <textarea rows={3} className="w-full rounded-xl border border-border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary"
                      value={formData.long_description || ""}
                      onChange={(e) => setFormData((prev: any) => ({ ...prev, long_description: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Syllabus (satu per baris)</label>
                    <textarea rows={4} placeholder={"Introduction\nDesign Thinking\nPrototyping"} className="w-full rounded-xl border border-border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary"
                      value={Array.isArray(formData.syllabus) ? formData.syllabus.join('\n') : ""}
                      onChange={(e) => setFormData((prev: any) => ({ ...prev, syllabus: e.target.value.split('\n').filter((s: string) => s.trim()) }))} />
                  </div>
                  <div className="space-y-2 flex items-center gap-2 mt-4 pt-4 border-t border-border">
                    <input type="checkbox" id="is_closed_course" className="h-4 w-4"
                      checked={formData.is_closed || false}
                      onChange={(e) => setFormData((prev: any) => ({ ...prev, is_closed: e.target.checked }))} />
                    <label htmlFor="is_closed_course" className="text-sm font-bold text-red-600 cursor-pointer">Tutup Pendaftaran Kelas Ini (is_closed)</label>
                  </div>
                </div>
              )}

              {/* Course selector for schedules & materials */}
              {(activeTab === "schedules" || activeTab === "materials") && (
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Course</label>
                  <select required className="w-full rounded-xl border border-border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary"
                    value={formData.course_id || ""}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, course_id: e.target.value }))}>
                    <option value="">Select Course</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                </div>
              )}

              {/* Material fields */}
              {activeTab === "materials" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-muted-foreground">Order</label>
                      <input type="number" required className="w-full rounded-xl border border-border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary"
                        value={formData.order || 0}
                        onChange={(e) => setFormData((prev: any) => ({ ...prev, order: parseInt(e.target.value) }))} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-muted-foreground">Link (optional)</label>
                      <input placeholder="https://youtube.com/..." className="w-full rounded-xl border border-border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary"
                        value={formData.link || ""}
                        onChange={(e) => setFormData((prev: any) => ({ ...prev, link: e.target.value }))} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Content</label>
                    <textarea rows={10} placeholder="Tulis isi materi..." className="w-full rounded-xl border border-border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary font-mono"
                      value={formData.content || ""}
                      onChange={(e) => setFormData((prev: any) => ({ ...prev, content: e.target.value }))} />
                  </div>
                </div>
              )}

              {/* Schedule fields */}
              {activeTab === "schedules" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Mentor</label>
                    <input placeholder="Nama Mentor" className="w-full rounded-xl border border-border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary"
                      value={formData.mentor || ""}
                      onChange={(e) => setFormData((prev: any) => ({ ...prev, mentor: e.target.value }))} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-muted-foreground">Date</label>
                      <input type="date" required className="w-full rounded-xl border border-border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary"
                        value={formData.date || ""}
                        onChange={(e) => setFormData((prev: any) => ({ ...prev, date: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-muted-foreground">Time</label>
                      <input placeholder="19:00 - 21:00" className="w-full rounded-xl border border-border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary"
                        value={formData.time || ""}
                        onChange={(e) => setFormData((prev: any) => ({ ...prev, time: e.target.value }))} />
                    </div>
                  </div>
                </div>
              )}

              {/* Division selector for gallery */}
              {activeTab === "gallery" && (
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Divisi / Kategori</label>
                  <select className="w-full rounded-xl border border-border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary"
                    value={formData.category_id || ""}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, category_id: e.target.value || null }))}>
                    <option value="">— Tanpa Divisi —</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              )}

              {/* Description for events and gallery and categories */}
              {(activeTab === "categories" || activeTab === "events" || activeTab === "gallery") && (
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Description</label>
                  <textarea rows={3} className="w-full rounded-xl border border-border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary"
                    value={formData.description || ""}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, description: e.target.value }))} />
                </div>
              )}
              
              {/* Date for events */}
              {activeTab === "events" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Event Date</label>
                    <input type="date" className="w-full rounded-xl border border-border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary"
                      value={formData.event_date || ""}
                      onChange={(e) => setFormData((prev: any) => ({ ...prev, event_date: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Location</label>
                    <input placeholder="Online / Jakarta" className="w-full rounded-xl border border-border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary"
                      value={formData.location || ""}
                      onChange={(e) => setFormData((prev: any) => ({ ...prev, location: e.target.value }))} />
                  </div>
                </div>
              )}
              {activeTab === "events" && (
                <div className="space-y-2 flex items-center gap-2">
                  <input type="checkbox" id="is_closed_event" className="h-4 w-4"
                    checked={formData.is_closed || false}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, is_closed: e.target.checked }))} />
                  <label htmlFor="is_closed_event" className="text-sm font-bold text-red-600 cursor-pointer">Tutup Pendaftaran Event Ini (is_closed)</label>
                </div>
              )}

              {/* Announcements */}
              {activeTab === "announcements" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Content</label>
                    <textarea rows={4} className="w-full rounded-xl border border-border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary"
                      value={formData.content || ""}
                      onChange={(e) => setFormData((prev: any) => ({ ...prev, content: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Type</label>
                    <select className="w-full rounded-xl border border-border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary"
                      value={formData.type || "info"}
                      onChange={(e) => setFormData((prev: any) => ({ ...prev, type: e.target.value }))}>
                      <option value="info">Info</option>
                      <option value="warning">Warning</option>
                      <option value="success">Success</option>
                    </select>
                  </div>
                  <div className="space-y-2 flex items-center gap-2">
                    <input type="checkbox" id="is_active_ann" className="h-4 w-4"
                      checked={formData.is_active !== false}
                      onChange={(e) => setFormData((prev: any) => ({ ...prev, is_active: e.target.checked }))} />
                    <label htmlFor="is_active_ann" className="text-sm font-bold text-foreground cursor-pointer">Active (Tampilkan)</label>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-6 border-t mt-8">
                <button type="button" onClick={() => setShowModal(false)} className="rounded-xl px-6 py-2 text-sm font-bold text-muted-foreground hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={loading} className="rounded-xl bg-primary px-8 py-2 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all disabled:opacity-50">
                  {loading ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
