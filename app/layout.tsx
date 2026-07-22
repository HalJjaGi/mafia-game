import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "마피아 게임",
  description: "온라인 마피아 게임",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
