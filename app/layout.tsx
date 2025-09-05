import type { Metadata } from "next";
import Link from "next/link";
import { Ubuntu, Geist_Mono } from "next/font/google";
import "./globals.css";

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
  title: "WorldCat",
  description:
    "Share cats found around the world. Discover, upload, and mint unique cat NFTs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${ubuntu.variable} ${geistMono.variable} font-sans antialiased`}>
        <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="mx-auto max-w-screen-md md:max-w-screen-lg lg:max-w-screen-xl px-4 py-3 flex items-center justify-between">
            <Link href="/" className="font-semibold text-lg tracking-tight">
              WorldCat
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/discover" className="hover:underline">
                Discover
              </Link>
              <Link href="/upload" className="hover:underline">
                Upload
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-screen-md md:max-w-screen-lg lg:max-w-screen-xl px-4">
          {children}
        </main>
      </body>
    </html>
  );
}
