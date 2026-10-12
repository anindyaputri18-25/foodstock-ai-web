"use client";

import { useEffect, useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useDataStore } from "@/store/useDataStore";

export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: 1, refetchOnWindowFocus: false },
        },
      }),
  );

  // Inisialisasi data master + akun demo pada kunjungan pertama browser
  // (localStorage kosong). Lihat src/store/useDataStore.ts#seedIfEmpty.
  useEffect(() => {
    useDataStore.getState().seedIfEmpty();
  }, []);

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
