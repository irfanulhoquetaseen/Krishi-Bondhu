import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ScrollProgress } from "@/components/ui/scroll-progress";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
  weight: ["500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const viewport: Viewport = {
  themeColor: "#1F3D2B",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Krishi Bondhu (কৃষি বন্ধু) — AI Agro-Advisory & Soil Telemetry Platform",
  description:
    "Prescriptive agronomic intelligence framework delivering stage-specific field guidance, soil NPK telemetry, and pathogen prevention for smallholder farmers across Bangladesh.",
  keywords: [
    "Krishi Bondhu",
    "Agro Advisory",
    "Precision Agriculture",
    "Bangladesh Agritech",
    "Soil Telemetry",
    "Crop Intelligence",
    "Aman Rice",
    "Boro Rice",
  ],
  authors: [{ name: "Krishi Bondhu Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("kb-theme");if(t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme:dark)").matches)){document.documentElement.classList.add("dark");}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="font-sans bg-warm-bg text-warm-ink flex flex-col min-h-screen antialiased selection:bg-amber selection:text-forest-950 transition-colors duration-200">
        <ScrollProgress />
        <Navbar />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
