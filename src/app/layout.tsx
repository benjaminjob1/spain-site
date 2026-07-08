import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Nav from "./components/Nav";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "spain.benjob.me",
  description: "spain.benjob.me",
  // Hint to browsers: don't index the password-gated pages. Belt-and-braces
  // alongside the proxy auth.
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">
        <Nav />
        {children}
      </body>
    </html>
  );
}