import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FREAKEND",
  description:
    "Gamified weekend discovery for IE MBA students in Madrid. Pull the lever. Take the dare. Make the story.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased text-white bg-freak-bg">
        {children}
      </body>
    </html>
  );
}
