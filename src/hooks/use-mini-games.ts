import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export type GameType = "prompt_vote" | "cerdas_cermat";

export type CerdasCermatQuestion = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // 0 for A, 1 for B, 2 for C, 3 for D
  timeLimit: number; // in seconds
};

export type MiniGame = {
  id: string;
  title: string;
  game_type: GameType;
  course_id?: string | null;
  division_slug?: string | null; // "front-end", "back-end", "mobile-dev", "ui-ux", "devops", or "all"
  description?: string;
  prompt_instruction?: string;
  questions?: CerdasCermatQuestion[];
  created_at?: string;
};

export type RoomStatus = "waiting" | "submission" | "voting" | "playing" | "finished";

export type GameRoom = {
  id: string;
  room_code: string;
  game_id: string;
  status: RoomStatus;
  current_index: number;
  created_at: string;
  game_data?: MiniGame;
};

export type GameParticipant = {
  id: string;
  room_code: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  score: number;
  image_url?: string;
  is_ready?: boolean;
};

export type GameVote = {
  id?: string;
  room_code: string;
  target_user_id: string;
  voter_user_id: string;
  reaction: "bagus_sekali" | "absolute_cinema" | "kurang" | "jelek";
};

// Initial Mock Seed Data for Fallback & Initialization
const MOCK_GAMES: MiniGame[] = [
  {
    id: "mg-prompt-01",
    title: "AI Prompting Pegunungan Showcase",
    game_type: "prompt_vote",
    course_id: "c-fe-001",
    division_slug: "front-end",
    description: "Buatlah gambar pemandangan pegunungan terbaik menggunakan AI image generator favoritmu!",
    prompt_instruction: "Buat gambar pegunungan megah di sore hari dengan efek pemandangan memukau menggunakan AI (Midjourney/DALL-E/Bing AI/Ideogram).",
    created_at: new Date().toISOString()
  },
  {
    id: "mg-quiz-01",
    title: "Cerdas Cermat Web Tech Battle",
    game_type: "cerdas_cermat",
    course_id: "c-fe-001",
    division_slug: "front-end",
    description: "Pertarungan pengetahuan cepat seputar HTML, CSS, JavaScript, dan React!",
    questions: [
      {
        id: "q1",
        question: "Manakah tag HTML yang digunakan untuk membuat judul utama halaman?",
        options: ["<h1>", "<heading>", "<head>", "<title>"],
        correctAnswer: 0,
        timeLimit: 15
      },
      {
        id: "q2",
        question: "Sifat CSS manakah yang digunakan untuk membuat elemen fleksibel di satu baris?",
        options: ["display: block", "display: flex", "position: absolute", "float: left"],
        correctAnswer: 1,
        timeLimit: 15
      },
      {
        id: "q3",
        question: "Hook React manakah yang digunakan untuk menyimpan state lokal pada komponen?",
        options: ["useEffect", "useMemo", "useState", "useContext"],
        correctAnswer: 2,
        timeLimit: 15
      },
      {
        id: "q4",
        question: "Apakah singkatan dari DOM dalam pengembangan web?",
        options: ["Data Object Model", "Document Object Model", "Digital Oriented Module", "Desktop Order Method"],
        correctAnswer: 1,
        timeLimit: 15
      },
      {
        id: "q5",
        question: "Manakah perintah git yang digunakan untuk mengunggah perubahan ke remote repository?",
        options: ["git commit", "git clone", "git push", "git pull"],
        correctAnswer: 2,
        timeLimit: 15
      }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "mg-quiz-mobile-01",
    title: "Cerdas Cermat Mobile Dev & React Native / Flutter",
    game_type: "cerdas_cermat",
    course_id: "c-mb-001",
    division_slug: "mobile-dev",
    description: "Pertarungan pengetahuan seputar React Native, Flutter, mobile architecture & cross-platform!",
    questions: [
      {
        id: "mq1",
        question: "Komponen utama React Native yang digunakan untuk membungkus tampilan UI adalah?",
        options: ["<View>", "<div>", "<Container>", "<Layout>"],
        correctAnswer: 0,
        timeLimit: 15
      },
      {
        id: "mq2",
        question: "Bahasa pemrograman utama yang digunakan dalam pengembangan aplikasi Flutter adalah?",
        options: ["Java", "Swift", "Dart", "TypeScript"],
        correctAnswer: 2,
        timeLimit: 15
      },
      {
        id: "mq3",
        question: "Perintah CLI untuk membuat build APK/bundle pada React Native (Expo) adalah?",
        options: ["npx expo build", "eas build", "react-native run-android", "npm run build-apk"],
        correctAnswer: 1,
        timeLimit: 15
      },
      {
        id: "mq4",
        question: "Widget utama di Flutter yang nilainya tidak pernah berubah setelah di-render adalah?",
        options: ["StatefulWidget", "StatelessWidget", "InheritedWidget", "FlexibleWidget"],
        correctAnswer: 1,
        timeLimit: 15
      }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "mg-prompt-mobile-01",
    title: "Mobile App UI/UX Mockup Challenge",
    game_type: "prompt_vote",
    course_id: "c-mb-001",
    division_slug: "mobile-dev",
    description: "Buatlah prompt AI terbaik untuk mendesain antarmuka aplikasi mobile modern (iOS/Android)!",
    prompt_instruction: "Hasilkan gambar desain antarmuka aplikasi mobile E-Commerce / Fintech yang futuristik dan elegan menggunakan AI.",
    created_at: new Date().toISOString()
  },
  {
    id: "mg-quiz-backend-01",
    title: "Back End & Database Battle",
    game_type: "cerdas_cermat",
    course_id: "c-be-001",
    division_slug: "back-end",
    description: "Uji pemahaman REST API, Node.js, PostgreSQL & SQL queries!",
    questions: [
      {
        id: "bq1",
        question: "HTTP method manakah yang digunakan untuk memperbarui sebagian data resource?",
        options: ["GET", "POST", "PUT", "PATCH"],
        correctAnswer: 3,
        timeLimit: 15
      },
      {
        id: "bq2",
        question: "Perintah SQL untuk mengambil data tanpa duplikasi adalah?",
        options: ["SELECT UNIQUE", "SELECT DISTINCT", "SELECT DIFFERENT", "SELECT FILTER"],
        correctAnswer: 1,
        timeLimit: 15
      }
    ],
    created_at: new Date().toISOString()
  }
];

// Helper LocalStorage Keys (Local Cache Fallback)
const STORAGE_GAMES_KEY = "nexora_mini_games_list";
const STORAGE_ROOMS_KEY = "nexora_game_rooms";
const STORAGE_PARTICIPANTS_KEY = "nexora_game_participants";
const STORAGE_VOTES_KEY = "nexora_game_votes";

// Synchronous Sync from Local Cache
export function getStoredGames(): MiniGame[] {
  try {
    const raw = localStorage.getItem(STORAGE_GAMES_KEY);
    let games: MiniGame[] = raw ? JSON.parse(raw) : [];

    const existingIds = new Set(games.map((g) => g.id));
    let updated = false;

    for (const mockGame of MOCK_GAMES) {
      if (!existingIds.has(mockGame.id)) {
        games.push(mockGame);
        updated = true;
      }
    }

    if (!raw || updated) {
      localStorage.setItem(STORAGE_GAMES_KEY, JSON.stringify(games));
    }

    return games;
  } catch {
    return MOCK_GAMES;
  }
}

// Asynchronous Fetch from Supabase Table `mini_games`
export async function fetchGamesFromSupabase(): Promise<MiniGame[]> {
  try {
    const { data, error } = await supabase.from("mini_games").select("*");
    if (!error && data && data.length > 0) {
      localStorage.setItem(STORAGE_GAMES_KEY, JSON.stringify(data));
      return data;
    }
  } catch (err) {
    console.warn("Supabase fetch mini_games fallback:", err);
  }
  return getStoredGames();
}

export function saveStoredGame(game: MiniGame): MiniGame[] {
  const games = getStoredGames();
  const index = games.findIndex((g) => g.id === game.id);
  let updated: MiniGame[];
  if (index >= 0) {
    updated = [...games];
    updated[index] = game;
  } else {
    updated = [game, ...games];
  }
  localStorage.setItem(STORAGE_GAMES_KEY, JSON.stringify(updated));

  // Sync to Supabase
  supabase.from("mini_games").upsert(game).then(({ error }) => {
    if (error) console.error("Error upserting mini_game to Supabase:", error);
  });

  return updated;
}

export function deleteStoredGame(gameId: string): MiniGame[] {
  const games = getStoredGames();
  const updated = games.filter((g) => g.id !== gameId);
  localStorage.setItem(STORAGE_GAMES_KEY, JSON.stringify(updated));

  // Sync to Supabase
  supabase.from("mini_games").delete().eq("id", gameId).then(({ error }) => {
    if (error) console.error("Error deleting mini_game from Supabase:", error);
  });

  return updated;
}

// Room Management Helper
export function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "NEX-";
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function createRoom(gameId: string): GameRoom {
  const games = getStoredGames();
  const game = games.find((g) => g.id === gameId) || MOCK_GAMES[0];
  const roomCode = generateRoomCode();
  const newRoom: GameRoom = {
    id: `room-${Date.now()}`,
    room_code: roomCode,
    game_id: gameId,
    status: "waiting",
    current_index: 0,
    created_at: new Date().toISOString(),
    game_data: game,
  };

  clearRoomParticipantsAndVotes(roomCode);

  const rooms = getStoredRooms();
  rooms[roomCode] = newRoom;
  localStorage.setItem(STORAGE_ROOMS_KEY, JSON.stringify(rooms));

  // Sync to Supabase
  supabase.from("game_rooms").insert({
    id: newRoom.id,
    room_code: roomCode,
    game_id: gameId,
    status: "waiting",
    current_index: 0,
    game_data: game,
    created_at: newRoom.created_at
  }).then(({ error }) => {
    if (error) console.error("Error creating game_room in Supabase:", error);
  });

  return newRoom;
}

export function clearRoomParticipantsAndVotes(roomCode: string): void {
  const upper = roomCode.trim().toUpperCase();
  try {
    const rawP = localStorage.getItem(STORAGE_PARTICIPANTS_KEY);
    if (rawP) {
      const allP: GameParticipant[] = JSON.parse(rawP);
      const filteredP = allP.filter((p) => p.room_code !== upper);
      localStorage.setItem(STORAGE_PARTICIPANTS_KEY, JSON.stringify(filteredP));
    }

    const rawV = localStorage.getItem(STORAGE_VOTES_KEY);
    if (rawV) {
      const allV: GameVote[] = JSON.parse(rawV);
      const filteredV = allV.filter((v) => v.room_code !== upper);
      localStorage.setItem(STORAGE_VOTES_KEY, JSON.stringify(filteredV));
    }

    // Sync deletion to Supabase
    supabase.from("game_participants").delete().eq("room_code", upper);
    supabase.from("game_votes").delete().eq("room_code", upper);
  } catch (err) {
    console.error("Error clearing room data:", err);
  }
}

export function getStoredRooms(): Record<string, GameRoom> {
  try {
    const raw = localStorage.getItem(STORAGE_ROOMS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getRoomByCode(code: string): GameRoom | null {
  const rooms = getStoredRooms();
  const upper = code.trim().toUpperCase();
  return rooms[upper] || null;
}

export function updateRoomStatus(code: string, status: RoomStatus, currentIndex?: number): GameRoom | null {
  const rooms = getStoredRooms();
  const upper = code.trim().toUpperCase();
  if (!rooms[upper]) {
    rooms[upper] = {
      id: `room-${Date.now()}`,
      room_code: upper,
      game_id: "mg-prompt-01",
      status: status,
      current_index: currentIndex || 0,
      created_at: new Date().toISOString(),
    };
  } else {
    rooms[upper].status = status;
    if (currentIndex !== undefined) {
      rooms[upper].current_index = currentIndex;
    }
  }

  localStorage.setItem(STORAGE_ROOMS_KEY, JSON.stringify(rooms));
  window.dispatchEvent(new CustomEvent("game_room_updated", { detail: { code: upper, room: rooms[upper] } }));

  // Sync to Supabase
  supabase.from("game_rooms").update({
    status,
    ...(currentIndex !== undefined ? { current_index: currentIndex } : {})
  }).eq("room_code", upper).then(({ error }) => {
    if (error) console.error("Error updating room status in Supabase:", error);
  });

  return rooms[upper];
}

// Participants Management
export function getRoomParticipants(roomCode: string): GameParticipant[] {
  try {
    const raw = localStorage.getItem(STORAGE_PARTICIPANTS_KEY);
    const all: GameParticipant[] = raw ? JSON.parse(raw) : [];
    return all.filter((p) => p.room_code === roomCode.toUpperCase());
  } catch {
    return [];
  }
}

export function joinRoomParticipant(participant: Omit<GameParticipant, "id">): GameParticipant {
  const upperCode = participant.room_code.toUpperCase();
  const raw = localStorage.getItem(STORAGE_PARTICIPANTS_KEY);
  const all: GameParticipant[] = raw ? JSON.parse(raw) : [];
  
  const existingIndex = all.findIndex(
    (p) => p.room_code === upperCode && p.user_id === participant.user_id
  );

  let updatedParticipant: GameParticipant;
  if (existingIndex >= 0) {
    all[existingIndex] = { ...all[existingIndex], ...participant };
    updatedParticipant = all[existingIndex];
  } else {
    updatedParticipant = {
      ...participant,
      id: `part-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      room_code: upperCode,
    };
    all.push(updatedParticipant);
  }

  localStorage.setItem(STORAGE_PARTICIPANTS_KEY, JSON.stringify(all));
  window.dispatchEvent(new CustomEvent("game_participants_updated", { detail: { roomCode: upperCode } }));

  // Sync to Supabase
  supabase.from("game_participants").upsert({
    id: updatedParticipant.id,
    room_code: upperCode,
    user_id: participant.user_id,
    user_name: participant.user_name,
    score: participant.score || 0,
    image_url: participant.image_url || null,
    is_ready: participant.is_ready || false
  }, { onConflict: 'room_code,user_id' }).then(({ error }) => {
    if (error) console.error("Error joining participant in Supabase:", error);
  });

  return updatedParticipant;
}

export function submitParticipantArtwork(roomCode: string, userId: string, imageUrl: string): void {
  const upperCode = roomCode.toUpperCase();
  const raw = localStorage.getItem(STORAGE_PARTICIPANTS_KEY);
  const all: GameParticipant[] = raw ? JSON.parse(raw) : [];
  const index = all.findIndex((p) => p.room_code === upperCode && p.user_id === userId);
  if (index >= 0) {
    all[index].image_url = imageUrl;
    all[index].is_ready = true;
    localStorage.setItem(STORAGE_PARTICIPANTS_KEY, JSON.stringify(all));
    window.dispatchEvent(new CustomEvent("game_participants_updated", { detail: { roomCode: upperCode } }));
  }

  // Sync to Supabase
  supabase.from("game_participants")
    .update({ image_url: imageUrl, is_ready: true })
    .match({ room_code: upperCode, user_id: userId })
    .then(({ error }) => {
      if (error) console.error("Error submitting artwork to Supabase:", error);
    });
}

export function addParticipantScore(roomCode: string, userId: string, points: number): void {
  const upperCode = roomCode.toUpperCase();
  const raw = localStorage.getItem(STORAGE_PARTICIPANTS_KEY);
  const all: GameParticipant[] = raw ? JSON.parse(raw) : [];
  const index = all.findIndex((p) => p.room_code === upperCode && p.user_id === userId);
  let newScore = points;
  if (index >= 0) {
    all[index].score = (all[index].score || 0) + points;
    newScore = all[index].score;
    localStorage.setItem(STORAGE_PARTICIPANTS_KEY, JSON.stringify(all));
    window.dispatchEvent(new CustomEvent("game_participants_updated", { detail: { roomCode: upperCode } }));
  }

  // Sync to Supabase
  supabase.from("game_participants")
    .update({ score: newScore })
    .match({ room_code: upperCode, user_id: userId })
    .then(({ error }) => {
      if (error) console.error("Error updating score in Supabase:", error);
    });
}

// Vote Storage
export function getRoomVotes(roomCode: string): GameVote[] {
  try {
    const raw = localStorage.getItem(STORAGE_VOTES_KEY);
    const all: GameVote[] = raw ? JSON.parse(raw) : [];
    return all.filter((v) => v.room_code === roomCode.toUpperCase());
  } catch {
    return [];
  }
}

export function castVote(vote: GameVote): void {
  const upperCode = vote.room_code.toUpperCase();
  const raw = localStorage.getItem(STORAGE_VOTES_KEY);
  const all: GameVote[] = raw ? JSON.parse(raw) : [];
  
  const existingIdx = all.findIndex(
    (v) => v.room_code === upperCode && v.target_user_id === vote.target_user_id && v.voter_user_id === vote.voter_user_id
  );

  if (existingIdx >= 0) {
    all[existingIdx] = { ...vote, room_code: upperCode };
  } else {
    all.push({ ...vote, room_code: upperCode });
  }

  localStorage.setItem(STORAGE_VOTES_KEY, JSON.stringify(all));

  const pointsMap = {
    absolute_cinema: 5,
    bagus_sekali: 3,
    kurang: 1,
    jelek: 0,
  };
  const pts = pointsMap[vote.reaction] || 0;
  addParticipantScore(upperCode, vote.target_user_id, pts);

  window.dispatchEvent(new CustomEvent("game_votes_updated", { detail: { roomCode: upperCode } }));

  // Sync to Supabase
  supabase.from("game_votes").upsert({
    room_code: upperCode,
    target_user_id: vote.target_user_id,
    voter_user_id: vote.voter_user_id,
    reaction: vote.reaction
  }, { onConflict: 'room_code,target_user_id,voter_user_id' }).then(({ error }) => {
    if (error) console.error("Error casting vote to Supabase:", error);
  });
}

// React Hook for Realtime Supabase & Local Room State
export function useGameRoom(roomCode: string | null) {
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [participants, setParticipants] = useState<GameParticipant[]>([]);
  const [votes, setVotes] = useState<GameVote[]>([]);

  const fetchRealtimeRoomData = useCallback(async () => {
    if (!roomCode) return;
    const upper = roomCode.trim().toUpperCase();

    // 1. Local Fallback
    const localR = getRoomByCode(upper);
    const localP = getRoomParticipants(upper);
    const localV = getRoomVotes(upper);
    
    setRoom(localR);
    setParticipants(localP);
    setVotes(localV);

    // 2. Fetch directly from Supabase
    try {
      const [roomRes, partRes, voteRes] = await Promise.all([
        supabase.from("game_rooms").select("*").eq("room_code", upper).maybeSingle(),
        supabase.from("game_participants").select("*").eq("room_code", upper),
        supabase.from("game_votes").select("*").eq("room_code", upper)
      ]);

      if (roomRes.data) {
        setRoom(roomRes.data);
      }
      if (partRes.data && partRes.data.length > 0) {
        setParticipants(partRes.data);
      }
      if (voteRes.data && voteRes.data.length > 0) {
        setVotes(voteRes.data);
      }
    } catch (err) {
      console.warn("Supabase Realtime fetch error (falling back to local):", err);
    }
  }, [roomCode]);

  useEffect(() => {
    if (!roomCode) return;
    const upper = roomCode.trim().toUpperCase();

    fetchRealtimeRoomData();

    // 1. Local window event listeners
    const handleRoomUpdate = (e: any) => {
      if (e.detail?.code === upper) fetchRealtimeRoomData();
    };
    const handleParticipantsUpdate = (e: any) => {
      if (e.detail?.roomCode?.toUpperCase() === upper) fetchRealtimeRoomData();
    };
    const handleVotesUpdate = (e: any) => {
      if (e.detail?.roomCode?.toUpperCase() === upper) fetchRealtimeRoomData();
    };

    window.addEventListener("game_room_updated", handleRoomUpdate);
    window.addEventListener("game_participants_updated", handleParticipantsUpdate);
    window.addEventListener("game_votes_updated", handleVotesUpdate);
    window.addEventListener("storage", fetchRealtimeRoomData);

    // 2. Supabase Realtime Channel Subscription
    const channel = supabase
      .channel(`game_room_${upper}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'game_rooms', filter: `room_code=eq.${upper}` }, () => fetchRealtimeRoomData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'game_participants', filter: `room_code=eq.${upper}` }, () => fetchRealtimeRoomData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'game_votes', filter: `room_code=eq.${upper}` }, () => fetchRealtimeRoomData())
      .subscribe();

    // 3. 1.5s Polling loop fallback across devices
    const interval = setInterval(fetchRealtimeRoomData, 1500);

    return () => {
      window.removeEventListener("game_room_updated", handleRoomUpdate);
      window.removeEventListener("game_participants_updated", handleParticipantsUpdate);
      window.removeEventListener("game_votes_updated", handleVotesUpdate);
      window.removeEventListener("storage", fetchRealtimeRoomData);
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [roomCode, fetchRealtimeRoomData]);

  return { room, participants, votes, refreshRoom: fetchRealtimeRoomData };
}
