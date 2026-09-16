import { useState, useEffect } from "react";
import {
  Gamepad2, Plus, Play, Sparkles, Trophy, Users, Trash2, Edit, X, Copy, Check, ArrowRight, Eye
} from "lucide-react";
import {
  MiniGame, GameType, CerdasCermatQuestion, getStoredGames, saveStoredGame, deleteStoredGame, createRoom, updateRoomStatus, useGameRoom
} from "@/hooks/use-mini-games";
import { Link } from "@tanstack/react-router";

export const ALL_COURSES_LIST = [
  // Front End
  { id: "c-fe-001", title: "Front End Web Development", division: "front-end" },
  { id: "c-fe-002", title: "React Lanjutan & State Management", division: "front-end" },
  { id: "c-fe-003", title: "TailwindCSS untuk Designer Developer", division: "front-end" },
  // Back End
  { id: "c-be-001", title: "Back End dengan Node.js", division: "back-end" },
  { id: "c-be-002", title: "Database Relasional & PostgreSQL", division: "back-end" },
  // Mobile Dev
  { id: "c-mb-001", title: "Mobile App dengan React Native", division: "mobile-dev" },
  { id: "c-mb-002", title: "Flutter Cross-Platform", division: "mobile-dev" },
  // UI/UX
  { id: "c-ux-001", title: "UI/UX Design Fundamentals", division: "ui-ux" },
  { id: "c-ux-002", title: "Figma Prototyping & Design System", division: "ui-ux" },
  // DevOps
  { id: "c-do-001", title: "DevOps Essentials & Docker", division: "devops" },
  { id: "c-do-002", title: "CI/CD Pipeline dengan GitHub Actions", division: "devops" },
];

