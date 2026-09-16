import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X, Loader2, Search, Shield, UserCheck, UserX } from "lucide-react";
import { fetchAllUsers, fetchCategories, createUserAccount, updateUserProfile, deleteUserAccount } from "@/hooks/use-supabase";

export function AdminUsersPanel() {
  const [users, setUsers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterDiv, setFilterDiv] = useState("");

  const [form, setForm] = useState({ full_name: "", email: "", password: "", role: "user", division_id: "", is_verified: false });

  const load = async () => {
    setLoading(true);
    const [u, c] = await Promise.all([fetchAllUsers(), fetchCategories()]);
    setUsers(u);
    setCategories(c);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditingUser(null);
    setForm({ full_name: "", email: "", password: "", role: "user", division_id: "", is_verified: false });
    setShowModal(true);
  };

  const openEdit = (user: any) => {
    setEditingUser(user);
    setForm({
      full_name: user.full_name || "",
      email: "",
      password: "",
      role: user.role,
      division_id: user.division_id || "",
      is_verified: user.is_verified,
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingUser) {
        await updateUserProfile(editingUser.id, {
          full_name: form.full_name,
          role: form.role,
          division_id: form.division_id || null,
          is_verified: form.is_verified,
        });
      } else {
        await createUserAccount({
          email: form.email,
          password: form.password,
          full_name: form.full_name,
          role: form.role,
          division_id: form.division_id || null,
          is_verified: form.is_verified,
        });
      }
      setShowModal(false);
      load();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus user ini?")) return;
    await deleteUserAccount(id);
    load();
  };

  const toggleVerify = async (user: any) => {
    await updateUserProfile(user.id, { is_verified: !user.is_verified });
    load();
  };

  const filtered = users.filter(u => {
    if (filterRole && u.role !== filterRole) return false;
    if (filterDiv && u.division_id !== filterDiv) return false;
    if (search) {
      const q = search.toLowerCase();
      return (u.full_name || "").toLowerCase().includes(q) || (u.id || "").toLowerCase().includes(q);
    }
    return true;
  });

  const roleBadge = (role: string) => {
    const map: Record<string, string> = {
      super_admin: "bg-red-100 text-red-700",
      mentor: "bg-blue-100 text-blue-700",
      user: "bg-slate-100 text-slate-600",
    };
    return map[role] || map.user;
  };

  return (
    <div>
      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input placeholder="Cari nama..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary" />
        </div>
        <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
          className="rounded-xl border border-border bg-white px-4 py-2.5 text-sm outline-none focus:border-primary">
          <option value="">Semua Role</option>
          <option value="super_admin">Super Admin</option>
          <option value="mentor">Mentor</option>
          <option value="user">User</option>
        </select>
        <select value={filterDiv} onChange={e => setFilterDiv(e.target.value)}
          className="rounded-xl border border-border bg-white px-4 py-2.5 text-sm outline-none focus:border-primary">
          <option value="">Semua Divisi</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button onClick={openAdd} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all">
          <Plus className="h-4 w-4" /> Tambah User
        </button>
      </div>

      {/* Table */}
      <div className="rounded-3xl border border-border bg-white shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-6 py-4 text-xs font-bold uppercase text-muted-foreground">User</th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-muted-foreground">Divisi</th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-muted-foreground">Role</th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-muted-foreground">Status</th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-muted-foreground text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-10 text-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">Tidak ada user.</td></tr>
            ) : filtered.map(u => (
              <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <p className="text-sm font-bold">{u.full_name || "-"}</p>
                  <p className="text-[10px] text-muted-foreground font-mono">{u.id.slice(0, 8)}...</p>
                </td>
                <td className="px-6 py-4 text-sm">{u.categories?.name || <span className="text-muted-foreground">—</span>}</td>
                <td className="px-6 py-4">
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${roleBadge(u.role)}`}>{u.role}</span>
                </td>
                <td className="px-6 py-4">
                  <button onClick={() => toggleVerify(u)} className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold transition-colors ${
                    u.is_verified ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                  }`}>
                    {u.is_verified ? <><UserCheck className="h-3 w-3" /> Verified</> : <><UserX className="h-3 w-3" /> Pending</>}
                  </button>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openEdit(u)} className="p-2 hover:bg-slate-100 rounded-lg"><Edit className="h-4 w-4 text-slate-600" /></button>
                    <button onClick={() => handleDelete(u.id)} className="p-2 hover:bg-red-50 rounded-lg"><Trash2 className="h-4 w-4 text-red-500" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-extrabold">{editingUser ? "Edit" : "Tambah"} User</h2>
              <button onClick={() => setShowModal(false)} className="rounded-full p-2 hover:bg-slate-100"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Nama Lengkap</label>
                <input required className="w-full rounded-xl border border-border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary"
                  value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} />
              </div>
              {!editingUser && (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Email</label>
                    <input type="email" required className="w-full rounded-xl border border-border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary"
                      value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Password</label>
                    <input type="password" required minLength={6} className="w-full rounded-xl border border-border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary"
                      value={form.password} placeholder="Min 6 karakter" onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
                  </div>
                </>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Role</label>
                  <select required className="w-full rounded-xl border border-border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary"
                    value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                    <option value="user">User</option>
                    <option value="mentor">Mentor</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Divisi</label>
                  <select className="w-full rounded-xl border border-border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary"
                    value={form.division_id} onChange={e => setForm(p => ({ ...p, division_id: e.target.value }))}>
                    <option value="">— Pilih Divisi —</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" id="is_verified_modal" className="h-4 w-4" checked={form.is_verified}
                  onChange={e => setForm(p => ({ ...p, is_verified: e.target.checked }))} />
                <label htmlFor="is_verified_modal" className="text-sm font-bold text-foreground cursor-pointer">Langsung Verifikasi</label>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="rounded-xl px-6 py-2 text-sm font-bold text-muted-foreground hover:bg-slate-50">Batal</button>
                <button type="submit" disabled={saving} className="rounded-xl bg-primary px-8 py-2 text-sm font-bold text-white shadow-lg shadow-primary/20 disabled:opacity-50">
                  {saving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
