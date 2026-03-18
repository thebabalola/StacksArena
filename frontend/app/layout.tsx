import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Navbar } from "./components/navbar";
import { Footer } from "./components/footer";
import { ThemeProvider } from "./components/providers/theme-provider";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "StacksArena — Bitcoin Gaming Arena on Stacks L2",
    template: "%s | StacksArena",
  },
  description:
    "The premier on-chain gaming platform. Enter skill-based tournaments, win lottery jackpots, and collect rare game assets — all anchored to Bitcoin via Stacks L2.",
  keywords: ["Stacks", "Bitcoin", "gaming", "blockchain", "tournament", "lottery", "NFT", "game assets", "L2", "DeFi"],
  authors: [{ name: "StacksArena Protocol" }],
  creator: "StacksArena",
  openGraph: {
    title: "StacksArena — Bitcoin Gaming Arena",
    description: "Compete. Win. Dominate. The premier Bitcoin-secured gaming arena on Stacks L2.",
    type: "website",
    siteName: "StacksArena",
    images: [{ url: "/logo.svg", width: 64, height: 64, alt: "StacksArena Shield Logo" }],
  },
  twitter: {
    card: "summary",
    title: "StacksArena — Bitcoin Gaming Arena",
    description: "Join on-chain tournaments, win lottery jackpots, collect rare game assets on Stacks L2.",
    images: ["/logo.svg"],
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/logo.svg",
    shortcut: "/favicon.svg",
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0F172A" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}>
        <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
