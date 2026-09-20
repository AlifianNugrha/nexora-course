-- ============================================================
-- FIX SEBENARNYA: Set REPLICA IDENTITY FULL pada tabel game
-- 
-- Kenapa perlu ini?
-- Supabase Realtime pakai logical replication. Secara default,
-- PostgreSQL hanya merekam PRIMARY KEY di WAL log (REPLICA IDENTITY DEFAULT).
-- Akibatnya, filter `room_code=eq.XXX` di postgres_changes TIDAK BISA BEKERJA
-- karena kolom room_code tidak ada di WAL log perubahan.
-- Dengan FULL, semua kolom direkam → filter berjalan benar →
-- semua device mendapat broadcast perubahan yang sama.
-- ============================================================

ALTER TABLE public.game_rooms        REPLICA IDENTITY FULL;
ALTER TABLE public.game_participants  REPLICA IDENTITY FULL;
ALTER TABLE public.game_votes         REPLICA IDENTITY FULL;

-- Verifikasi hasilnya (harus menampilkan 'f' = FULL untuk ketiga tabel)
SELECT relname, relreplident
FROM pg_class
WHERE relname IN ('game_rooms', 'game_participants', 'game_votes')
  AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
-- relreplident: 'd' = default (hanya PK), 'f' = FULL (semua kolom) ✅
