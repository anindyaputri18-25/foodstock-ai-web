import type { Metadata } from "next";
import { QueryProvider } from "@/providers/QueryProvider";
import { ToastHost } from "@/components/ui/ToastHost";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Peringatan Dini Ketahanan Pangan Nasional",
    template: "%s | Sistem Ketahanan Pangan",
  },
  description:
    "Sistem peringatan dini ketidakseimbangan stok pangan berbasis forecasting time-series untuk mendukung ketahanan pangan daerah.",
  keywords: ["ketahanan pangan", "forecasting", "early warning", "stok pangan"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("fs-theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}`,
          }}
        />
      </head>
      <body className="antialiased">
        <QueryProvider>
          {children}
          <ToastHost />
        </QueryProvider>
      </body>
    </html>
  );
}
