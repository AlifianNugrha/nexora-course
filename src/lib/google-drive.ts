/**
 * Google Drive Upload Utility (Service Account)
 * --------------------------------------------------
 * Credentials disimpan di .env, tidak pernah tampil ke pengguna.
 * Menggunakan Web Crypto API untuk sign JWT (100% browser-safe).
 *
 * ENV yang dibutuhkan:
 *   VITE_GOOGLE_SA_EMAIL        = service-account@project.iam.gserviceaccount.com
 *   VITE_GOOGLE_SA_PRIVATE_KEY  = -----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
 *   VITE_GOOGLE_DRIVE_FOLDER_ID = 1AbcXyz...  (ID folder di Google Drive)
 */

const SA_EMAIL = import.meta.env.VITE_GOOGLE_SA_EMAIL as string;
const SA_PRIVATE_KEY = import.meta.env.VITE_GOOGLE_SA_PRIVATE_KEY as string;
const DRIVE_FOLDER_ID = import.meta.env.VITE_GOOGLE_DRIVE_FOLDER_ID as string;

// -------------------------------------------------------
// Helper: base64url encode ArrayBuffer
// -------------------------------------------------------
function arrayBufferToBase64url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let str = "";
  for (const b of bytes) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

// -------------------------------------------------------
// Helper: Parse PEM private key ke ArrayBuffer (PKCS#8)
// -------------------------------------------------------
function pemToArrayBuffer(pem: string): ArrayBuffer {
  const cleaned = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\\n/g, "") // handle literal \n dari .env
    .replace(/\n/g, "")
    .replace(/\r/g, "")
    .replace(/\s/g, "");

  const binary = atob(cleaned);
  const buf = new ArrayBuffer(binary.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < binary.length; i++) {
    view[i] = binary.charCodeAt(i);
  }
  return buf;
}

// -------------------------------------------------------
// Buat JWT dan tukar dengan Google Access Token
// -------------------------------------------------------
async function getGoogleAccessToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  const jwtHeader = { alg: "RS256", typ: "JWT" };
  const jwtPayload = {
    iss: SA_EMAIL,
    scope: "https://www.googleapis.com/auth/drive.file",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  const headerB64 = arrayBufferToBase64url(
    new TextEncoder().encode(JSON.stringify(jwtHeader)).buffer as ArrayBuffer
  );
  const payloadB64 = arrayBufferToBase64url(
    new TextEncoder().encode(JSON.stringify(jwtPayload)).buffer as ArrayBuffer
  );
  const signingInput = `${headerB64}.${payloadB64}`;

  // Import private key pakai Web Crypto API (aman di browser)
  const keyData = pemToArrayBuffer(SA_PRIVATE_KEY);
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    keyData,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  // Sign JWT
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(signingInput)
  );

  const jwt = `${signingInput}.${arrayBufferToBase64url(signature)}`;

  // Tukar JWT dengan Access Token
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  const tokenData = await tokenRes.json();

  if (!tokenData.access_token) {
    throw new Error("Gagal mendapat Google access token: " + JSON.stringify(tokenData));
  }

  return tokenData.access_token as string;
}

// -------------------------------------------------------
// Upload file ke Google Drive folder & kembalikan URL publik
// -------------------------------------------------------
export async function uploadToGoogleDrive(file: File): Promise<string | null> {
  try {
    if (!SA_EMAIL || !SA_PRIVATE_KEY || !DRIVE_FOLDER_ID) {
      console.error(
        "Google Drive env belum lengkap. Set VITE_GOOGLE_SA_EMAIL, VITE_GOOGLE_SA_PRIVATE_KEY, VITE_GOOGLE_DRIVE_FOLDER_ID di .env"
      );
      return null;
    }

    // 1. Dapatkan access token dari service account
    const accessToken = await getGoogleAccessToken();

    // 2. Upload file dengan multipart (metadata + file)
    const metadata = {
      name: `${Date.now()}_${file.name}`,
      parents: [DRIVE_FOLDER_ID],
    };

    const formData = new FormData();
    formData.append(
      "metadata",
      new Blob([JSON.stringify(metadata)], { type: "application/json" })
    );
    formData.append("file", file);

    const uploadRes = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData,
      }
    );

    if (!uploadRes.ok) {
      const err = await uploadRes.json();
      console.error("Google Drive upload error:", err);
      return null;
    }

    const fileData = await uploadRes.json();
    const fileId = fileData.id as string;

    // 3. Set permission: anyone can view (tanpa ini gambar tidak bisa ditampilkan)
    await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}/permissions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: "reader", type: "anyone" }),
      }
    );

    // 4. Kembalikan URL publik yang bisa di-embed di <img>
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  } catch (err) {
    console.error("uploadToGoogleDrive error:", err);
    return null;
  }
}
