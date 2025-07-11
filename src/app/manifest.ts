import type { MetadataRoute } from "next";

/**
 * Gera o manifesto do PWA para a aplicação.
 * Este arquivo descreve o nome, ícones, cores e comportamento
 * do aplicativo quando instalado em um dispositivo.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Stock-Bit PDV & Gestão",
    short_name: "Stock-Bit",
    description: "Sistema de gestão de estoque e Ponto de Venda.",
    start_url: "/",
    display: "standalone",
    background_color: "#0f172a", // Cor de fundo da tela de splash
    theme_color: "#0f172a",      // Cor da barra de status do navegador
    icons: [
      {
        src: "/icons/icon-96x96.png",
        sizes: "96x96",
        type: "image/png",
      },
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
       
      },
    ],
    screenshots: [
      {
        src: "/screenshots/desktop-screenshot-1.png",
        sizes: "1903x892",
        type: "image/png",
        // 'form_factor: "wide"' diz ao navegador que esta imagem é para desktops.
        form_factor: "wide",
        label: "Tela Principal do PDV"
      },
      {
        src: "/screenshots/mobile-screenshot-1.png",
        sizes: "371x810",
        type: "image/png",
        // 'form_factor: "narrow"' diz que é para celulares.
        form_factor: "narrow",
        label: "Visualização do Catálogo no Celular"
      }
    ]
  };
}