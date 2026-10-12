"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useDataStore } from "@/store/useDataStore";
import { useSessionStore } from "@/store/useSessionStore";
import type { LoginFormData, RegisterFormData } from "@/types/domain";

const ROLE_HOME: Record<string, string> = {
  admin: "/admin",
  dinas: "/dinas",
  bulog: "/bulog",
  distributor: "/distributor",
};

export function useLoginMutation() {
  const router = useRouter();
  const setSession = useSessionStore((s) => s.setSession);

  return useMutation({
    mutationFn: async (input: LoginFormData) => {
      const state = useDataStore.getState();
      const user = state.users.find((u) => u.email.toLowerCase() === input.email.toLowerCase());

      if (!user) throw new Error("Email tidak terdaftar.");
      if (user.status === "pending") throw new Error("Akun Anda masih menunggu verifikasi Administrator.");
      if (user.status === "ditolak") throw new Error("Registrasi akun Anda ditolak. Hubungi Administrator.");
      if (user.status === "terkunci") throw new Error("Akun terkunci karena 5x percobaan gagal. Hubungi Administrator.");
      if (user.password !== input.password) {
        state.recordLoginAttempt(user.email, false);
        throw new Error("Password salah.");
      }

      state.recordLoginAttempt(user.email, true);
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, nama: user.nama, role: user.role, instansi: user.instansi }),
      });
      if (!res.ok) throw new Error("Gagal membuat sesi. Coba lagi.");

      setSession({ userId: user.id, nama: user.nama, role: user.role, instansi: user.instansi });
      state.addAuditLog(user.nama, user.role, "Login ke sistem", user.email);
      return user;
    },
    onSuccess: (user) => {
      router.push(ROLE_HOME[user.role] ?? "/");
    },
  });
}

export function useRegisterMutation() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (input: RegisterFormData) => {
      const state = useDataStore.getState();
      const exists = state.users.some((u) => u.email.toLowerCase() === input.email.toLowerCase());
      if (exists) throw new Error("Email sudah terdaftar.");

      const user = state.registerUser({
        nama: input.nama,
        email: input.email,
        password: input.password,
        role: input.role,
        instansi: input.instansi,
      });
      return user;
    },
    onSuccess: () => {
      router.push("/login?registered=1");
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const setSession = useSessionStore((s) => s.setSession);

  return async () => {
    await fetch("/api/auth/session", { method: "DELETE" });
    setSession(null);
    router.push("/login");
  };
}
