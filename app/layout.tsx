import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://pulso-enfermagem.sites.openai.com"),
  title: "Pulso — Enfermagem que fica na cabeça",
  description: "Conteúdo de concurso de enfermagem transformado em música.",
  icons: { icon: `${basePath}/favicon.png`, shortcut: `${basePath}/favicon.png` },
  manifest: `${basePath}/manifest.webmanifest`,
  appleWebApp: { capable: true, title: "Pulso", statusBarStyle: "black-translucent" },
  openGraph: {
    title: "Pulso — Enfermagem que fica na cabeça",
    description: "Ouça, memorize e avance na sua preparação.",
    images: [{ url: `${basePath}/og.png`, width: 1734, height: 907 }],
    locale: "pt_BR",
    type: "website",
  },
  twitter: { card: "summary_large_image", images: [`${basePath}/og.png`] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>{children}</body>
    </html>
  );
}
