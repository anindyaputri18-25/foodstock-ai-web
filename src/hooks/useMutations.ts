"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "@/services/api";
import type {
  DistribusiEntry,
  Komoditas,
  KonsumsiEntry,
  ModelConfig,
  Rekomendasi,
  Role,
  StokEntry,
  Wilayah,
} from "@/types/domain";

function useInvalidate(keys: string[]) {
  const qc = useQueryClient();
  return () => keys.forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
}

export function useRunForecastMutation() {
  const invalidate = useInvalidate(["forecast-results", "rekomendasi", "notifikasi"]);
  return useMutation({
    mutationFn: (aktor: { nama: string; role: Role }) => api.runForecast(aktor),
    onSuccess: invalidate,
  });
}

export function useSubmitStokMutation() {
  const invalidate = useInvalidate(["stok-entries"]);
  return useMutation({
    mutationFn: (input: Omit<StokEntry, "id">) => api.submitStokEntry(input),
    onSuccess: invalidate,
  });
}


export function useImportHistoricalMutation() {
  const invalidate = useInvalidate(["stok-entries", "konsumsi-entries", "audit-log", "forecast-results"]);
  return useMutation({
    mutationFn: ({ rows, aktor }: { rows: Array<{ jenis: "stok" | "konsumsi"; id_wilayah: string; id_komoditas: string; jumlah: number; tanggal: string; sumber: "bps_bapanas" }>; aktor: string }) => api.importHistoricalRows(rows, aktor),
    onSuccess: invalidate,
  });
}

export function useSubmitKonsumsiMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<KonsumsiEntry, "id">) => api.submitKonsumsiEntry(input),
    onSuccess: () => qc.invalidateQueries(),
  });
}

export function useSubmitDistribusiMutation() {
  const invalidate = useInvalidate(["distribusi-entries"]);
  return useMutation({
    mutationFn: (input: Omit<DistribusiEntry, "id">) => api.submitDistribusiEntry(input),
    onSuccess: invalidate,
  });
}

export function useUpdateDistribusiStatusMutation() {
  const invalidate = useInvalidate(["distribusi-entries"]);
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: DistribusiEntry["status"] }) =>
      api.updateDistribusiStatus(id, status),
    onSuccess: invalidate,
  });
}

export function useUpdateRekomendasiMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Rekomendasi["status"] }) =>
      api.updateRekomendasiStatus(id, status),
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: ["rekomendasi"] });
      const previous = qc.getQueryData<Rekomendasi[]>(["rekomendasi"]);
      qc.setQueryData<Rekomendasi[]>(["rekomendasi"], (old) =>
        (old ?? []).map((r) => (r.id === id ? { ...r, status } : r)),
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(["rekomendasi"], ctx.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["rekomendasi"] }),
  });
}

export function useTindakLanjutNotifikasiMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.tindakLanjutNotifikasi(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["notifikasi"] });
      const previous = qc.getQueryData(["notifikasi"]);
      qc.setQueryData<any[]>(["notifikasi"], (old) =>
        (old ?? []).map((n) => (n.id === id ? { ...n, tindak_lanjut: "sudah_ditindaklanjuti" } : n)),
      );
      return { previous };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous) qc.setQueryData(["notifikasi"], ctx.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["notifikasi"] }),
  });
}

// ---- FR-08: Manajemen wilayah & komoditas ----
export function useWilayahMutations() {
  const invalidate = useInvalidate(["wilayah"]);
  const create = useMutation({ mutationFn: (input: Omit<Wilayah, "id">) => api.createWilayah(input), onSuccess: invalidate });
  const update = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Omit<Wilayah, "id">> }) => api.editWilayah(id, patch),
    onSuccess: invalidate,
  });
  const remove = useMutation({ mutationFn: (id: string) => api.removeWilayah(id), onSuccess: invalidate });
  return { create, update, remove };
}

export function useKomoditasMutations() {
  const invalidate = useInvalidate(["komoditas"]);
  const create = useMutation({ mutationFn: (input: Omit<Komoditas, "id">) => api.createKomoditas(input), onSuccess: invalidate });
  const update = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Omit<Komoditas, "id">> }) => api.editKomoditas(id, patch),
    onSuccess: invalidate,
  });
  const remove = useMutation({ mutationFn: (id: string) => api.removeKomoditas(id), onSuccess: invalidate });
  return { create, update, remove };
}

// ---- Admin: manajemen pengguna ----
export function usePenggunaMutations() {
  const invalidate = useInvalidate(["users", "audit-log"]);
  const verify = useMutation({
    mutationFn: ({ id, approve }: { id: string; approve: boolean }) => api.verifyUserAccount(id, approve),
    onSuccess: invalidate,
  });
  const changeRole = useMutation({
    mutationFn: ({ id, role }: { id: string; role: Role }) => api.changeUserRole(id, role),
    onSuccess: invalidate,
  });
  const toggleLock = useMutation({ mutationFn: (id: string) => api.toggleLockUserAccount(id), onSuccess: invalidate });
  const remove = useMutation({ mutationFn: (id: string) => api.deleteUserAccount(id), onSuccess: invalidate });
  return { verify, changeRole, toggleLock, remove };
}

export function useSaveModelConfigMutation() {
  const invalidate = useInvalidate(["model-config"]);
  return useMutation({ mutationFn: (patch: Partial<ModelConfig>) => api.saveModelConfig(patch), onSuccess: invalidate });
}
