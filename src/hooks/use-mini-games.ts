import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { uploadToSupabaseStorage } from "@/lib/supabase-storage";

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

// ============================================================
// All Mini Games data is 100% managed by Supabase Database.
// No local dummy data or local cache.
// ============================================================

// Fetch all games from Supabase `mini_games` table
export async function fetchGamesFromSupabase(): Promise<MiniGame[]> {
  try {
    const { data, error } = await supabase
      .from("mini_games")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching mini_games from Supabase:", error);
      return [];
    }
    return (data as MiniGame[]) || [];
  } catch (err) {
    console.error("Supabase fetch error:", err);
    return [];
  }
}

// Asynchronous Save / Upsert Game to Supabase
export async function saveStoredGame(game: MiniGame): Promise<MiniGame[]> {
  try {
    const { error } = await supabase
      .from("mini_games")
      .upsert({
        id: game.id,
        title: game.title,
        game_type: game.game_type,
        course_id: game.course_id || null,
        division_slug: game.division_slug || null,
        description: game.description || null,
        prompt_instruction: game.prompt_instruction || null,
        questions: game.questions || [],
        created_at: game.created_at || new Date().toISOString(),
      });

    if (error) {
      console.error("Error upserting mini_game to Supabase:", error);
    }
  } catch (err) {
    console.error("Error saving game to Supabase:", err);
  }

  return await fetchGamesFromSupabase();
}

