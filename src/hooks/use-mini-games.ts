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

// Initial Mock Seed Data for Fallback
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

// Helper LocalStorage Keys
const STORAGE_GAMES_KEY = "nexora_mini_games_list";
const STORAGE_ROOMS_KEY = "nexora_game_rooms";
const STORAGE_PARTICIPANTS_KEY = "nexora_game_participants";
const STORAGE_VOTES_KEY = "nexora_game_votes";

export function getStoredGames(): MiniGame[] {
  try {
    const raw = localStorage.getItem(STORAGE_GAMES_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_GAMES_KEY, JSON.stringify(MOCK_GAMES));
      return MOCK_GAMES;
    }
    return JSON.parse(raw);
  } catch {
    return MOCK_GAMES;
  }
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
  return updated;
}

export function deleteStoredGame(gameId: string): MiniGame[] {
  const games = getStoredGames();
  const updated = games.filter((g) => g.id !== gameId);
  localStorage.setItem(STORAGE_GAMES_KEY, JSON.stringify(updated));
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

  // Reset participants & votes for clean new room
  clearRoomParticipantsAndVotes(roomCode);

  const rooms = getStoredRooms();
  rooms[roomCode] = newRoom;
  localStorage.setItem(STORAGE_ROOMS_KEY, JSON.stringify(rooms));
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
  if (!rooms[upper]) return null;

  rooms[upper].status = status;
  if (currentIndex !== undefined) {
    rooms[upper].current_index = currentIndex;
  }
  localStorage.setItem(STORAGE_ROOMS_KEY, JSON.stringify(rooms));
  // Notify custom window event for real-time sync across local tabs
  window.dispatchEvent(new CustomEvent("game_room_updated", { detail: { code: upper, room: rooms[upper] } }));
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
  const raw = localStorage.getItem(STORAGE_PARTICIPANTS_KEY);
  const all: GameParticipant[] = raw ? JSON.parse(raw) : [];
  
  const existingIndex = all.findIndex(
    (p) => p.room_code === participant.room_code.toUpperCase() && p.user_id === participant.user_id
  );

  let updatedParticipant: GameParticipant;
  if (existingIndex >= 0) {
    all[existingIndex] = { ...all[existingIndex], ...participant };
    updatedParticipant = all[existingIndex];
  } else {
    updatedParticipant = {
      ...participant,
      id: `part-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      room_code: participant.room_code.toUpperCase(),
    };
    all.push(updatedParticipant);
  }

  localStorage.setItem(STORAGE_PARTICIPANTS_KEY, JSON.stringify(all));
  window.dispatchEvent(new CustomEvent("game_participants_updated", { detail: { roomCode: participant.room_code } }));
  return updatedParticipant;
}

export function submitParticipantArtwork(roomCode: string, userId: string, imageUrl: string): void {
  const raw = localStorage.getItem(STORAGE_PARTICIPANTS_KEY);
  const all: GameParticipant[] = raw ? JSON.parse(raw) : [];
  const index = all.findIndex((p) => p.room_code === roomCode.toUpperCase() && p.user_id === userId);
  if (index >= 0) {
    all[index].image_url = imageUrl;
    all[index].is_ready = true;
    localStorage.setItem(STORAGE_PARTICIPANTS_KEY, JSON.stringify(all));
    window.dispatchEvent(new CustomEvent("game_participants_updated", { detail: { roomCode } }));
  }
}

export function addParticipantScore(roomCode: string, userId: string, points: number): void {
  const raw = localStorage.getItem(STORAGE_PARTICIPANTS_KEY);
  const all: GameParticipant[] = raw ? JSON.parse(raw) : [];
  const index = all.findIndex((p) => p.room_code === roomCode.toUpperCase() && p.user_id === userId);
  if (index >= 0) {
    all[index].score = (all[index].score || 0) + points;
    localStorage.setItem(STORAGE_PARTICIPANTS_KEY, JSON.stringify(all));
    window.dispatchEvent(new CustomEvent("game_participants_updated", { detail: { roomCode } }));
  }
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
  const raw = localStorage.getItem(STORAGE_VOTES_KEY);
  const all: GameVote[] = raw ? JSON.parse(raw) : [];
  
  // Replace if existing voter voted on target
  const existingIdx = all.findIndex(
    (v) => v.room_code === vote.room_code && v.target_user_id === vote.target_user_id && v.voter_user_id === vote.voter_user_id
  );

  if (existingIdx >= 0) {
    all[existingIdx] = vote;
  } else {
    all.push(vote);
  }

  localStorage.setItem(STORAGE_VOTES_KEY, JSON.stringify(all));

  // Points mapping for target user
  const pointsMap = {
    absolute_cinema: 5,
    bagus_sekali: 3,
    kurang: 1,
    jelek: 0,
  };
  const pts = pointsMap[vote.reaction] || 0;
  addParticipantScore(vote.room_code, vote.target_user_id, pts);

  window.dispatchEvent(new CustomEvent("game_votes_updated", { detail: { roomCode: vote.room_code } }));
}

// React Hook for Realtime Room State
export function useGameRoom(roomCode: string | null) {
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [participants, setParticipants] = useState<GameParticipant[]>([]);
  const [votes, setVotes] = useState<GameVote[]>([]);

  const refreshRoom = useCallback(() => {
    if (!roomCode) return;
    const r = getRoomByCode(roomCode);
    const p = getRoomParticipants(roomCode);
    const v = getRoomVotes(roomCode);
    setRoom(r);
    setParticipants(p);
    setVotes(v);
  }, [roomCode]);

  useEffect(() => {
    refreshRoom();

    const handleRoomUpdate = (e: any) => {
      if (e.detail?.code === roomCode?.toUpperCase()) {
        refreshRoom();
      }
    };

    const handleParticipantsUpdate = (e: any) => {
      if (e.detail?.roomCode?.toUpperCase() === roomCode?.toUpperCase()) {
        refreshRoom();
      }
    };

    const handleVotesUpdate = (e: any) => {
      if (e.detail?.roomCode?.toUpperCase() === roomCode?.toUpperCase()) {
        refreshRoom();
      }
    };

    window.addEventListener("game_room_updated", handleRoomUpdate);
    window.addEventListener("game_participants_updated", handleParticipantsUpdate);
    window.addEventListener("game_votes_updated", handleVotesUpdate);
    window.addEventListener("storage", refreshRoom);

    // Broadcast Channel / Polling fallback for local tab sync
    const interval = setInterval(refreshRoom, 1000);

    return () => {
      window.removeEventListener("game_room_updated", handleRoomUpdate);
      window.removeEventListener("game_participants_updated", handleParticipantsUpdate);
      window.removeEventListener("game_votes_updated", handleVotesUpdate);
      window.removeEventListener("storage", refreshRoom);
      clearInterval(interval);
    };
  }, [roomCode, refreshRoom]);

  return { room, participants, votes, refreshRoom };
}
