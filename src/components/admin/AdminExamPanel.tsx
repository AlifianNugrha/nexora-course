import { useState, useEffect } from "react";
import { 
  Award, Plus, Trash2, Edit, BookOpen, Clock, CheckCircle, 
  Shuffle, FileSpreadsheet, X, Clipboard, ArrowRight, Loader2,
  AlertCircle, HelpCircle, Eye, Trophy
} from "lucide-react";
import { 
  fetchExams, createExam, updateExam, deleteExam, 
  fetchQuestionsByExamId, createQuestion, deleteQuestion, 
  bulkCreateQuestions, fetchCourses, fetchAttemptsByExam,
  fetchExamBadge, saveExamBadge
} from "@/hooks/use-supabase";

export function AdminExamPanel() {
  const [exams, setExams] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showExamModal, setShowExamModal] = useState(false);
  const [editingExam, setEditingExam] = useState<any>(null);
  const [examForm, setExamForm] = useState({
    title: "",
    description: "",
    course_id: "",
    duration_minutes: 30,
    passing_score: 70,
    is_published: false,
    shuffle_questions: true,
    shuffle_options: true
  });

  // Question Management State
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [questionLoading, setQuestionLoading] = useState(false);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [questionForm, setQuestionForm] = useState({
    question: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_answer: "a",
    points: 1
  });

  // Bulk Import State
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkJson, setBulkJson] = useState("");
  const [bulkError, setBulkError] = useState("");
  const [bulkImporting, setBulkImporting] = useState(false);

  // Attempts/Results state
  const [showAttemptsModal, setShowAttemptsModal] = useState(false);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [attemptsLoading, setAttemptsLoading] = useState(false);

  // Badge Settings State
  const [showBadgeSettingsModal, setShowBadgeSettingsModal] = useState(false);
  const [badgeSettingsExam, setBadgeSettingsExam] = useState<any>(null);
  const [badgeSettingsForm, setBadgeSettingsForm] = useState({
    name: "",
    icon: "🏆",
    description: "",
    color: "violet"
  });
  const [savingBadgeSettings, setSavingBadgeSettings] = useState(false);

  const handleOpenBadgeSettings = async (exam: any) => {
    setBadgeSettingsExam(exam);
    setBadgeSettingsForm({
      name: "",
      icon: "🏆",
      description: "",
      color: "violet"
    });
    setShowBadgeSettingsModal(true);
    try {
      const existingBadge = await fetchExamBadge(exam.id);
      if (existingBadge) {
        setBadgeSettingsForm({
          name: existingBadge.name,
          icon: existingBadge.icon,
          description: existingBadge.description || "",
          color: existingBadge.color || "violet"
        });
      } else {
        // Default values if no custom badge yet
        setBadgeSettingsForm({
          name: `Badge Kelulusan: ${exam.title}`,
          icon: "🏆",
          description: `Diberikan setelah berhasil lulus ujian ${exam.title} dengan nilai di atas KKM.`,
          color: "violet"
        });
      }
    } catch (err) {
      console.error("Error loading badge settings:", err);
    }
  };

  const handleSaveBadgeSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!badgeSettingsExam) return;
    setSavingBadgeSettings(true);
    try {
      await saveExamBadge(badgeSettingsExam.id, badgeSettingsForm);
      alert("Badge dan Title kelulusan berhasil disimpan!");
      setShowBadgeSettingsModal(false);
    } catch (err: any) {
      alert("Gagal menyimpan badge: " + err.message);
    } finally {
      setSavingBadgeSettings(false);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [examsData, coursesData] = await Promise.all([
        fetchExams(),
        fetchCourses()
      ]);
      // For each exam, fetch questions count dynamically or it is joined
      const examsWithCount = await Promise.all(
        examsData.map(async (exam) => {
          try {
            const qs = await fetchQuestionsByExamId(exam.id);
            return { ...exam, question_count: qs.length };
          } catch {
            return { ...exam, question_count: 0 };
          }
        })
      );
      setExams(examsWithCount);
      setCourses(coursesData);
    } catch (err) {
      console.error("Error loading exams data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // CRUD Exams
  const handleOpenExamModal = (exam: any = null) => {
    if (exam) {
      setEditingExam(exam);
      setExamForm({
        title: exam.title,
        description: exam.description || "",
        course_id: exam.course_id || "",
        duration_minutes: exam.duration_minutes || 30,
        passing_score: exam.passing_score || 70,
        is_published: exam.is_published || false,
        shuffle_questions: exam.shuffle_questions !== false,
        shuffle_options: exam.shuffle_options !== false
      });
    } else {
      setEditingExam(null);
      setExamForm({
        title: "",
        description: "",
        course_id: courses[0]?.id || "",
        duration_minutes: 30,
        passing_score: 70,
        is_published: false,
        shuffle_questions: true,
        shuffle_options: true
      });
    }
    setShowExamModal(true);
  };

  const handleSaveExam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingExam) {
        await updateExam(editingExam.id, examForm);
      } else {
        await createExam(examForm);
      }
      setShowExamModal(false);
      loadData();
    } catch (err: any) {
      alert("Error saving exam: " + err.message);
    }
  };

  const handleTogglePublish = async (exam: any) => {
    try {
      await updateExam(exam.id, { is_published: !exam.is_published });
      loadData();
    } catch (err: any) {
      alert("Gagal mengubah status publish: " + err.message);
    }
  };

  const handleDeleteExam = async (id: string) => {
    if (!confirm("Hapus exam ini? Semua soal, attempt, dan nilai user di exam ini juga akan terhapus permanen.")) return;
    try {
      await deleteExam(id);
      loadData();
    } catch (err: any) {
      alert("Gagal menghapus exam: " + err.message);
    }
  };

  // Manage Questions
  const handleManageQuestions = async (exam: any) => {
    setSelectedExam(exam);
    setQuestionLoading(true);
    try {
      const data = await fetchQuestionsByExamId(exam.id);
      setQuestions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setQuestionLoading(false);
    }
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExam) return;
    try {
      const order = questions.length + 1;
      await createQuestion({
        exam_id: selectedExam.id,
        ...questionForm,
        order
      });
      setShowQuestionForm(false);
      setQuestionForm({
        question: "",
        option_a: "",
        option_b: "",
        option_c: "",
        option_d: "",
        correct_answer: "a",
        points: 1
      });
      // reload
      const data = await fetchQuestionsByExamId(selectedExam.id);
      setQuestions(data);
      loadData(); // update count on main table
    } catch (err: any) {
      alert("Gagal menambah soal: " + err.message);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm("Hapus soal ini?")) return;
    try {
      await deleteQuestion(id);
      const data = await fetchQuestionsByExamId(selectedExam.id);
      setQuestions(data);
      loadData(); // update count on main table
    } catch (err: any) {
      alert("Gagal menghapus soal: " + err.message);
    }
  };

  // Bulk Import Questions
  const handleBulkImport = async () => {
    if (!selectedExam) return;
    setBulkError("");
    try {
      const parsed = JSON.parse(bulkJson);
      if (!Array.isArray(parsed)) {
        throw new Error("Format JSON harus berupa Array.");
      }
      if (parsed.length === 0) {
        throw new Error("Array JSON kosong.");
      }
      
      // Validate structure
      parsed.forEach((item, index) => {
        if (!item.question || !item.option_a || !item.option_b || !item.option_c || !item.option_d || !item.correct_answer) {
          throw new Error(`Soal indeks ke-${index} tidak memiliki properti lengkap (question, option_a/b/c/d, correct_answer).`);
        }
        if (!['a', 'b', 'c', 'd'].includes(item.correct_answer.toLowerCase())) {
          throw new Error(`Soal indeks ke-${index} memiliki jawaban benar "${item.correct_answer}" yang tidak valid (harus a, b, c, atau d).`);
        }
      });

      setBulkImporting(true);
      await bulkCreateQuestions(selectedExam.id, parsed);
      
      setBulkJson("");
      setShowBulkModal(false);
      
      // Reload questions
      const data = await fetchQuestionsByExamId(selectedExam.id);
      setQuestions(data);
      loadData();
      
      alert(`Berhasil mengimpor ${parsed.length} soal!`);
    } catch (err: any) {
      setBulkError(err.message || "Gagal memproses JSON. Periksa kembali formatnya.");
    } finally {
      setBulkImporting(false);
    }
  };

  // View Attempts
  const handleViewAttempts = async (exam: any) => {
    setSelectedExam(exam);
    setAttemptsLoading(true);
    setShowAttemptsModal(true);
    try {
      const data = await fetchAttemptsByExam(exam.id);
      setAttempts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setAttemptsLoading(false);
    }
  };

  const copyTemplateToClipboard = () => {
    const template = [
      {
        question: "Apa kepanjangan dari HTML?",
        option_a: "Hyper Text Markup Language",
        option_b: "Hyper Link Markup Language",
        option_c: "Hyper Text Mark Language",
        option_d: "High Text Markup Language",
        correct_answer: "a",
        points: 1
      },
      {
        question: "CSS digunakan untuk keperluan...",
        option_a: "Fungsionalitas logika backend",
        option_b: "Desain dan tata letak halaman web",
        option_c: "Koneksi ke server database",
        option_d: "Mengkompilasi kode binary",
        correct_answer: "b",
        points: 1
      }
    ];
    navigator.clipboard.writeText(JSON.stringify(template, null, 2));
    alert("Template JSON disalin ke clipboard!");
  };

  return (
    <div className="space-y-6">
      {/* ════════ MAIN EXAM LIST OR DETAIL ════════ */}
      {!selectedExam ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-800">Manajemen Ujian / Exams</h2>
            <button onClick={() => handleOpenExamModal()} 
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all">
              <Plus className="h-4 w-4" /> Bikin Exam Baru
            </button>
          </div>

          <div className="rounded-3xl border border-border bg-white shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-muted-foreground">Info Exam</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-muted-foreground">Course Relasi</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-muted-foreground">Durasi & Kriteria</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-muted-foreground">Jumlah Soal</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-muted-foreground">Status</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-muted-foreground text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-primary" />
                      Loading exam data...
                    </td>
                  </tr>
                ) : exams.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">
                      Belum ada ujian yang dibuat. Klik "Bikin Exam Baru" di atas.
                    </td>
                  </tr>
                ) : exams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-800">{exam.title}</p>
                      {exam.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{exam.description}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-primary/10 text-primary px-2.5 py-1 text-xs font-semibold">
                        {exam.courses?.title || "Umum (Tidak terkait Course)"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{exam.duration_minutes} Menit</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Min. Lulus: <span className="font-bold text-green-600">{exam.passing_score}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                      {exam.question_count} Soal
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleTogglePublish(exam)}
                        title={exam.is_published ? "Klik untuk sembunyikan dari siswa" : "Klik untuk publish ke siswa"}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-all hover:scale-105 ${
                          exam.is_published
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                        }`}
                      >
                        <span className={`h-2 w-2 rounded-full ${exam.is_published ? "bg-green-500" : "bg-amber-400"}`} />
                        {exam.is_published ? "Published" : "Draft"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center gap-1">
                        <button 
                          onClick={() => handleViewAttempts(exam)}
                          title="Lihat Nilai Siswa"
                          className="p-2 text-slate-600 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleManageQuestions(exam)}
                          className="flex items-center gap-1 text-xs font-bold text-primary bg-primary/5 px-2.5 py-1.5 rounded-lg hover:bg-primary/10 transition-colors"
                        >
                          <HelpCircle className="h-3.5 w-3.5" /> Soal ({exam.question_count})
                        </button>
                        <button 
                          onClick={() => handleOpenBadgeSettings(exam)}
                          className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1.5 rounded-lg hover:bg-amber-100 transition-colors"
                        >
                          <Trophy className="h-3.5 w-3.5" /> Badge
                        </button>
                        <button 
                          onClick={() => handleOpenExamModal(exam)}
                          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteExam(exam.id)}
                          className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
        </div>
      ) : (
        // ════════ QUESTION MANAGEMENT PANEL ════════
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
            <div>
              <button onClick={() => setSelectedExam(null)} className="text-xs font-bold text-primary hover:underline flex items-center gap-1 mb-1">
                ← Kembali ke Manajemen Exam
              </button>
              <h2 className="text-xl font-extrabold text-slate-800">
                Soal Ujian: <span className="text-primary">{selectedExam.title}</span>
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                {questions.length} Soal terdaftar. Fitur acak: {selectedExam.shuffle_questions ? "Aktif" : "Mati"}. Acak opsi: {selectedExam.shuffle_options ? "Aktif" : "Mati"}.
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowBulkModal(true)}
                className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2.5 text-xs font-bold text-primary hover:bg-primary/10 transition-colors"
              >
                <FileSpreadsheet className="h-4 w-4" /> Import Bulk (JSON)
              </button>
              <button 
                onClick={() => setShowQuestionForm(!showQuestionForm)}
                className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all"
              >
                <Plus className="h-4 w-4" /> {showQuestionForm ? "Tutup Form" : "Tambah Soal"}
              </button>
            </div>
          </div>

          {/* Form manual add question */}
          {showQuestionForm && (
            <div className="rounded-3xl border border-border bg-white p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800">Form Tambah Soal Manual</h3>
              <form onSubmit={handleAddQuestion} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Pertanyaan</label>
                  <textarea 
                    required 
                    rows={3} 
                    className="w-full rounded-xl border border-border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary"
                    placeholder="Tulis pertanyaan di sini..."
                    value={questionForm.question}
                    onChange={e => setQuestionForm({...questionForm, question: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Pilihan A</label>
                    <input 
                      required 
                      type="text"
                      className="w-full rounded-xl border border-border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary"
                      value={questionForm.option_a}
                      onChange={e => setQuestionForm({...questionForm, option_a: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Pilihan B</label>
                    <input 
                      required 
                      type="text"
                      className="w-full rounded-xl border border-border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary"
                      value={questionForm.option_b}
                      onChange={e => setQuestionForm({...questionForm, option_b: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Pilihan C</label>
                    <input 
                      required 
                      type="text"
                      className="w-full rounded-xl border border-border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary"
                      value={questionForm.option_c}
                      onChange={e => setQuestionForm({...questionForm, option_c: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Pilihan D</label>
                    <input 
                      required 
                      type="text"
                      className="w-full rounded-xl border border-border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary"
                      value={questionForm.option_d}
                      onChange={e => setQuestionForm({...questionForm, option_d: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Jawaban Benar</label>
                    <select 
                      className="w-full rounded-xl border border-border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary"
                      value={questionForm.correct_answer}
                      onChange={e => setQuestionForm({...questionForm, correct_answer: e.target.value})}
                    >
                      <option value="a">A</option>
                      <option value="b">B</option>
                      <option value="c">C</option>
                      <option value="d">D</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Poin Nilai</label>
                    <input 
                      required 
                      type="number"
                      min={1}
                      className="w-full rounded-xl border border-border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary"
                      value={questionForm.points}
                      onChange={e => setQuestionForm({...questionForm, points: parseInt(e.target.value) || 1})}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowQuestionForm(false)} className="rounded-xl px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-slate-50">Batal</button>
                  <button type="submit" className="rounded-xl bg-primary px-6 py-2 text-xs font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary-deep">Simpan Soal</button>
                </div>
              </form>
            </div>
          )}

          {/* List of questions */}
          <div className="space-y-4">
            {questionLoading ? (
              <div className="text-center py-12 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                Memuat daftar soal...
              </div>
            ) : questions.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border p-12 text-center text-muted-foreground">
                Belum ada soal terdaftar di exam ini.
                <div className="mt-4 flex justify-center gap-2">
                  <button onClick={() => setShowQuestionForm(true)} className="text-xs font-bold text-primary hover:underline">Tambah manual</button>
                  <span>atau</span>
                  <button onClick={() => setShowBulkModal(true)} className="text-xs font-bold text-primary hover:underline">Import bulk JSON</button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((q, idx) => (
                  <div key={q.id} className="rounded-3xl border border-border bg-white p-6 shadow-sm hover:border-slate-300 transition-colors">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Soal #{idx + 1}
                          </span>
                          <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Poin: {q.points || 1}
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-slate-800 whitespace-pre-wrap">{q.question}</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4 text-xs text-slate-700">
                          <div className={`p-2.5 rounded-xl border ${q.correct_answer === 'a' ? 'bg-green-50 border-green-200 font-bold text-green-700' : 'border-slate-100'}`}>
                            A. {q.option_a}
                          </div>
                          <div className={`p-2.5 rounded-xl border ${q.correct_answer === 'b' ? 'bg-green-50 border-green-200 font-bold text-green-700' : 'border-slate-100'}`}>
                            B. {q.option_b}
                          </div>
                          <div className={`p-2.5 rounded-xl border ${q.correct_answer === 'c' ? 'bg-green-50 border-green-200 font-bold text-green-700' : 'border-slate-100'}`}>
                            C. {q.option_c}
                          </div>
                          <div className={`p-2.5 rounded-xl border ${q.correct_answer === 'd' ? 'bg-green-50 border-green-200 font-bold text-green-700' : 'border-slate-100'}`}>
                            D. {q.option_d}
                          </div>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors self-start"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════ EXAM CREATION / EDIT MODAL ════════ */}
      {showExamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-3xl bg-white p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-extrabold text-slate-800">
                {editingExam ? "Edit Ujian" : "Bikin Ujian Baru"}
              </h3>
              <button onClick={() => setShowExamModal(false)} className="p-1 rounded-full hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveExam} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-muted-foreground">Judul Ujian</label>
                <input 
                  required 
                  type="text" 
                  className="w-full rounded-xl border border-border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary"
                  placeholder="e.g. Ujian Kelulusan React Dasar"
                  value={examForm.title}
                  onChange={e => setExamForm({...examForm, title: e.target.value})}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-muted-foreground">Deskripsi Singkat</label>
                <textarea 
                  rows={2} 
                  className="w-full rounded-xl border border-border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary"
                  placeholder="e.g. Evaluasi kemampuan teoritis dan praktis tentang framework React."
                  value={examForm.description}
                  onChange={e => setExamForm({...examForm, description: e.target.value})}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-muted-foreground">Relasi Course (Opsional)</label>
                <select 
                  className="w-full rounded-xl border border-border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary"
                  value={examForm.course_id}
                  onChange={e => setExamForm({...examForm, course_id: e.target.value})}
                >
                  <option value="">— Umum (Tidak terikat Course manapun) —</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Durasi (Menit)</label>
                  <input 
                    required 
                    type="number" 
                    min={5}
                    className="w-full rounded-xl border border-border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary"
                    value={examForm.duration_minutes}
                    onChange={e => setExamForm({...examForm, duration_minutes: parseInt(e.target.value) || 30})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Nilai Kelulusan (%)</label>
                  <input 
                    required 
                    type="number" 
                    min={10}
                    max={100}
                    className="w-full rounded-xl border border-border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary"
                    value={examForm.passing_score}
                    onChange={e => setExamForm({...examForm, passing_score: parseInt(e.target.value) || 70})}
                  />
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t">
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="shuffle_questions" 
                    className="h-4 w-4 rounded text-primary border-slate-300" 
                    checked={examForm.shuffle_questions}
                    onChange={e => setExamForm({...examForm, shuffle_questions: e.target.checked})}
                  />
                  <label htmlFor="shuffle_questions" className="text-xs font-bold text-slate-700 cursor-pointer">
                    Acak Urutan Soal untuk Siswa
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="shuffle_options" 
                    className="h-4 w-4 rounded text-primary border-slate-300" 
                    checked={examForm.shuffle_options}
                    onChange={e => setExamForm({...examForm, shuffle_options: e.target.checked})}
                  />
                  <label htmlFor="shuffle_options" className="text-xs font-bold text-slate-700 cursor-pointer">
                    Acak Opsi Pilihan Ganda (A/B/C/D)
                  </label>
                </div>
              </div>

              {/* Publish Toggle — prominent banner style */}
              <button
                type="button"
                onClick={() => setExamForm({...examForm, is_published: !examForm.is_published})}
                className={`w-full flex items-center justify-between gap-3 rounded-2xl border-2 px-5 py-4 transition-all ${
                  examForm.is_published
                    ? "border-green-400 bg-green-50 text-green-700"
                    : "border-amber-300 bg-amber-50 text-amber-700"
                }`}
              >
                <div className="text-left">
                  <p className="text-sm font-extrabold">
                    {examForm.is_published ? "✅ Exam Dipublish" : "⚠️ Exam Masih Draft"}
                  </p>
                  <p className="text-xs mt-0.5 opacity-80">
                    {examForm.is_published
                      ? "Siswa dapat melihat dan mengerjakan ujian ini."
                      : "Klik untuk mempublish — siswa belum bisa melihat ujian ini."}
                  </p>
                </div>
                <div className={`relative h-6 w-11 rounded-full transition-colors flex-shrink-0 ${
                  examForm.is_published ? "bg-green-500" : "bg-slate-300"
                }`}>
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    examForm.is_published ? "translate-x-5" : "translate-x-0.5"
                  }`} />
                </div>
              </button>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button type="button" onClick={() => setShowExamModal(false)} className="rounded-xl px-4 py-2 text-sm font-bold text-muted-foreground hover:bg-slate-50">
                  Batal
                </button>
                <button type="submit" className="rounded-xl bg-primary px-6 py-2 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary-deep">
                  {editingExam ? "Simpan Perubahan" : "Buat Exam"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════ BULK IMPORT SOAL MODAL ════════ */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-extrabold text-slate-800">Import Soal Bulk via JSON</h3>
              <button onClick={() => setShowBulkModal(false)} className="p-1 rounded-full hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-xs text-blue-700 space-y-2 mb-4">
              <p className="font-bold flex items-center gap-1">
                <AlertCircle className="h-4 w-4" /> Petunjuk Format Data JSON:
              </p>
              <p>
                Silakan tempelkan array objek JSON yang berisi field-field berikut:
              </p>
              <ul className="list-disc list-inside space-y-1 font-mono bg-white/60 p-2.5 rounded-xl border">
                <li>question: string (pertanyaan)</li>
                <li>option_a: string (opsi A)</li>
                <li>option_b: string (opsi B)</li>
                <li>option_c: string (opsi C)</li>
                <li>option_d: string (opsi D)</li>
                <li>correct_answer: string ("a", "b", "c", atau "d")</li>
                <li>points: number (opsional, default 1)</li>
              </ul>
              <div className="pt-2 flex gap-2">
                <button onClick={copyTemplateToClipboard} className="flex items-center gap-1 bg-blue-100 hover:bg-blue-200 px-3 py-1.5 rounded-lg font-bold transition-all">
                  <Clipboard className="h-3.5 w-3.5" /> Salin Template JSON
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-muted-foreground">Tempel Paste JSON di Sini</label>
                <textarea 
                  rows={12} 
                  className="w-full rounded-xl border border-border bg-slate-50 p-4 text-xs font-mono outline-none focus:border-primary"
                  placeholder="[\n  {\n    'question': '...',\n    'option_a': '...',\n    ...\n  }\n]"
                  value={bulkJson}
                  onChange={e => setBulkJson(e.target.value)}
                />
              </div>

              {bulkError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-600 font-bold flex items-center gap-2">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                  <span>{bulkError}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button type="button" onClick={() => setShowBulkModal(false)} className="rounded-xl px-4 py-2 text-sm font-bold text-muted-foreground hover:bg-slate-50">
                  Batal
                </button>
                <button 
                  onClick={handleBulkImport}
                  disabled={bulkImporting || !bulkJson.trim()} 
                  className="flex items-center gap-1.5 rounded-xl bg-primary px-6 py-2 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary-deep disabled:opacity-50"
                >
                  {bulkImporting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Mengimpor...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="h-4 w-4" />
                      Proses & Import
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════ SHOW ATTEMPTS / STUDENTS RESULTS MODAL ════════ */}
      {showAttemptsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-3xl bg-white p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-extrabold text-slate-800">Nilai & Riwayat Siswa</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{selectedExam?.title}</p>
              </div>
              <button onClick={() => setShowAttemptsModal(false)} className="p-1 rounded-full hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-2xl border overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase">Nama Siswa</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase">Nilai</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase">Benar / Total</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase">Durasi Pengerjaan</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase">Waktu Selesai</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {attemptsLoading ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin mx-auto text-primary" />
                      </td>
                    </tr>
                  ) : attempts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                        Belum ada siswa yang mengerjakan ujian ini.
                      </td>
                    </tr>
                  ) : attempts.map((att) => {
                    const isPassed = att.score >= selectedExam.passing_score;
                    const durationMins = Math.floor((att.time_spent_seconds || 0) / 60);
                    const durationSecs = (att.time_spent_seconds || 0) % 60;
                    return (
                      <tr key={att.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-semibold text-slate-800">
                          {att.user_profiles?.full_name || "Siswa Nexora"}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block font-bold text-base px-2 py-0.5 rounded ${
                            isPassed ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                          }`}>
                            {att.score}%
                          </span>
                          <span className="text-[10px] block text-muted-foreground font-semibold">
                            {isPassed ? 'LULUS' : 'GAGAL'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {att.total_correct} / {att.total_questions}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {durationMins > 0 ? `${durationMins}m ` : ""}{durationSecs}s
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {att.finished_at ? new Date(att.finished_at).toLocaleString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-6">
              <button onClick={() => setShowAttemptsModal(false)} className="rounded-xl bg-slate-100 hover:bg-slate-200 px-6 py-2 text-sm font-bold text-slate-700">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════ CUSTOM BADGE / TITLE SETTINGS MODAL ════════ */}
      {showBadgeSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6 pb-2 border-b">
              <div>
                <h3 className="text-base font-bold text-slate-800">Setting Badge & Title</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{badgeSettingsExam?.title}</p>
              </div>
              <button onClick={() => setShowBadgeSettingsModal(false)} className="p-1 rounded-full hover:bg-slate-100 text-slate-400">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBadgeSettings} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase">Nama Badge & Title Kelulusan</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. React Master"
                  value={badgeSettingsForm.name}
                  onChange={(e) => setBadgeSettingsForm({ ...badgeSettingsForm, name: e.target.value })}
                  className="w-full rounded-xl border border-border bg-slate-50 px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                />
                <p className="text-[10px] text-muted-foreground italic mt-0.5 px-1">
                  Nama badge ini juga akan menjadi Title resmi yang bisa dipilih siswa di profil mereka.
                </p>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase">Ikon Badge (Emoji)</label>
                <input
                  required
                  type="text"
                  maxLength={2}
                  placeholder="🏆"
                  value={badgeSettingsForm.icon}
                  onChange={(e) => setBadgeSettingsForm({ ...badgeSettingsForm, icon: e.target.value })}
                  className="w-full rounded-xl border border-border bg-slate-50 px-4 py-2.5 text-sm focus:border-primary focus:outline-none text-center text-lg"
                />
                <p className="text-[10px] text-muted-foreground italic mt-0.5 px-1">
                  Tempelkan 1 karakter emoji (contoh: ⚛️, 🏆, 👑, 💻) sebagai ikon lencana siswa.
                </p>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase">Deskripsi Lencana</label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Berhasil menyelesaikan ujian kelulusan kelas React Dasar."
                  value={badgeSettingsForm.description}
                  onChange={(e) => setBadgeSettingsForm({ ...badgeSettingsForm, description: e.target.value })}
                  className="w-full rounded-xl border border-border bg-slate-50 px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase">Pilih Warna Gradien &amp; Frame</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { key: "violet",  gradient: "from-violet-500 via-purple-500 to-pink-500",    label: "Obsidian",  emoji: "🔮" },
                    { key: "cyan",    gradient: "from-cyan-300 via-blue-400 to-indigo-500",       label: "Sapphire",  emoji: "🌊" },
                    { key: "gold",    gradient: "from-yellow-300 via-amber-400 to-orange-500",    label: "Gold",      emoji: "👑" },
                    { key: "emerald", gradient: "from-emerald-400 via-teal-500 to-cyan-500",      label: "Emerald",   emoji: "🌿" },
                    { key: "rose",    gradient: "from-rose-400 via-pink-500 to-red-500",          label: "Ruby",      emoji: "💖" },
                    { key: "indigo",  gradient: "from-indigo-400 via-purple-500 to-rose-500",     label: "Cosmic",    emoji: "🌌" },
                    { key: "amber",   gradient: "from-amber-200 via-yellow-400 to-orange-400",    label: "Amber",     emoji: "🌅" },
                    { key: "sky",     gradient: "from-sky-400 via-indigo-500 to-purple-600",      label: "Deep Space",emoji: "🪐" },
                  ].map(({ key, gradient, label, emoji }) => {
                    const isActive = badgeSettingsForm.color === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setBadgeSettingsForm({ ...badgeSettingsForm, color: key })}
                        className={`relative flex flex-col items-center gap-1 rounded-2xl p-1.5 border-2 transition-all ${
                          isActive ? "border-primary shadow-md scale-105" : "border-transparent hover:border-slate-300"
                        }`}
                      >
                        {/* Gradient swatch */}
                        <div className={`h-10 w-full rounded-xl bg-gradient-to-br ${gradient} shadow-sm`} />
                        <span className="text-[9px] font-bold text-slate-600 leading-none">{emoji} {label}</span>
                        {isActive && (
                          <div className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-primary flex items-center justify-center shadow">
                            <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Live badge preview */}
                <div className="mt-3 flex items-center gap-3 rounded-2xl border bg-slate-50 px-4 py-3">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr ${
                    badgeSettingsForm.color === "cyan"    ? "from-cyan-300 via-blue-400 to-indigo-500" :
                    badgeSettingsForm.color === "gold"    ? "from-yellow-300 via-amber-400 to-orange-500" :
                    badgeSettingsForm.color === "emerald" ? "from-emerald-400 via-teal-500 to-cyan-500" :
                    badgeSettingsForm.color === "rose"    ? "from-rose-400 via-pink-500 to-red-500" :
                    badgeSettingsForm.color === "indigo"  ? "from-indigo-400 via-purple-500 to-rose-500" :
                    badgeSettingsForm.color === "amber"   ? "from-amber-200 via-yellow-400 to-orange-400" :
                    badgeSettingsForm.color === "sky"     ? "from-sky-400 via-indigo-500 to-purple-600" :
                    "from-violet-500 via-purple-500 to-pink-500"
                  } p-[2.5px] shadow-md`}>
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-white text-xl">
                      {badgeSettingsForm.icon || "🏆"}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-extrabold text-slate-800 truncate">{badgeSettingsForm.name || "Nama Badge"}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Preview tampilan di profil siswa</p>
                  </div>
                </div>
              </div>


              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowBadgeSettingsModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingBadgeSettings}
                  className="rounded-xl bg-primary px-6 py-2 text-xs font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary-deep transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  {savingBadgeSettings ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan Setting"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
