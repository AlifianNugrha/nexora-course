import { useState, useEffect } from "react";
import { FileText, Search, Loader2 } from "lucide-react";
import { fetchAbsensi, fetchDistinctCourseNames, fetchDistinctClassNames } from "@/hooks/use-supabase";

export function AdminAbsensiPanel() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [courseNames, setCourseNames] = useState<string[]>([]);
  const [classNames, setClassNames] = useState<string[]>([]);
  const [filterCourse, setFilterCourse] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    const filters: any = {};
    if (filterCourse) filters.course = filterCourse;
    if (filterClass) filters.class_name = filterClass;
    const result = await fetchAbsensi(Object.keys(filters).length > 0 ? filters : undefined);
    setData(result);
    setLoading(false);
  };

  useEffect(() => {
    fetchDistinctCourseNames().then(setCourseNames);
  }, []);

  useEffect(() => {
    fetchDistinctClassNames(filterCourse || undefined).then(setClassNames);
  }, [filterCourse]);

  useEffect(() => { load(); }, [filterCourse, filterClass]);

  const filtered = search
    ? data.filter(r => {
        const q = search.toLowerCase();
        return (r.name || "").toLowerCase().includes(q) || (r.email || "").toLowerCase().includes(q);
      })
    : data;

  const handleExportCSV = () => {
    const headers = ["Nama", "Email", "No HP", "Course/Event", "Kelas", "Tanggal"];
    const csvContent = [
      headers.join(","),
      ...filtered.map(row => [
        `"${row.name || ''}"`, `"${row.email || ''}"`, `"${row.phone || ''}"`,
        `"${row.event_name || row.course || ''}"`, `"${row.class_name || ''}"`,
        `"${new Date(row.created_at).toLocaleDateString('id-ID')}"`
      ].join(","))
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const filterLabel = filterCourse ? `_${filterCourse.replace(/\s+/g, '-')}` : "";
    const classLabel = filterClass ? `_${filterClass.replace(/\s+/g, '-')}` : "";
    link.href = URL.createObjectURL(blob);
    link.download = `absensi${filterLabel}${classLabel}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div>
      {/* Filters Bar */}
      <div className="mb-6 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input placeholder="Cari nama/email..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary" />
        </div>
        <select value={filterCourse} onChange={e => { setFilterCourse(e.target.value); setFilterClass(""); }}
          className="rounded-xl border border-border bg-white px-4 py-2.5 text-sm outline-none focus:border-primary min-w-[160px]">
          <option value="">Semua Course</option>
          {courseNames.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <select value={filterClass} onChange={e => setFilterClass(e.target.value)}
          className="rounded-xl border border-border bg-white px-4 py-2.5 text-sm outline-none focus:border-primary min-w-[140px]">
          <option value="">Semua Kelas</option>
          {classNames.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        {filtered.length > 0 && (
          <button onClick={handleExportCSV}
            className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 text-sm font-bold text-green-600 hover:-translate-y-0.5 transition-all">
            <FileText className="h-4 w-4" /> Export CSV ({filtered.length})
          </button>
        )}
      </div>

      {/* Active Filters */}
      {(filterCourse || filterClass) && (
        <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
          <span>Filter aktif:</span>
          {filterCourse && (
            <span className="rounded-full bg-primary/10 text-primary px-2.5 py-1 font-bold flex items-center gap-1">
              {filterCourse}
              <button onClick={() => setFilterCourse("")} className="ml-1 hover:text-red-500">×</button>
            </span>
          )}
          {filterClass && (
            <span className="rounded-full bg-blue-100 text-blue-700 px-2.5 py-1 font-bold flex items-center gap-1">
              {filterClass}
              <button onClick={() => setFilterClass("")} className="ml-1 hover:text-red-500">×</button>
            </span>
          )}
        </div>
      )}

      {/* Table */}
      <div className="rounded-3xl border border-border bg-white shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-6 py-4 text-xs font-bold uppercase text-muted-foreground">Peserta</th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-muted-foreground">Course & Kelas</th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-muted-foreground">No HP</th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-muted-foreground">Tanggal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr><td colSpan={4} className="px-6 py-10 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" /></td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-10 text-center text-muted-foreground">Tidak ada data absensi.</td></tr>
            ) : filtered.map(item => (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors">
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
