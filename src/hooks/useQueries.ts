"use client";

import { useQuery } from "@tanstack/react-query";
import * as api from "@/services/api";

export function useWilayahQuery() {
  return useQuery({ queryKey: ["wilayah"], queryFn: api.fetchWilayah, staleTime: 1000 * 60 * 5 });
}
export function useKomoditasQuery() {
  return useQuery({ queryKey: ["komoditas"], queryFn: api.fetchKomoditas, staleTime: 1000 * 60 * 5 });
}
export function useForecastResultsQuery() {
  return useQuery({ queryKey: ["forecast-results"], queryFn: api.fetchForecastResults, staleTime: 1000 * 30 });
}
export function useForecastSeriesQuery(idWilayah: string, idKomoditas: string) {
  return useQuery({
    queryKey: ["forecast-series", idWilayah, idKomoditas],
    queryFn: () => api.fetchForecastSeries(idWilayah, idKomoditas),
    enabled: Boolean(idWilayah) && Boolean(idKomoditas),
    staleTime: 1000 * 30,
  });
}
export function useRekomendasiQuery() {
  return useQuery({ queryKey: ["rekomendasi"], queryFn: api.fetchRekomendasi, staleTime: 1000 * 30 });
}
export function useNotifikasiQuery() {
  return useQuery({
    queryKey: ["notifikasi"],
    queryFn: api.fetchNotifikasi,
    staleTime: 1000 * 20,
    refetchOnWindowFocus: true, // FR-05: peringatan dini harus selalu terbaru
  });
}
export function useStokEntriesQuery() {
  return useQuery({ queryKey: ["stok-entries"], queryFn: api.fetchStokEntries, staleTime: 1000 * 20 });
}
export function useDistribusiEntriesQuery() {
  return useQuery({ queryKey: ["distribusi-entries"], queryFn: api.fetchDistribusiEntries, staleTime: 1000 * 20 });
}
export function useUsersQuery() {
  return useQuery({ queryKey: ["users"], queryFn: api.fetchUsers, staleTime: 1000 * 20 });
}
export function useAuditLogQuery() {
  return useQuery({ queryKey: ["audit-log"], queryFn: api.fetchAuditLog, staleTime: 1000 * 20 });
}
export function useModelConfigQuery() {
  return useQuery({ queryKey: ["model-config"], queryFn: api.fetchModelConfig, staleTime: 1000 * 30 });
}
export function useWeatherQuery(lat: number, lon: number, label: string) {
  return useQuery({
    queryKey: ["weather", label],
    queryFn: () => api.fetchWeather(lat, lon),
    staleTime: 1000 * 60 * 15,
    retry: 1,
  });
}

export function useKonsumsiEntriesQuery() { return useQuery({ queryKey: ["konsumsi-entries"], queryFn: api.fetchKonsumsiEntries, staleTime: 1000 * 20 }); }
