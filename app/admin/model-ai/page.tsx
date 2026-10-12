"use client";

import { useState, type FormEvent } from "react";
import { Cpu, RefreshCcw, Save } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Badge, Button, Card, FormField, Input, LoadingRows } from "@/components/ui/Basics";
import { useForecastResultsQuery, useModelConfigQuery } from "@/hooks/useQueries";
import { useRunForecastMutation, useSaveModelConfigMutation } from "@/hooks/useMutations";
import { useSessionStore } from "@/store/useSessionStore";
import { useUIStore } from "@/store/useUIStore";

export default function ModelAiPage() {
  const configQuery = useModelConfigQuery();
  const forecastQuery = useForecastResultsQuery();
  const saveConfig = useSaveModelConfigMutation();
  const runForecast = useRunForecastMutation();
  const session = useSessionStore((s) => s.session);
  const showToast = useUIStore((s) => s.showToast);

  const [form, setForm] = useState({ threshold_shortage_persen: 15, threshold_surplus_persen: 30, horizon_hari: 30 });
  const [initialized, setInitialized] = useState(false);

  if (configQuery.data && !initialized) {
    setForm({
      threshold_shortage_persen: configQuery.data.threshold_shortage_persen,
      threshold_surplus_persen: configQuery.data.threshold_surplus_persen,
      horizon_hari: configQuery.data.horizon_hari,
    });
    setInitialized(true);
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    saveConfig.mutate(form, { onSuccess: () => showToast("Parameter model AI disimpan.") });
  };

  const results = forecastQuery.data ?? [];
  const rataMape = results.length > 0 ? results.reduce((a, r) => a + r.mape, 0) / results.length : configQuery.data?.mape_current ?? 0;

  return (
    <>
      <TopBar title="Pengaturan Model AI & Parameter Sistem" subtitle="Konfigurasi ambang batas Early Warning dan monitoring akurasi model forecasting" />
      <div className="grid gap-5 p-5 md:p-8 lg:grid-cols-[1fr_320px]">
        <Card className="agri-card p-6 border border-emerald-900/40 bg-[#081c16]/80 backdrop-blur-xl">
          <h2 className="mb-4 flex items-center gap-1.5 font-bold text-white">
            <Cpu className="h-4.5 w-4.5 text-emerald-400" /> Parameter Deteksi Early Warning
          </h2>
          {configQuery.isLoading ? (
            <LoadingRows />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField
                label="Threshold Shortage (%)"
                htmlFor="th-shortage"
                hint="Persentase selisih ketersediaan di bawah kebutuhan yang dianggap potensi shortage."
              >
                <Input
                  id="th-shortage"
                  type="number"
                  min={1}
                  max={100}
                  value={form.threshold_shortage_persen}
                  onChange={(e) => setForm({ ...form, threshold_shortage_persen: Number(e.target.value) })}
                  className="bg-[#051410] border-emerald-900/50 text-white"
                />
              </FormField>
              <FormField
                label="Threshold Surplus (%)"
                htmlFor="th-surplus"
                hint="Persentase selisih ketersediaan di atas kebutuhan yang dianggap potensi surplus."
              >
                <Input
                  id="th-surplus"
                  type="number"
                  min={1}
                  max={100}
                  value={form.threshold_surplus_persen}
                  onChange={(e) => setForm({ ...form, threshold_surplus_persen: Number(e.target.value) })}
                  className="bg-[#051410] border-emerald-900/50 text-white"
                />
              </FormField>
              <FormField label="Horizon Proyeksi (hari)" htmlFor="th-horizon" hint="Maksimal 30 hari sesuai kebutuhan FR-05.">
                <Input
                  id="th-horizon"
                  type="number"
                  min={1}
                  max={90}
                  value={form.horizon_hari}
                  onChange={(e) => setForm({ ...form, horizon_hari: Number(e.target.value) })}
                  className="bg-[#051410] border-emerald-900/50 text-white"
                />
              </FormField>
              <Button type="submit" loading={saveConfig.isPending} className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl">
                <Save className="h-4 w-4" /> Simpan Parameter
              </Button>
            </form>
          )}
        </Card>

        <div className="space-y-5">
          <Card className="agri-card p-6 border border-emerald-900/40 bg-[#081c16]/80 backdrop-blur-xl">
            <p className="text-xs text-slate-400">Status Model</p>
            <Badge status="aman" className="mt-1">
              {configQuery.data?.status_model === "melatih_ulang" ? "Melatih Ulang" : "Aktif"}
            </Badge>
            <p className="mt-4 text-xs text-slate-400">Akurasi Model (rata-rata MAPE)</p>
            <p className="text-2xl font-extrabold text-white">{rataMape.toFixed(1)}%</p>
            <p className="mt-4 text-xs text-slate-400">Terakhir Dilatih</p>
            <p className="text-sm font-semibold text-slate-300">
              {configQuery.data ? new Date(configQuery.data.last_trained).toLocaleString("id-ID") : "-"}
            </p>
            <Button
              variant="outline"
              className="mt-4 w-full border-emerald-800 text-emerald-300 hover:bg-emerald-950"
              loading={runForecast.isPending}
              onClick={() =>
                runForecast.mutate(
                  { nama: session?.nama ?? "Administrator", role: "admin" },
                  { onSuccess: () => showToast("Model forecasting dijalankan ulang untuk seluruh kombinasi.") },
                )
              }
            >
              <RefreshCcw className="h-4 w-4" /> Jalankan Ulang Model
            </Button>
          </Card>
          <Card padding="sm" className="agri-card text-xs text-slate-400 border border-emerald-900/40 bg-[#081c16]/80 backdrop-blur-xl">
            Model forecasting adalah simulasi deterministik (bukan model machine learning yang dilatih dari data historis riil). Parameter di atas mengendalikan klasifikasi status Aman/Shortage/Surplus pada seluruh dashboard.
          </Card>
        </div>
      </div>
    </>
  );
}