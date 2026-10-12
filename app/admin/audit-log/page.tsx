"use client";

import { useState } from "react";
import { Download, ScrollText } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Button, Card, Input, LoadingRows } from "@/components/ui/Basics";
import { useAuditLogQuery } from "@/hooks/useQueries";
import { exportToCSV } from "@/lib/export";

export default function AuditLogPage() {
  const auditQuery = useAuditLogQuery();
  const [search, setSearch] = useState("");

  const logs = (auditQuery.data ?? []).filter(
    (l) =>
      l.aktor.toLowerCase().includes(search.toLowerCase()) ||
      l.aksi.toLowerCase().includes(search.toLowerCase()) ||
      l.target.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <TopBar title="Audit Log Aktivitas" subtitle="Jejak seluruh perubahan data master dan pengiriman notifikasi (NFR-10)" />
      <div className="space-y-5 p-5 md:p-8">
        <div className="agri-card p-4 flex flex-wrap items-center justify-between gap-3">
          <Input
            placeholder="Cari aktor, aksi, atau target…"
            className="max-w-xs bg-[#051410]/80 border-emerald-900/50 text-white placeholder:text-slate-500 rounded-xl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              exportToCSV(
                "audit-log-ketahanan-pangan",
                ["Waktu", "Aktor", "Role", "Aksi", "Target"],
                logs.map((l) => [new Date(l.waktu).toLocaleString("id-ID"), l.aktor, l.aktorRole, l.aksi, l.target]),
              )
            }
            className="border-emerald-800 text-emerald-300 hover:bg-emerald-950"
          >
            <Download className="h-4 w-4" /> Unduh CSV
          </Button>
        </div>

        <div className="agri-card overflow-hidden">
          <div className="overflow-x-auto">
            {auditQuery.isLoading ? (
              <div className="p-6"><LoadingRows rows={6} /></div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-emerald-900/30 text-xs uppercase text-slate-400 bg-emerald-950/20">
                    <th className="p-4">Waktu</th>
                    <th className="p-4">Aktor</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Aksi</th>
                    <th className="p-4">Target</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-900/20">
                  {logs.map((l) => (
                    <tr key={l.id} className="hover:bg-emerald-950/20 transition">
                      <td className="p-4 text-slate-400 text-xs">{new Date(l.waktu).toLocaleString("id-ID")}</td>
                      <td className="p-4 font-semibold text-slate-200">{l.aktor}</td>
                      <td className="p-4 capitalize text-slate-400">{l.aktorRole}</td>
                      <td className="p-4 text-slate-300">{l.aksi}</td>
                      <td className="p-4 text-slate-400">{l.target}</td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-sm text-slate-400">
                        <ScrollText className="mx-auto mb-2 h-8 w-8 text-emerald-600/50" />
                        Tidak ada log aktivitas yang cocok.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
}