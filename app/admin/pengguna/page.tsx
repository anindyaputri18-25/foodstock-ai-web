"use client";

import { useState } from "react";
import { Check, Lock, ShieldX, Trash2, Unlock, X } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Badge, Card, LoadingRows, Select } from "@/components/ui/Basics";
import { Modal } from "@/components/ui/Modal";
import { useUsersQuery } from "@/hooks/useQueries";
import { usePenggunaMutations } from "@/hooks/useMutations";
import { useUIStore } from "@/store/useUIStore";
import { ROLE_LABEL, type Role, type User } from "@/types/domain";

const ROLE_FILTER_OPTIONS: (Role | "semua")[] = ["semua", "admin", "dinas", "bulog", "distributor"];

export default function KelolaPenggunaPage() {
  const usersQuery = useUsersQuery();
  const { verify, changeRole, toggleLock, remove } = usePenggunaMutations();
  const showToast = useUIStore((s) => s.showToast);
  const [roleFilter, setRoleFilter] = useState<Role | "semua">("semua");
  const [toDelete, setToDelete] = useState<User | null>(null);

  const users = (usersQuery.data ?? []).filter((u) => roleFilter === "semua" || u.role === roleFilter);

  return (
    <>
      <TopBar title="Kelola Manajemen Pengguna" subtitle="Verifikasi registrasi, alokasi role, dan hak akses pengguna" />
      <div className="space-y-4 p-5 md:p-8">
        <Card padding="sm" className="agri-card border border-emerald-900/40 bg-[#081c16]/80 backdrop-blur-xl flex items-center gap-3 p-4">
          <label htmlFor="filter-role" className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Filter Role
          </label>
          <Select id="filter-role" className="w-auto bg-[#051410] border-emerald-900/50 text-white text-xs" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as Role | "semua")}>
            {ROLE_FILTER_OPTIONS.map((r) => (
              <option key={r} value={r} className="bg-[#061a14] text-white">
                {r === "semua" ? "Semua Role" : ROLE_LABEL[r]}
              </option>
            ))}
          </Select>
        </Card>

        <Card padding="none" className="agri-card border border-emerald-900/40 bg-[#081c16]/80 backdrop-blur-xl overflow-hidden">
          <div className="overflow-x-auto">
            {usersQuery.isLoading ? (
              <div className="p-5">
                <LoadingRows rows={5} />
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-emerald-900/30 text-xs uppercase text-slate-400 bg-emerald-950/20">
                    <th className="p-4">Nama</th>
                    <th className="p-4">Email / Instansi</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-900/20">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-emerald-950/20 transition">
                      <td className="p-4 font-semibold text-slate-200">{u.nama}</td>
                      <td className="p-4 text-slate-300">
                        {u.email}
                        <br />
                        <span className="text-xs text-slate-400">{u.instansi}</span>
                      </td>
                      <td className="p-4">
                        <Select
                          className="w-auto py-1 text-xs bg-[#051410] border-emerald-900/50 text-white"
                          value={u.role}
                          onChange={(e) => changeRole.mutate({ id: u.id, role: e.target.value as Role })}
                        >
                          {(["admin", "dinas", "bulog", "distributor"] as Role[]).map((r) => (
                            <option key={r} value={r} className="bg-[#061a14] text-white">
                              {ROLE_LABEL[r]}
                            </option>
                          ))}
                        </Select>
                      </td>
                      <td className="p-4">
                        <Badge status={u.status}>{u.status}</Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-2">
                          {u.status === "pending" && (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  verify.mutate({ id: u.id, approve: true });
                                  showToast(`Akun ${u.nama} diverifikasi.`);
                                }}
                                className="rounded-xl bg-emerald-950/60 p-2 text-emerald-400 hover:bg-emerald-900 border border-emerald-900/50 transition"
                                title="Verifikasi & aktifkan"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  verify.mutate({ id: u.id, approve: false });
                                  showToast(`Registrasi ${u.nama} ditolak.`);
                                }}
                                className="rounded-xl bg-rose-950/40 p-2 text-rose-400 hover:bg-rose-900/50 border border-rose-900/50 transition"
                                title="Tolak registrasi"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          {(u.status === "aktif" || u.status === "terkunci") && (
                            <button
                              type="button"
                              onClick={() => toggleLock.mutate(u.id)}
                              className="rounded-xl bg-slate-800/80 p-2 text-slate-300 hover:bg-slate-700 border border-slate-700 transition"
                              title={u.status === "terkunci" ? "Buka kunci akun" : "Kunci akun"}
                            >
                              {u.status === "terkunci" ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setToDelete(u)}
                            className="rounded-xl bg-rose-950/40 p-2 text-rose-400 hover:bg-rose-900/50 border border-rose-900/50 transition"
                            title="Hapus akun"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-sm text-slate-400">
                        Tidak ada pengguna untuk filter ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>

      <Modal open={Boolean(toDelete)} onClose={() => setToDelete(null)} title="Hapus Akun Pengguna">
        <div className="flex items-start gap-3">
          <ShieldX className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
          <p className="text-sm text-slate-300">
            Yakin ingin menghapus akun <strong className="text-white">{toDelete?.nama}</strong> ({toDelete?.email})? Tindakan ini tidak dapat dibatalkan.
          </p>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={() => setToDelete(null)} className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-400 hover:bg-emerald-950">
            Batal
          </button>
          <button
            type="button"
            onClick={() => {
              if (toDelete) {
                remove.mutate(toDelete.id);
                showToast(`Akun ${toDelete.nama} dihapus.`);
              }
              setToDelete(null);
            }}
            className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-500 shadow-md"
          >
            Ya, Hapus
          </button>
        </div>
      </Modal>
    </>
  );
}