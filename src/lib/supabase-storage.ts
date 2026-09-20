/**
 * Supabase Storage Upload Utility
 * --------------------------------------------------
 * Upload file gambar ke Supabase Storage bucket "game-artworks".
 * Tidak ada CORS issue, tidak ada private key di browser.
 *
 * Setup yang diperlukan di Supabase Dashboard:
 *   1. Buka Storage → Create bucket "game-artworks"
 *   2. Set bucket sebagai PUBLIC
 *   3. (Opsional) Set policy: allow anon INSERT ke bucket
 */

import { supabase } from "@/lib/supabase";

const BUCKET_NAME = "game-artworks";

/**
 * Upload file gambar ke Supabase Storage
 * @param file - File gambar yang akan diupload
 * @param roomCode - Kode room (untuk path organisasi)
 * @param userId - ID user yang upload
 * @returns Public URL gambar, atau null jika gagal
 */
export async function uploadToSupabaseStorage(
  file: File,
  roomCode: string,
  userId: string
): Promise<string | null> {
  try {
    // Buat nama file unik: roomCode/userId_timestamp.ext
    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `${roomCode}/${userId}_${Date.now()}.${ext}`;

    // Upload ke Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: true, // replace jika sudah ada
        contentType: file.type,
      });

    if (error) {
      console.error("Supabase Storage upload error:", error);
      return null;
    }

    // Dapatkan public URL
    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  } catch (err) {
    console.error("uploadToSupabaseStorage error:", err);
    return null;
  }
}
