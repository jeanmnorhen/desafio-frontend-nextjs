import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Inbox de Atendimento — Desafio Frontend",
  description: "Painel de atendimento WhatsApp construído com Next.js App Router.",
};

export const viewport: Viewport = {
  themeColor: "#111b21",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} font-sans antialiased`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
