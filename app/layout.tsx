import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "어시장브라더스 관리자",
  description: "어시장브라더스 관리자 페이지",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/sunn-us/SUIT/fonts/static/woff2/SUIT.css"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
