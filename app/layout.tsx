import type { Metadata } from "next";
import "../globals.css";
import "leaflet/dist/leaflet.css";
import { Providers } from "@/components/providers/QueryProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { VoiceAssistantProvider } from "@/context/VoiceAssistantContext";

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
 * Root layout — renders frosted sidebar and floating Voice AI button.
 * Sidebar receives the authenticated profile for avatar + verification badge.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <Providers>
          <AuthProvider>
            <VoiceAssistantProvider>
              <main className="min-h-screen">
                {children}
              </main>
            </VoiceAssistantProvider>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