// Asynchronous Delete Game from Supabase
export async function deleteStoredGame(gameId: string): Promise<MiniGame[]> {
  try {
    const { error } = await supabase
      .from("mini_games")
      .delete()
      .eq("id", gameId);

    if (error) {
      console.error("Error deleting mini_game from Supabase:", error);
    }
  } catch (err) {
    console.error("Error deleting game from Supabase:", err);
  }

  return await fetchGamesFromSupabase();
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

// Create Room directly in Supabase
export async function createRoom(gameId: string, customGameData?: MiniGame): Promise<GameRoom | null> {
  const roomCode = generateRoomCode();
  const roomId = `room-${Date.now()}`;

  // If game_data is not passed, attempt to fetch from Supabase
  let gameData = customGameData;
  if (!gameData) {
    const { data } = await supabase.from("mini_games").select("*").eq("id", gameId).maybeSingle();
    if (data) gameData = data as MiniGame;
  }

  const newRoom: GameRoom = {
    id: roomId,
    room_code: roomCode,
    game_id: gameId,
    status: "waiting",
    current_index: 0,
    created_at: new Date().toISOString(),
    game_data: gameData,
  };

  // Clear existing participants and votes for this room code in Supabase
  await clearRoomParticipantsAndVotes(roomCode);

  const { error } = await supabase.from("game_rooms").insert({
    id: newRoom.id,
    room_code: roomCode,
    game_id: gameId,
    status: "waiting",
    current_index: 0,
    game_data: gameData || null,
    created_at: newRoom.created_at,
  });

  if (error) {
    console.error("Error creating game_room in Supabase:", error);
    return null;
  }

  return newRoom;
}

export async function clearRoomParticipantsAndVotes(roomCode: string): Promise<void> {
  const upper = roomCode.trim().toUpperCase();
  try {
    await Promise.all([
      supabase.from("game_participants").delete().eq("room_code", upper),
      supabase.from("game_votes").delete().eq("room_code", upper),
    ]);
  } catch (err) {
    console.error("Error clearing room data in Supabase:", err);
  }
}

// Get Room by Code from Supabase DB directly
export async function getRoomByCode(code: string): Promise<GameRoom | null> {
  const upper = code.trim().toUpperCase();
  try {
    const { data, error } = await supabase
      .from("game_rooms")
      .select("*")
      .eq("room_code", upper)
      .maybeSingle();

    if (!error && data) {
      return data as GameRoom;
    }
  } catch (err) {
    console.error("Error fetching room by code from Supabase:", err);
  }
  return null;
}

// Update Room Status in Supabase DB directly
export async function updateRoomStatus(code: string, status: RoomStatus, currentIndex?: number): Promise<GameRoom | null> {
  const upper = code.trim().toUpperCase();
  try {
    const updatePayload: any = { status };
    if (currentIndex !== undefined) {
      updatePayload.current_index = currentIndex;
    }

    const { data, error } = await supabase
      .from("game_rooms")
      .update(updatePayload)
      .eq("room_code", upper)
      .select()
      .maybeSingle();

    if (!error && data) {
      return data as GameRoom;
    }
    if (error) {
      console.error("Error updating room status in Supabase:", error);
    }
  } catch (err) {
    console.error("Error updating room status:", err);
  }
  return null;
}

// Participants Management via Supabase
export async function getRoomParticipants(roomCode: string): Promise<GameParticipant[]> {
  const upper = roomCode.trim().toUpperCase();
  try {
    const { data, error } = await supabase
      .from("game_participants")
      .select("*")
      .eq("room_code", upper)
      .order("score", { ascending: false });

    if (!error && data) {
      return data as GameParticipant[];
    }
  } catch (err) {
    console.error("Error fetching participants from Supabase:", err);
  }
  return [];
}

export async function joinRoomParticipant(participant: Omit<GameParticipant, "id">): Promise<GameParticipant | null> {
  const upperCode = participant.room_code.toUpperCase();
  const participantId = `part-${participant.user_id}-${upperCode}`;

  try {
    const { data, error } = await supabase.from("game_participants").upsert(
      {
        id: participantId,
        room_code: upperCode,
        user_id: participant.user_id,
        user_name: participant.user_name,
        score: participant.score || 0,
        image_url: participant.image_url || null,
        is_ready: participant.is_ready || false,
      },
      { onConflict: "room_code,user_id" }
    ).select().maybeSingle();

    if (!error && data) {
      return data as GameParticipant;
    }
    if (error) {
      console.error("Error joining participant in Supabase:", error);
    }
  } catch (err) {
    console.error("Error joining participant:", err);
  }
  return null;
}

// Upload file gambar ke Supabase Storage dan kembalikan public URL
export async function uploadArtworkFile(file: File, roomCode: string, userId: string): Promise<string | null> {
  return await uploadToSupabaseStorage(file, roomCode, userId);
}

export async function submitParticipantArtwork(roomCode: string, userId: string, imageUrl: string): Promise<void> {
  const upperCode = roomCode.toUpperCase();
  try {
    const { error } = await supabase
      .from("game_participants")
      .update({ image_url: imageUrl, is_ready: true })
      .match({ room_code: upperCode, user_id: userId });

    if (error) {
      console.error("Error submitting artwork to Supabase:", error);
    }
  } catch (err) {
    console.error("Error submitting artwork:", err);
  }
}

export async function addParticipantScore(roomCode: string, userId: string, points: number, currentScore: number): Promise<void> {
  const upperCode = roomCode.toUpperCase();
  const newScore = currentScore + points;
  try {
    const { error } = await supabase
      .from("game_participants")
      .update({ score: newScore })
      .match({ room_code: upperCode, user_id: userId });

    if (error) {
      console.error("Error updating score in Supabase:", error);
    }
  } catch (err) {
    console.error("Error updating score:", err);
  }
}

// Votes Management via Supabase
export async function getRoomVotes(roomCode: string): Promise<GameVote[]> {
  const upperCode = roomCode.trim().toUpperCase();
  try {
    const { data, error } = await supabase
      .from("game_votes")
      .select("*")
      .eq("room_code", upperCode);

    if (!error && data) {
      return data as GameVote[];
    }
  } catch (err) {
    console.error("Error fetching votes from Supabase:", err);
  }
  return [];
}

export async function castVote(vote: GameVote, targetCurrentScore: number = 0): Promise<void> {
  const upperCode = vote.room_code.toUpperCase();
  try {
    const { error } = await supabase.from("game_votes").upsert(
      {
        room_code: upperCode,
        target_user_id: vote.target_user_id,
        voter_user_id: vote.voter_user_id,
        reaction: vote.reaction,
      },
      { onConflict: "room_code,target_user_id,voter_user_id" }
    );

    if (error) {
      console.error("Error casting vote to Supabase:", error);
    }

    const pointsMap = {
      absolute_cinema: 5,
      bagus_sekali: 3,
      kurang: 1,
      jelek: 0,
    };
    const pts = pointsMap[vote.reaction] || 0;
    await addParticipantScore(upperCode, vote.target_user_id, pts, targetCurrentScore);
  } catch (err) {
    console.error("Error casting vote:", err);
  }
}

// React Hook for Realtime Supabase Room State
export function useGameRoom(roomCode: string | null) {
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [participants, setParticipants] = useState<GameParticipant[]>([]);
  const [votes, setVotes] = useState<GameVote[]>([]);

  useEffect(() => {
    if (!roomCode) return;
    const upper = roomCode.trim().toUpperCase();
    let isActive = true;

    // Fungsi fetch data dari Supabase (didefinisikan di dalam useEffect
    // agar tidak menjadi dependency yang tidak stabil)
    const fetchData = async () => {
      if (!isActive) return;
      try {
        const [roomRes, partRes, voteRes] = await Promise.all([
          supabase.from("game_rooms").select("*").eq("room_code", upper).maybeSingle(),
          supabase.from("game_participants").select("*").eq("room_code", upper).order("score", { ascending: false }),
          supabase.from("game_votes").select("*").eq("room_code", upper),
        ]);

        if (!isActive) return;

        if (roomRes.data) setRoom(roomRes.data as GameRoom);
        if (partRes.data) setParticipants(partRes.data as GameParticipant[]);
        if (voteRes.data) setVotes(voteRes.data as GameVote[]);
      } catch (err) {
        console.error("Supabase Realtime fetch error:", err);
      }
    };

    // Fetch awal saat join room
    fetchData();

    // Supabase Realtime Channel Subscription
    // Setiap perubahan di tabel (INSERT/UPDATE/DELETE) akan trigger fetchData()
    // sehingga semua device mendapatkan state terbaru secara bersamaan
    const channelName = `game_room_${upper}_${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "game_rooms", filter: `room_code=eq.${upper}` },
        () => { fetchData(); }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "game_participants", filter: `room_code=eq.${upper}` },
        () => { fetchData(); }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "game_votes", filter: `room_code=eq.${upper}` },
        () => { fetchData(); }
      )
      .subscribe((status) => {
        console.log(`[GameRoom] Realtime channel status: ${status}`);
        // Jika realtime berhasil terkoneksi, fetch ulang untuk pastikan data fresh
        if (status === "SUBSCRIBED") fetchData();
      });

    // Polling fallback setiap 2 detik (safety net jika realtime lambat/gagal)
    const interval = setInterval(fetchData, 2000);

    return () => {
      isActive = false;
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [roomCode]); // HANYA roomCode sebagai dependency — tidak ada fungsi di sini

  return { room, participants, votes };
}

