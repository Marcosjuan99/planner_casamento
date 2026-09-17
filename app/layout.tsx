import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Planner de Casamento",
  description: "Central de planejamento, orçamento e organização do casamento.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full bg-slate-50 antialiased`}
    >
      <body className="min-h-full bg-slate-50 text-slate-900">
        <div className="mx-auto flex max-w-[1600px] gap-6 p-4 md:p-6">
          <Sidebar />
          <main className="min-w-0 flex-1 rounded-3xl p-2 md:p-4">{children}</main>
        </div>
      </body>
    </html>
  );
}