export function AdminMiniGamesPanel() {
  const [games, setGames] = useState<MiniGame[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingGame, setEditingGame] = useState<MiniGame | null>(null);

  // Active Host Control Modal
  const [activeHostRoomCode, setActiveHostRoomCode] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Form State
  const [filterDivision, setFilterDivision] = useState<string>("all");
  const [formType, setFormType] = useState<GameType>("prompt_vote");
  const [formTitle, setFormTitle] = useState("");
  const [formCourseId, setFormCourseId] = useState("c-fe-001");
  const [formDivisionSlug, setFormDivisionSlug] = useState("front-end");
  const [formDescription, setFormDescription] = useState("");
  const [formPromptInstruction, setFormPromptInstruction] = useState("");
  const [formQuestions, setFormQuestions] = useState<CerdasCermatQuestion[]>([
    {
      id: "q1",
      question: "Apa singkatan dari HTML?",
      options: ["HyperText Markup Language", "HighText Machine Language", "Hyper Transfer Markup Language", "Home Tool Markup Language"],
      correctAnswer: 0,
      timeLimit: 15,
    }
  ]);

  const { room: activeRoom, participants: roomParticipants } = useGameRoom(activeHostRoomCode);

  useEffect(() => {
    setGames(getStoredGames());
  }, []);

  const handleOpenCreateModal = (gameToEdit?: MiniGame) => {
    if (gameToEdit) {
      setEditingGame(gameToEdit);
      setFormType(gameToEdit.game_type);
      setFormTitle(gameToEdit.title);
      setFormCourseId(gameToEdit.course_id || "c-fe-001");
      setFormDivisionSlug(gameToEdit.division_slug || "front-end");
      setFormDescription(gameToEdit.description || "");
      setFormPromptInstruction(gameToEdit.prompt_instruction || "");
      setFormQuestions(gameToEdit.questions || []);
    } else {
      setEditingGame(null);
      setFormType("prompt_vote");
      setFormTitle("");
      setFormCourseId("c-fe-001");
      setFormDivisionSlug("front-end");
      setFormDescription("");
      setFormPromptInstruction("Buat gambar pegunungan megah di sore hari menggunakan AI (Midjourney/DALL-E/Bing AI).");
      setFormQuestions([
        {
          id: `q-${Date.now()}-1`,
          question: "Manakah tag HTML untuk membuat teks tebal?",
          options: ["<strong>", "<bold>", "<bld>", "<style>"],
          correctAnswer: 0,
          timeLimit: 15,
        }
      ]);
    }
    setShowCreateModal(true);
  };

  const handleSaveGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const newGame: MiniGame = {
      id: editingGame ? editingGame.id : `mg-${Date.now()}`,
      title: formTitle,
      game_type: formType,
      course_id: formCourseId,
      division_slug: formDivisionSlug,
      description: formDescription,
      prompt_instruction: formType === "prompt_vote" ? formPromptInstruction : undefined,
      questions: formType === "cerdas_cermat" ? formQuestions : undefined,
      created_at: editingGame?.created_at || new Date().toISOString(),
    };

    const updated = saveStoredGame(newGame);
    setGames(updated);
    setShowCreateModal(false);
  };

  const handleDeleteGame = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus mini game ini?")) {
      const updated = deleteStoredGame(id);
      setGames(updated);
    }
  };

  const handleAddQuestion = () => {
    setFormQuestions([
      ...formQuestions,
      {
        id: `q-${Date.now()}-${formQuestions.length + 1}`,
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
        timeLimit: 15,
      }
    ]);
  };

  const handleQuestionChange = (index: number, field: keyof CerdasCermatQuestion, value: any) => {
    const updated = [...formQuestions];
    updated[index] = { ...updated[index], [field]: value };
    setFormQuestions(updated);
  };

  const handleOptionChange = (qIndex: number, optIndex: number, val: string) => {
    const updated = [...formQuestions];
    const opts = [...updated[qIndex].options];
    opts[optIndex] = val;
    updated[qIndex].options = opts;
    setFormQuestions(updated);
  };

  const handleLaunchRoom = (gameId: string) => {
    const newRoom = createRoom(gameId);
    setActiveHostRoomCode(newRoom.room_code);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleHostStatusChange = (status: any, currentIndex?: number) => {
    if (activeHostRoomCode) {
      updateRoomStatus(activeHostRoomCode, status, currentIndex);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 rounded-3xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 p-6 text-white shadow-xl sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur-md">
            <Gamepad2 className="h-4 w-4" /> Realtime Multiplayer Games
          </div>
          <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">Manajemen Mini Games</h2>
          <p className="mt-1 text-sm text-purple-100">
            Buat game AI Prompt Voting & Cerdas Cermat interaktif dengan Kode Room & Waiting Room Host.
          </p>
        </div>
        <button
          onClick={() => handleOpenCreateModal()}
          className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-indigo-700 shadow-md transition-all hover:bg-purple-50 hover:scale-105 active:scale-95 shrink-0"
        >
          <Plus className="h-5 w-5" /> Buat Mini Game Baru
        </button>
      </div>

      {/* Division Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-muted-foreground mr-2">Filter Divisi:</span>
        {[
          { id: "all", label: "Semua Divisi" },
          { id: "front-end", label: "Front End" },
          { id: "back-end", label: "Back End" },
          { id: "mobile-dev", label: "Mobile Dev" },
          { id: "ui-ux", label: "UI/UX" },
          { id: "devops", label: "DevOps" },
        ].map((d) => (
          <button
            key={d.id}
            onClick={() => setFilterDivision(d.id)}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${filterDivision === d.id ? "bg-primary text-white shadow-soft" : "bg-card border border-border text-muted-foreground hover:bg-accent"}`}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* Game Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {games.filter((g) => filterDivision === "all" || g.division_slug === filterDivision || g.division_slug === "all").length === 0 ? (
          <div className="col-span-full rounded-3xl border border-dashed border-border bg-card p-12 text-center">
            <Gamepad2 className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
            <h3 className="mt-4 text-lg font-bold">Belum Ada Mini Game</h3>
            <p className="mt-1 text-sm text-muted-foreground">Klik tombol di atas untuk membuat game AI Prompt atau Cerdas Cermat.</p>
          </div>
        ) : (
          games
            .filter((g) => filterDivision === "all" || g.division_slug === filterDivision || g.division_slug === "all")
            .map((g) => (
            <div key={g.id} className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border/60 bg-card p-6 shadow-soft transition-all duration-300 hover:shadow-card hover:-translate-y-1">
              <div>
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${g.game_type === "prompt_vote" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300" : "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"}`}>
                    {g.game_type === "prompt_vote" ? <Sparkles className="h-3.5 w-3.5" /> : <Trophy className="h-3.5 w-3.5" />}
                    {g.game_type === "prompt_vote" ? "AI Prompt & Vote" : "Cerdas Cermat"}
                  </span>
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                    <button onClick={() => handleOpenCreateModal(g)} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-secondary">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDeleteGame(g.id)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <h3 className="mt-4 text-lg font-bold text-foreground">{g.title}</h3>
                <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{g.description || "Game interaktif kelas."}</p>

                {g.game_type === "prompt_vote" ? (
                  <div className="mt-4 rounded-2xl bg-purple-50 p-3 text-xs text-purple-900 dark:bg-purple-950/40 dark:text-purple-200">
                    <p className="font-semibold text-purple-700 dark:text-purple-300">Prompt Instruksi:</p>
                    <p className="mt-0.5 line-clamp-2 italic">"{g.prompt_instruction}"</p>
                  </div>
                ) : (
                  <div className="mt-4 flex items-center gap-4 rounded-2xl bg-blue-50 p-3 text-xs text-blue-900 dark:bg-blue-950/40 dark:text-blue-200">
                    <div>
                      <span className="font-bold text-base">{g.questions?.length || 0}</span> Soal
                    </div>
                    <div>
                      <span className="font-bold text-base">{(g.questions?.[0]?.timeLimit || 15)}s</span> / Soal
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-border flex items-center gap-2">
                <button
                  onClick={() => handleLaunchRoom(g.id)}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-soft transition-all hover:bg-primary-deep active:scale-95"
                >
                  <Play className="h-4 w-4 fill-white" /> Luncurkan Room Host
                </button>
                <Link
                  to="/game/$gameId"
                  params={{ gameId: g.id }}
                  className="rounded-xl border border-border p-2.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                  title="Preview Game"
                >
                  <Eye className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Host Room Console Modal */}
      {activeHostRoomCode && activeRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-border bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border bg-slate-900 px-6 py-4 text-white">
              <div className="flex items-center gap-2">
                <Gamepad2 className="h-5 w-5 text-purple-400" />
                <span className="font-bold text-lg">Console Admin Host Room</span>
              </div>
              <button onClick={() => setActiveHostRoomCode(null)} className="rounded-full p-1 text-slate-400 hover:bg-slate-800 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              {/* Room Code Display */}
              <div className="flex flex-col items-center justify-center rounded-2xl bg-gradient-to-b from-purple-50 to-indigo-50 p-6 text-center dark:from-purple-950/30 dark:to-indigo-950/30">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">KODE ROOM MULTIPLAYER</span>
                <div className="mt-2 flex items-center gap-3">
                  <span className="text-4xl font-extrabold tracking-wider text-primary">{activeRoom.room_code}</span>
                  <button
                    onClick={() => handleCopyCode(activeRoom.room_code)}
                    className="inline-flex items-center gap-1 rounded-xl bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-soft hover:bg-slate-100 dark:bg-card dark:text-foreground"
                  >
                    {copiedCode ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    {copiedCode ? "Tersalin!" : "Salin Kode"}
                  </button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">Bagikan kode ini ke siswa agar mereka berkumpul di Waiting Room!</p>
              </div>

              {/* Waiting Room Real-time Participants List */}
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" /> Siswa Terhubung ({roomParticipants.length})
                  </h4>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-700">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" /> REALTIME LIVE
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {roomParticipants.length === 0 ? (
                    <div className="col-span-full rounded-2xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                      Belum ada siswa yang masuk. Bagikan Kode Room <span className="font-bold text-primary">{activeRoom.room_code}</span>!
                    </div>
                  ) : (
                    roomParticipants.map((p) => (
                      <div key={p.id} className="flex items-center gap-2 rounded-xl border border-border/50 bg-secondary/50 p-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 font-bold text-primary text-xs">
                          {p.user_name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 truncate">
                          <p className="text-xs font-bold truncate text-foreground">{p.user_name}</p>
                          <p className="text-[10px] text-muted-foreground">{p.is_ready ? "✅ Ready" : "⏳ Menunggu"}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Host Control Actions per Game Type */}
              <div className="pt-4 border-t border-border">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">KONTROL STATUS GAME (HOST)</h4>
                
                <div className="rounded-2xl bg-secondary p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Status Room Saat Ini:</span>
                    <span className="font-bold uppercase text-primary px-2.5 py-1 rounded-full bg-primary/10">
                      {activeRoom.status}
                    </span>
                  </div>

                  {/* Controls for AI Prompt */}
                  {activeRoom.game_data?.game_type === "prompt_vote" && (
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <button
                        onClick={() => handleHostStatusChange("submission")}
                        disabled={activeRoom.status === "submission"}
                        className="rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-purple-700 disabled:opacity-50"
                      >
                        1. Buka Pengerjaan Gambar
                      </button>
                      <button
                        onClick={() => handleHostStatusChange("voting")}
                        disabled={activeRoom.status === "voting"}
                        className="rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-700 disabled:opacity-50"
                      >
                        2. Mulai Vote (Random Showcase)
                      </button>
                      <button
                        onClick={() => handleHostStatusChange("finished")}
                        className="col-span-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-700"
                      >
                        3. Akhiri Game & Tampilkan Podium Pemeringkatan
                      </button>
                    </div>
                  )}

                  {/* Controls for Cerdas Cermat */}
                  {activeRoom.game_data?.game_type === "cerdas_cermat" && (
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <button
                        onClick={() => handleHostStatusChange("playing", 0)}
                        className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-blue-700"
                      >
                        Mulai Cerdas Cermat (Soal 1)
                      </button>
                      <button
                        onClick={() => handleHostStatusChange("playing", (activeRoom.current_index || 0) + 1)}
                        className="rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-700"
                      >
                        Lanjut Soal Berikutnya ({(activeRoom.current_index || 0) + 2})
                      </button>
                      <button
                        onClick={() => handleHostStatusChange("finished")}
                        className="col-span-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-700"
                      >
                        Akhiri Game & Tampilkan Podium Juara 1, 2, 3
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border bg-secondary/30 px-6 py-4">
              <Link
                to="/game/$gameId"
                params={{ gameId: activeRoom.game_id }}
                search={{ code: activeRoom.room_code } as any}
                target="_blank"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
              >
                Buka Player Tampilan Siswa (New Tab) <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <button
                onClick={() => setActiveHostRoomCode(null)}
                className="rounded-xl bg-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-300 dark:bg-secondary dark:text-foreground"
              >
                Tutup Window Console
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Game Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-border bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Gamepad2 className="h-5 w-5 text-primary" /> {editingGame ? "Edit Mini Game" : "Buat Mini Game Baru"}
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="rounded-full p-1 text-muted-foreground hover:bg-accent">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGame} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Type selector */}
              <div>
                <label className="text-xs font-bold text-foreground">Jenis Mini Game</label>
                <div className="mt-1.5 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormType("prompt_vote")}
                    className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition-all ${formType === "prompt_vote" ? "border-purple-500 bg-purple-50/50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 font-bold" : "border-border hover:bg-accent"}`}
                  >
                    <Sparkles className="h-6 w-6 text-purple-600" />
                    <div>
                      <p className="text-sm">AI Prompt & Voting</p>
                      <p className="text-[11px] text-muted-foreground font-normal">Input gambar AI lalu voting showcase 1-by-1.</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormType("cerdas_cermat")}
                    className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition-all ${formType === "cerdas_cermat" ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 font-bold" : "border-border hover:bg-accent"}`}
                  >
                    <Trophy className="h-6 w-6 text-blue-600" />
                    <div>
                      <p className="text-sm">Cerdas Cermat Battle</p>
                      <p className="text-[11px] text-muted-foreground font-normal">Quiz pilihan ganda live dengan timer & leaderboard.</p>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground">Judul Game</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Contoh: Tantangan Prompting Pegunungan"
                  className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground">Deskripsi Ringkas</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Penjelasan singkat mengenai aturan game..."
                  className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground">1. Pilih Divisi / Kategori Game</label>
                <select
                  value={formDivisionSlug}
                  onChange={(e) => {
                    const newDiv = e.target.value;
                    setFormDivisionSlug(newDiv);
                    const matchingCourses = ALL_COURSES_LIST.filter((c) => c.division === newDiv);
                    setFormCourseId(matchingCourses[0]?.id || "c-fe-001");
                  }}
                  className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary text-primary"
                >
                  <option value="front-end">💻 Divisi Front End</option>
                  <option value="back-end">⚙️ Divisi Back End</option>
                  <option value="mobile-dev">📱 Divisi Mobile Dev</option>
                  <option value="ui-ux">🎨 Divisi UI/UX</option>
                  <option value="devops">☁️ Divisi DevOps</option>
                  <option value="all">🌐 Semua Divisi (Global)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground">2. Pilih Kelas / Jadwal di Divisi Ini</label>
                <select
                  value={formCourseId}
                  onChange={(e) => setFormCourseId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary text-indigo-600"
                >
                  <option value="all">🌐 Semua Kelas dalam Divisi Ini</option>
                  {ALL_COURSES_LIST.filter((c) => formDivisionSlug === "all" || c.division === formDivisionSlug).map((c) => (
                    <option key={c.id} value={c.id}>
                      📚 {c.title} ({c.id})
                    </option>
                  ))}
                </select>
              </div>

              {/* Game 1 Specifics */}
              {formType === "prompt_vote" && (
                <div>
                  <label className="text-xs font-bold text-purple-700 dark:text-purple-300">Instruksi Prompt AI untuk Peserta</label>
                  <textarea
                    rows={3}
                    required
                    value={formPromptInstruction}
                    onChange={(e) => setFormPromptInstruction(e.target.value)}
                    placeholder="Contoh: Buat gambar pemandangan pegunungan menggunakan AI..."
                    className="mt-1 w-full rounded-xl border border-purple-200 bg-purple-50/30 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-purple-950/20"
                  />
                </div>
              )}

              {/* Game 2 Specifics */}
              {formType === "cerdas_cermat" && (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-blue-700 dark:text-blue-300">Daftar Soal Cerdas Cermat ({formQuestions.length})</label>
                    <button
                      type="button"
                      onClick={handleAddQuestion}
                      className="inline-flex items-center gap-1 rounded-lg bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700 hover:bg-blue-200"
                    >
                      <Plus className="h-3.5 w-3.5" /> Tambah Soal
                    </button>
                  </div>

                  {formQuestions.map((q, qIdx) => (
                    <div key={q.id || qIdx} className="rounded-2xl border border-blue-100 bg-blue-50/20 p-4 space-y-3 dark:border-blue-900/40">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-blue-600">Soal #{qIdx + 1}</span>
                        {formQuestions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setFormQuestions(formQuestions.filter((_, idx) => idx !== qIdx))}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      <input
                        type="text"
                        required
                        value={q.question}
                        onChange={(e) => handleQuestionChange(qIdx, "question", e.target.value)}
                        placeholder="Pertanyaan..."
                        className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                      />

                      <div className="grid grid-cols-2 gap-2">
                        {["A", "B", "C", "D"].map((lbl, optIdx) => (
                          <div key={lbl} className="flex items-center gap-2">
                            <span className="text-xs font-bold text-muted-foreground">{lbl}.</span>
                            <input
                              type="text"
                              required
                              value={q.options[optIdx] || ""}
                              onChange={(e) => handleOptionChange(qIdx, optIdx, e.target.value)}
                              placeholder={`Opsi ${lbl}`}
                              className="flex-1 rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs"
                            />
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center gap-4 text-xs">
                        <label className="font-bold text-muted-foreground">Kunci Jawaban Benar:</label>
                        <select
                          value={q.correctAnswer}
                          onChange={(e) => handleQuestionChange(qIdx, "correctAnswer", Number(e.target.value))}
                          className="rounded-lg border border-input bg-background px-3 py-1 font-bold text-primary"
                        >
                          <option value={0}>A ({q.options[0] || "Opsi A"})</option>
                          <option value={1}>B ({q.options[1] || "Opsi B"})</option>
                          <option value={2}>C ({q.options[2] || "Opsi C"})</option>
                          <option value={3}>D ({q.options[3] || "Opsi D"})</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl border border-border px-4 py-2.5 text-xs font-bold text-muted-foreground hover:bg-accent"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-primary-deep"
                >
                  Simpan Mini Game
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
