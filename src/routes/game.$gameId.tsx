import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Gamepad2, Sparkles, Trophy, ArrowLeft, Clock, Users, CheckCircle2, XCircle, KeyRound, Play
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useAuth } from "@/hooks/use-auth";
import {
  getStoredGames, MiniGame, useGameRoom, joinRoomParticipant, submitParticipantArtwork, castVote, updateRoomStatus, createRoom, getRoomByCode
} from "@/hooks/use-mini-games";

export const Route = createFileRoute("/game/$gameId")({
  component: GamePlayerPage,
});

function GamePlayerPage() {
  const { gameId } = Route.useParams();
  const search: any = useSearch({ strict: false });
  const navigate = useNavigate();
  const { user, profile, isAdmin, isMentor } = useAuth();

  // Room State
  const [roomCode, setRoomCode] = useState<string>(search?.code || "");
  const [inputCode, setInputCode] = useState<string>("");
  const { room, participants, votes } = useGameRoom(roomCode);

  // Participant details with STABLE user ID
  const [currentUserId] = useState(() => {
    if (user?.id) return user.id;
    let stored = sessionStorage.getItem("nexora_player_anon_id");
    if (!stored) {
      stored = `Peserta-${Math.floor(1000 + Math.random() * 9000)}`;
      sessionStorage.setItem("nexora_player_anon_id", stored);
    }
    return stored;
  });

  const currentUserName = profile?.full_name || (user?.email ? user.email.split("@")[0] : currentUserId);

  // Game 1 State (AI Prompt)
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [submittedImage, setSubmittedImage] = useState<string | null>(null);

  // Game 2 State (Cerdas Cermat)
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(15);

  const game: MiniGame = room?.game_data || getStoredGames().find((g) => g.id === gameId) || getStoredGames()[0];

  // Join Room when room code is set
  useEffect(() => {
    if (roomCode) {
      joinRoomParticipant({
        room_code: roomCode,
        user_id: currentUserId,
        user_name: currentUserName,
        score: 0,
      });
    }
  }, [roomCode, currentUserId, currentUserName]);

  // Sync Timer for Quiz
  useEffect(() => {
    if (room?.status === "playing" && game.game_type === "cerdas_cermat") {
      const q = game.questions?.[room.current_index || 0];
      setTimerSeconds(q?.timeLimit || 15);
      setSelectedOption(null);
      setIsAnswerRevealed(false);

      const interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsAnswerRevealed(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [room?.status, room?.current_index, game]);

  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    const upper = inputCode.trim().toUpperCase();
    const existing = getRoomByCode(upper);
    if (!existing) {
      alert(`Kode Room "${upper}" tidak ditemukan. Pastikan Admin sudah meluncurkan room!`);
      return;
    }
    setRoomCode(upper);
  };

  const handleCreateHostRoom = () => {
    const newRoom = createRoom(game.id);
    setRoomCode(newRoom.room_code);
  };

  const handleSubmitArtwork = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrlInput.trim() || !roomCode) return;
    submitParticipantArtwork(roomCode, currentUserId, imageUrlInput.trim());
    setSubmittedImage(imageUrlInput.trim());
  };

  const handleVote = (targetUserId: string, reaction: "bagus_sekali" | "absolute_cinema" | "kurang" | "jelek") => {
    if (!roomCode) return;
    castVote({
      room_code: roomCode,
      target_user_id: targetUserId,
      voter_user_id: currentUserId,
      reaction,
    });
  };

  const handleSelectOption = (index: number) => {
    if (selectedOption !== null || isAnswerRevealed) return;
    setSelectedOption(index);
    const q = game.questions?.[room?.current_index || 0];
    if (q && index === q.correctAnswer) {
      // Correct answer bonus points
      const points = Math.max(50, timerSeconds * 10);
      joinRoomParticipant({
        room_code: roomCode,
        user_id: currentUserId,
        user_name: currentUserName,
        score: (participants.find((p) => p.user_id === currentUserId)?.score || 0) + points,
      });
    }
  };

  // Sort participants by score for Leaderboard / Podium
  const sortedLeaderboard = [...participants].sort((a, b) => (b.score || 0) - (a.score || 0));

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />

      {/* Top Game Navigation Bar */}
      <div className="border-b border-border bg-card/60 backdrop-blur-md px-3 py-2.5 sm:px-4 sm:py-3">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2">
          <Link
            to="/course/$courseId"
            params={{ courseId: game.course_id || "c-fe-001" }}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary transition-colors shrink-0"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke Kelas
          </Link>

          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-extrabold ${game.game_type === "prompt_vote" ? "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300" : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"}`}>
              {game.game_type === "prompt_vote" ? <Sparkles className="h-3.5 w-3.5" /> : <Trophy className="h-3.5 w-3.5" />}
              <span className="max-w-[140px] sm:max-w-none truncate">{game.title}</span>
            </span>

            {roomCode && (
              <span className="rounded-xl border border-primary/30 bg-primary/10 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-bold text-primary shrink-0">
                KODE: {roomCode}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* MAIN GAME CONTAINER */}
      <main className="flex-1 px-3 py-4 sm:px-4 sm:py-8">
        <div className="mx-auto max-w-4xl">

          {/* ==================================================== */}
          {/* STATE 0: Belum Masuk Room (Join Code / Create Room) */}
          {/* ==================================================== */}
          {!roomCode && (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-border bg-card p-8 sm:p-12 text-center shadow-card animate-fade-in">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-lg">
                <Gamepad2 className="h-8 w-8" />
              </div>

              <h1 className="mt-6 text-2xl sm:text-3xl font-extrabold text-foreground">{game.title}</h1>
              <p className="mt-2 text-sm text-muted-foreground max-w-md">
                {game.description || "Game realtime multiplayer. Masukkan Kode Room untuk bergabung ke Waiting Room!"}
              </p>

              <form onSubmit={handleJoinByCode} className="mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  required
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  placeholder="KODE ROOM (NEX-XXXX)"
                  className="flex-1 rounded-2xl border border-input bg-background px-4 py-3 text-center text-sm font-extrabold tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="submit"
                  className="rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-primary-deep transition-all active:scale-95"
                >
                  Join Waiting Room
                </button>
              </form>

              {(isAdmin || isMentor) && (
                <div className="mt-8 pt-6 border-t border-border w-full max-w-md">
                  <p className="text-xs text-muted-foreground mb-2">Anda terdeteksi sebagai Admin/Mentor:</p>
                  <button
                    onClick={handleCreateHostRoom}
                    className="w-full rounded-2xl border border-purple-300 bg-purple-50 py-2.5 text-xs font-bold text-purple-700 hover:bg-purple-100 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800"
                  >
                    🚀 Luncurkan Host Room Baru (Buat Kode)
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ==================================================== */}
          {/* STATE 1: Waiting Room (Status: 'waiting')            */}
          {/* ==================================================== */}
          {roomCode && room?.status === "waiting" && (
            <div className="rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-card animate-fade-in space-y-8">
              <div className="flex flex-col items-center text-center">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" /> WAITING ROOM LOBBY
                </span>
                <h2 className="mt-3 text-3xl font-extrabold tracking-tight">Menunggu Game Dimulai</h2>
                <div className="mt-3 flex items-center gap-2 rounded-2xl bg-secondary px-4 py-2 text-sm font-bold text-primary">
                  <KeyRound className="h-4 w-4" /> KODE ROOM: {roomCode}
                </div>
              </div>

              {/* Connected Players Grid */}
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-4">
                  <Users className="h-4 w-4 text-primary" /> Peserta Terhubung di Waiting Room ({participants.length})
                </h3>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {participants.map((p) => (
                    <div
                      key={p.id}
                      className={`flex items-center gap-3 rounded-2xl border p-3 transition-all ${p.user_id === currentUserId ? "border-primary bg-primary/5 font-bold" : "border-border/60 bg-secondary/30"}`}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 text-white font-bold text-xs shadow-soft">
                        {p.user_name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 truncate">
                        <p className="text-xs font-bold text-foreground truncate">{p.user_name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {p.user_id === currentUserId ? "(Anda)" : "Ready"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                <Clock className="mx-auto h-6 w-6 text-muted-foreground mb-2 animate-pulse" />
                <p>Game akan otomatis dimulai setelah **Admin Host** memulakan game dari console.</p>
              </div>

              {/* Host Quick Start (If User is Admin) */}
              {(isAdmin || isMentor) && (
                <div className="pt-4 border-t border-border flex justify-center">
                  <button
                    onClick={() => updateRoomStatus(roomCode, game.game_type === "prompt_vote" ? "submission" : "playing", 0)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-lg hover:bg-emerald-700 transition-all"
                  >
                    <Play className="h-4 w-4 fill-white" /> Start Game Sekarang (Sebagai Host)
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ==================================================== */}
          {/* GAME 1: AI Prompt & Voting Showcase                  */}
          {/* ==================================================== */}
          {roomCode && game.game_type === "prompt_vote" && room?.status !== "waiting" && (
            <div className="space-y-6">

              {/* Phase: SUBMISSION */}
              {room?.status === "submission" && (
                <div className="rounded-3xl border border-purple-200 bg-card p-6 sm:p-10 shadow-card dark:border-purple-900/40 animate-fade-in space-y-6">
                  <div className="rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white shadow-md">
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur-md">
                      <Sparkles className="h-3.5 w-3.5" /> FASE 1: PROMPT & INPUT KARYA
                    </span>
                    <h2 className="mt-3 text-xl font-bold">Instruksi Prompt AI:</h2>
                    <p className="mt-2 text-base font-semibold italic text-purple-100 bg-black/20 p-4 rounded-xl border border-white/10">
                      "{game.prompt_instruction}"
                    </p>
                  </div>

                  <form onSubmit={handleSubmitArtwork} className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-foreground">Link URL Gambar Karya AI Anda</label>
                      <input
                        type="url"
                        required
                        value={imageUrlInput}
                        onChange={(e) => setImageUrlInput(e.target.value)}
                        placeholder="https://... (Paste URL gambar hasil AI)"
                        className="mt-1 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        Buka AI image generator pilihanmu, buat gambar sesuai instruksi di atas, lalu salin URL gambarnya ke sini.
                      </p>
                    </div>

                    {imageUrlInput && (
                      <div className="overflow-hidden rounded-2xl border border-border bg-slate-900 p-2">
                        <img
                          src={imageUrlInput}
                          alt="Preview Karya"
                          className="max-h-64 w-full object-contain rounded-xl"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop";
                          }}
                        />
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full rounded-2xl bg-purple-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-purple-700 transition-all active:scale-95"
                    >
                      {submittedImage ? "✓ Perbarui Karya Saya" : "Kirim Karya Saya ke Waiting Room"}
                    </button>
                  </form>
                </div>
              )}

              {/* Phase: LIVE VOTING SHOWCASE */}
              {room?.status === "voting" && (
                <div className="rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-card animate-fade-in space-y-8">
                  <div className="flex flex-col items-center text-center">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1 text-xs font-extrabold text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                      <Sparkles className="h-3.5 w-3.5" /> FASE 2: LIVE VOTING SHOWCASE
                    </span>
                    <h2 className="mt-2 text-2xl font-extrabold">Beri Penilaian Karya Rekan-Rekan!</h2>
                    <p className="text-xs text-muted-foreground mt-1">Pilih reaksi voting terbaik untuk setiap karya di bawah ini secara realtime.</p>
                  </div>

                  {/* Artwork Showcase Cards */}
                  <div className="grid gap-8 sm:grid-cols-2">
                    {participants.filter((p) => p.image_url).length === 0 ? (
                      <div className="col-span-full rounded-3xl border border-dashed border-border p-12 text-center text-xs text-muted-foreground">
                        Belum ada karya terdaftar.
                      </div>
                    ) : (
                      participants.filter((p) => p.image_url).map((p) => {
                        const targetVotes = votes.filter((v) => v.target_user_id === p.user_id);
                        return (
                          <div key={p.id} className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft space-y-4 p-4">
                            <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-slate-900">
                              <img src={p.image_url} alt={p.user_name} className="h-full w-full object-cover" />
                              <div className="absolute top-3 left-3 rounded-full bg-black/60 px-3 py-1 text-xs font-bold text-white backdrop-blur-md">
                                oleh {p.user_name}
                              </div>
                            </div>

                            {/* Reactions Voting Buttons */}
                            <div className="grid grid-cols-2 gap-2 pt-2">
                              <button
                                onClick={() => handleVote(p.user_id, "absolute_cinema")}
                                className="flex items-center justify-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 p-2.5 text-xs font-bold text-amber-800 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-200"
                              >
                                🎬 Cinema (+5)
                              </button>
                              <button
                                onClick={() => handleVote(p.user_id, "bagus_sekali")}
                                className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 p-2.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-200"
                              >
                                ⭐ Bagus (+3)
                              </button>
                              <button
                                onClick={() => handleVote(p.user_id, "kurang")}
                                className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-slate-50 p-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200"
                              >
                                😐 Kurang (+1)
                              </button>
                              <button
                                onClick={() => handleVote(p.user_id, "jelek")}
                                className="flex items-center justify-center gap-1.5 rounded-xl border border-red-300 bg-red-50 p-2.5 text-xs font-bold text-red-700 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-200"
                              >
                                👎 Jelek (0)
                              </button>
                            </div>

                            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
                              <span>Total Poin: <strong className="text-primary">{p.score || 0} pts</strong></span>
                              <span>{targetVotes.length} Suara</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================================================== */}
          {/* GAME 2: Cerdas Cermat / Quiz Battle                  */}
          {/* ==================================================== */}
          {roomCode && game.game_type === "cerdas_cermat" && room?.status === "playing" && (
            <div className="rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-card animate-fade-in space-y-6">
              {/* Question Header */}
              <div className="flex items-center justify-between border-b border-border pb-4">
                <span className="text-xs font-bold uppercase text-primary tracking-wider">
                  SOAL #{ (room.current_index || 0) + 1 } DARI { game.questions?.length || 5 }
                </span>
                <div className="flex items-center gap-2 rounded-xl bg-amber-500/10 px-3 py-1.5 text-xs font-extrabold text-amber-600">
                  <Clock className="h-4 w-4 animate-spin" /> TIMER: {timerSeconds} DETIK
                </div>
              </div>

              {/* Progress Bar Timer */}
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-1000"
                  style={{ width: `${(timerSeconds / (game.questions?.[room.current_index || 0]?.timeLimit || 15)) * 100}%` }}
                />
              </div>

              {/* Question Text */}
              <h2 className="text-xl sm:text-2xl font-extrabold text-foreground leading-snug">
                {game.questions?.[room.current_index || 0]?.question || "Pertanyaan Cerdas Cermat..."}
              </h2>

              {/* Options Grid A, B, C, D */}
              <div className="grid gap-3 sm:grid-cols-2">
                {game.questions?.[room.current_index || 0]?.options.map((optionText, optIdx) => {
                  const isCorrect = optIdx === game.questions?.[room.current_index || 0]?.correctAnswer;
                  const isSelected = selectedOption === optIdx;

                  let borderStyle = "border-border bg-card hover:border-primary hover:bg-primary/5";
                  if (isSelected) borderStyle = "border-primary bg-primary/10 font-bold";
                  if (isAnswerRevealed) {
                    if (isCorrect) borderStyle = "border-emerald-500 bg-emerald-50 text-emerald-900 font-extrabold dark:bg-emerald-950/40 dark:text-emerald-200";
                    else if (isSelected && !isCorrect) borderStyle = "border-red-500 bg-red-50 text-red-900 font-bold dark:bg-red-950/40 dark:text-red-200";
                  }

                  return (
                    <button
                      key={optIdx}
                      disabled={selectedOption !== null || isAnswerRevealed}
                      onClick={() => handleSelectOption(optIdx)}
                      className={`flex items-start gap-3 rounded-2xl border p-4 text-left text-sm transition-all duration-200 ${borderStyle}`}
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-secondary font-bold text-xs shrink-0">
                        {["A", "B", "C", "D"][optIdx]}
                      </span>
                      <span className="flex-1 mt-0.5">{optionText}</span>
                      {isAnswerRevealed && isCorrect && <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />}
                      {isAnswerRevealed && isSelected && !isCorrect && <XCircle className="h-5 w-5 text-red-500 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Reveal Result Banner */}
              {isAnswerRevealed && (
                <div className="rounded-2xl bg-indigo-50 p-4 text-center dark:bg-indigo-950/40 animate-fade-in">
                  <p className="text-sm font-bold text-indigo-700 dark:text-indigo-300">
                    {selectedOption === game.questions?.[room.current_index || 0]?.correctAnswer
                      ? "🎉 JAWABAN BENAR! (+Poin bertambah)"
                      : "❌ Jawaban belum tepat. Semangat di soal berikutnya!"}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ==================================================== */}
          {/* FINAL PODIUM & LEADERBOARD SHOWCASE (Status: finished)*/}
          {/* ==================================================== */}
          {roomCode && (room?.status === "finished" || (room?.status === "voting" && game.game_type === "prompt_vote")) && (
            <div className="rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-card animate-fade-in space-y-8">
              <div className="flex flex-col items-center text-center">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-extrabold text-amber-700">
                  <Trophy className="h-4 w-4" /> GRAND FINALE PODIUM
                </span>
                <h2 className="mt-3 text-3xl font-extrabold">Pemenang Juara 1, 2, 3</h2>
                <p className="text-xs text-muted-foreground mt-1">Klasemen hasil akhir realtime seluruh peserta.</p>
              </div>

              {/* Podium Showcase 1, 2, 3 */}
              <div className="flex justify-center items-end gap-2 sm:gap-4 pt-6 pb-2 w-full overflow-x-auto">
                {/* Juara 2 (Perak) */}
                {sortedLeaderboard[1] && (
                  <div className="flex flex-col items-center shrink-0">
                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-slate-300 text-slate-800 font-extrabold text-xs sm:text-sm shadow">
                      🥈
                    </div>
                    <p className="mt-2 text-[11px] sm:text-xs font-bold text-foreground max-w-[75px] sm:max-w-[90px] truncate">{sortedLeaderboard[1].user_name}</p>
                    <p className="text-[9px] sm:text-[10px] text-muted-foreground">{sortedLeaderboard[1].score || 0} pts</p>
                    <div className="mt-2 h-20 sm:h-24 w-16 sm:w-20 rounded-t-2xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-extrabold text-slate-600 text-sm sm:text-base">
                      #2
                    </div>
                  </div>
                )}

                {/* Juara 1 (Emas) */}
                {sortedLeaderboard[0] && (
                  <div className="flex flex-col items-center shrink-0 -mt-4 sm:-mt-6">
                    <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-amber-400 text-amber-950 font-extrabold text-base sm:text-xl shadow-lg ring-2 sm:ring-4 ring-amber-300">
                      👑 🥇
                    </div>
                    <p className="mt-2 text-xs sm:text-sm font-extrabold text-foreground max-w-[85px] sm:max-w-[110px] truncate">{sortedLeaderboard[0].user_name}</p>
                    <p className="text-[10px] sm:text-xs font-bold text-amber-600">{sortedLeaderboard[0].score || 0} pts</p>
                    <div className="mt-2 h-28 sm:h-36 w-20 sm:w-24 rounded-t-2xl bg-gradient-to-t from-amber-500 to-amber-400 flex items-center justify-center font-extrabold text-white text-lg sm:text-xl shadow-md">
                      #1
                    </div>
                  </div>
                )}

                {/* Juara 3 (Perunggu) */}
                {sortedLeaderboard[2] && (
                  <div className="flex flex-col items-center shrink-0">
                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-amber-700 text-white font-extrabold text-xs sm:text-sm shadow">
                      🥉
                    </div>
                    <p className="mt-2 text-[11px] sm:text-xs font-bold text-foreground max-w-[75px] sm:max-w-[90px] truncate">{sortedLeaderboard[2].user_name}</p>
                    <p className="text-[9px] sm:text-[10px] text-muted-foreground">{sortedLeaderboard[2].score || 0} pts</p>
                    <div className="mt-2 h-16 sm:h-20 w-16 sm:w-20 rounded-t-2xl bg-amber-800/20 flex items-center justify-center font-extrabold text-amber-800 text-sm sm:text-base">
                      #3
                    </div>
                  </div>
                )}
              </div>

              {/* Complete Leaderboard Table */}
              <div>
                <h3 className="text-sm font-bold text-foreground mb-3">Klasemen Seluruh Peserta</h3>
                <div className="divide-y divide-border rounded-2xl border border-border bg-card overflow-hidden">
                  {sortedLeaderboard.map((p, rankIdx) => (
                    <div key={p.id} className="flex items-center justify-between p-3 sm:p-3.5 text-xs">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <span className={`flex h-6 w-6 items-center justify-center rounded-full font-bold text-xs shrink-0 ${rankIdx === 0 ? "bg-amber-400 text-amber-950" : rankIdx === 1 ? "bg-slate-300 text-slate-800" : rankIdx === 2 ? "bg-amber-700 text-white" : "bg-secondary text-muted-foreground"}`}>
                          {rankIdx + 1}
                        </span>
                        <span className="font-bold text-foreground truncate">{p.user_name}</span>
                      </div>
                      <span className="font-extrabold text-primary shrink-0 ml-2">{p.score || 0} Poin</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
