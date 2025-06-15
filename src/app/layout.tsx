import type React from "react";
import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/providers/auth-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import QueryProvider from "@/providers/query-provider";
import { SpeedInsights } from "@vercel/speed-insights/next";

const PJS = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "stock-bit",
  description: "Sistema de gerenciamento de estoque com catálogo de produtos online.",
  openGraph: {
    title: "StockBit",
    description: "Organize seu estoque e exiba seus produtos com facilidade em um catálogo online.",
    url: "https://stockdemo.app",
    siteName: "Stockdemo",
    images: [
      {
        url: "https://stockbit.app/og-image.png", 
        width: 1920,
        height: 1080,
      },
    ],
    type: "website",
    locale: "pt-BR",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  twitter: {
    title: "StockBit",
    description: "Gerencie seu estoque e catálogo de produtos de forma simples e eficiente.",
    card: "summary_large_image",
  },
  keywords: [
    "estoque",
    "sistema de estoque",
    "catálogo online",
    "inventário",
    "controle de produtos",
    "gestão de estoque",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${PJS.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <AuthProvider>
              <SpeedInsights />
              {children}
            </AuthProvider>
          </QueryProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
