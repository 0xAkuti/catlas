import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Ubuntu, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers/PrivyProvider";
import AuthButtons from "@/components/auth/AuthButtons";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { AppToaster } from "@/components/ui/sonner";

const ubuntu = Ubuntu({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Catlas",
  description:
    "Share cats found around the world. Discover, upload, and mint unique cat NFTs.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0f19" },
  ],
  icons: {
    icon: '/favicon.png',
  },
  openGraph: {
    title: "Catlas",
    description: "Share cats found around the world. Discover, upload, and mint unique cat NFTs.",
    url: "/",
    siteName: "Catlas",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Catlas",
    description: "Share cats found around the world. Discover, upload, and mint unique cat NFTs.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${ubuntu.variable} ${geistMono.variable} font-sans antialiased`}>
        <Providers>
          <AppToaster />
          <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="mx-auto max-w-screen-md md:max-w-screen-lg lg:max-w-screen-xl px-4 py-3 flex items-center justify-between">
            <Link href="/" className="font-semibold text-lg tracking-tight flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="Catlas Logo"
                width={32}
                height={32}
                className="h-8 w-8"
              />
              Catlas
            </Link>
            <nav className="hidden sm:flex items-center gap-4 text-sm">
              <Link href="/discover" className="hover:underline">
                Discover
              </Link>
              <Link href="/leaderboard" className="hover:underline">
                Leaderboard
              </Link>
              <Link href="/upload" className="hover:underline">
                Upload
              </Link>
              <AuthButtons />
            </nav>
            <div className="sm:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Open menu">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-64">
                  <SheetHeader>
                    <SheetTitle>Menu</SheetTitle>
                  </SheetHeader>
                  <div className="mt-4 px-4 flex flex-col gap-3 text-sm">
                    <Link href="/discover" className="hover:underline">
                      Discover
                    </Link>
                    <Link href="/leaderboard" className="hover:underline">
                      Leaderboard
                    </Link>
                    <Link href="/upload" className="hover:underline">
                      Upload
                    </Link>
                    <div className="pt-2 border-t">
                      <AuthButtons />
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
          </header>
          <main className="mx-auto max-w-screen-md md:max-w-screen-lg lg:max-w-screen-xl px-4">
          {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
