import type { Metadata } from "next";
import "../globals.css";
import "leaflet/dist/leaflet.css";
import { Providers } from "@/components/providers/QueryProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { VoiceAssistantProvider } from "@/context/VoiceAssistantContext";
import { LocationWeatherProvider } from "@/context/LocationWeatherContext";
import TranslationObserver from "@/components/layout/TranslationObserver";
import { ThemeProvider } from "@/context/ThemeContext";

export const metadata: Metadata = {
  title: "AgriNex AI — Smart Agriculture Marketplace",
  description:
    "AI-powered farm-to-consumer marketplace connecting Indian farmers directly with consumers. Intelligent pricing, crop quality analysis, and real-time order tracking.",
  keywords: "agriculture, farmers, marketplace, AI, India, organic, farm-to-consumer",
  openGraph: {
    title: "AgriNex AI",
    description: "Smart Connection Between Farmers & Consumers",
    type: "website",
  },
};

/**
 * Root layout — renders core providers, AI chat modal, and global translation observer.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Anti-flash: apply saved theme class before React hydrates */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('agrinex-theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark');}}catch(e){}})();`,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Poppins:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <ThemeProvider>
          <Providers>
            <AuthProvider>
              <VoiceAssistantProvider>
                <LocationWeatherProvider>
                  <TranslationObserver />
                  <main className="min-h-screen">
                    {children}
                  </main>
                </LocationWeatherProvider>
              </VoiceAssistantProvider>
            </AuthProvider>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
