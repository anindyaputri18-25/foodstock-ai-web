// FR-07: Laporan & Ekspor Data, unduhan CSV dan "Excel" dilakukan murni di
// sisi klien tanpa dependensi pihak ketiga (menghindari pustaka xlsx yang
// memiliki celah keamanan belum ada perbaikan). Berkas .xls dihasilkan dari
// markup HTML <table> bertipe MIME application/vnd.ms-excel, format yang
// dikenali penuh oleh Microsoft Excel. Ekspor PDF memanfaatkan dialog cetak
// bawaan browser (window.print) dengan stylesheet cetak pada globals.css.

function downloadBlob(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportToCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const escapeCell = (cell: string | number) => {
    const s = String(cell);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.map(escapeCell).join(","), ...rows.map((r) => r.map(escapeCell).join(","))];
  downloadBlob(`${filename}.csv`, "\uFEFF" + lines.join("\r\n"), "text/csv;charset=utf-8;");
}

export function exportToExcel(filename: string, title: string, headers: string[], rows: (string | number)[][]) {
  const escapeHtml = (v: string | number) =>
    String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const headerRow = `<tr>${headers.map((h) => `<th style="background:#059669;color:#fff;padding:6px;">${escapeHtml(h)}</th>`).join("")}</tr>`;
  const bodyRows = rows
    .map((r) => `<tr>${r.map((c) => `<td style="padding:6px;border:1px solid #e2e8f0;">${escapeHtml(c)}</td>`).join("")}</tr>`)
    .join("");
  const html = `
    <html xmlns:x="urn:schemas-microsoft-com:office:excel">
    <head><meta charset="utf-8" /></head>
    <body>
      <h3>${escapeHtml(title)}</h3>
      <table>${headerRow}${bodyRows}</table>
    </body>
    </html>`;
  downloadBlob(`${filename}.xls`, html, "application/vnd.ms-excel;charset=utf-8;");
}

export function printReport() {
  window.print();
}
