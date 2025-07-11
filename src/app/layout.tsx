import type React from "react";
import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/providers/auth-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import QueryProvider from "@/providers/query-provider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { CartProvider } from "@/providers/cart-context";

const PJS = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "stock-bit",
  description: "Sistema de gerenciamento de estoque com catálogo de produtos online.",
  manifest: "/manifest.webmanifest", // O Next.js recomenda usar .webmanifest
  icons: {
    icon: "/icons/icon-96x96.png",
    apple: "/icons/icon-192x192.png",
  },

  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Stock-Bit",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* Adicionar a meta tag theme-color diretamente no head garante
            que a cor da barra de status do navegador seja aplicada de forma consistente,
            especialmente em dispositivos móveis. */}
        {/* <meta name="theme-color" content="#0f172a" /> */}
      </head>
      <body className={`${PJS.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <AuthProvider>
              <CartProvider>
                <SpeedInsights />
                {children}
              </CartProvider>
            </AuthProvider>
          </QueryProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
