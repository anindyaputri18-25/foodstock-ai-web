import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Role } from "@/types/domain";

export interface ClientSession {
  userId: string;
  nama: string;
  role: Role;
  instansi: string;
}

interface SessionState {
  session: ClientSession | null;
  setSession: (s: ClientSession | null) => void;
}

// Catatan: store ini hanya cermin untuk kebutuhan tampilan (nama & role di
// TopBar/Sidebar). Keputusan otorisasi yang sesungguhnya selalu dilakukan
// server-side oleh middleware.ts terhadap cookie httpOnly yang ditandatangani
// (lihat src/lib/session.ts), bukan oleh store ini.
export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      session: null,
      setSession: (session) => set({ session }),
    }),
    { name: "ketahananpangan-session-v2" },
  ),
);
