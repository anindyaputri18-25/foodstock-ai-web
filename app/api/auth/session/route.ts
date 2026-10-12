import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, signSession } from "@/lib/session";
import { RoleSchema } from "@/types/domain";
import { z } from "zod";

// Catatan arsitektur: karena proyek ini adalah prototipe front-end tanpa
// basis data server sungguhan (seluruh data pengguna disimpan client-side
// pada useDataStore/localStorage, lihat src/store/useDataStore.ts),
// validasi email/password dilakukan di Client Component (LoginForm) terhadap
// data tersebut. Route Handler ini bertanggung jawab MURNI menerbitkan
// cookie sesi httpOnly yang ditandatangani di server, sehingga middleware.ts
// dapat memverifikasi & melindungi rute /admin, /dinas, /bulog, /distributor
// tanpa bergantung pada document.cookie sisi klien.

const SessionRequestSchema = z.object({
  userId: z.string(),
  nama: z.string(),
  role: RoleSchema,
  instansi: z.string(),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = SessionRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Payload sesi tidak valid." }, { status: 400 });
  }

  const token = await signSession({ ...parsed.data, iat: Date.now() });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 jam
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE_NAME, "", { path: "/", maxAge: 0 });
  return res;
}
