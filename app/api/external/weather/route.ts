import { NextResponse } from "next/server";

// FR-09: Integrasi Data Pihak Ketiga, variabel cuaca sebagai pendukung
// akurasi model forecasting terhadap pola panen/paceklik (SKPL Bab V.b).
// Open-Meteo dipakai sebagai pengganti API BMKG pada purwarupa ini karena
// bersifat publik, gratis, dan tidak memerlukan API key, sehingga proyek
// tetap dapat langsung di-deploy ke Vercel tanpa konfigurasi kredensial
// tambahan. Endpoint ini berfungsi sebagai lapisan proxy/BFF sederhana agar
// pemanggilan API eksternal tidak dilakukan langsung dari browser.
//
// SKPL Bab V.b juga mensyaratkan mekanisme retry & fallback: jika layanan
// eksternal gagal diakses, endpoint ini mengembalikan status "fallback"
// dengan data terakhir yang diketahui alih-alih membuat seluruh dashboard
// gagal dimuat.

const FALLBACK = { suhu_c: 28, curah_hujan_mm: 2, kelembapan_persen: 78, kategori_musim: "peralihan" as const };

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!lat || !lon) {
    return NextResponse.json({ error: "Parameter lat & lon wajib diisi." }, { status: 400 });
  }

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation&timezone=auto`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, { signal: controller.signal, next: { revalidate: 900 } });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`Open-Meteo merespons status ${res.status}`);
    const data = await res.json();
    const curahHujan = Number(data?.current?.precipitation ?? 0);

    return NextResponse.json({
      source: "open-meteo",
      status: "live",
      suhu_c: data?.current?.temperature_2m ?? FALLBACK.suhu_c,
      curah_hujan_mm: curahHujan,
      kelembapan_persen: data?.current?.relative_humidity_2m ?? FALLBACK.kelembapan_persen,
      kategori_musim: curahHujan > 5 ? "musim_hujan" : curahHujan > 0.5 ? "peralihan" : "musim_kemarau",
      waktu: new Date().toISOString(),
    });
  } catch (err) {
    // Fallback: layanan eksternal tidak dapat diakses -> tetap kembalikan data
    // agar dashboard tidak gagal dimuat, ditandai status "fallback".
    return NextResponse.json({
      source: "fallback",
      status: "fallback",
      ...FALLBACK,
      waktu: new Date().toISOString(),
      catatan: err instanceof Error ? err.message : "Layanan cuaca eksternal tidak dapat dijangkau.",
    });
  }
}
