import type { Metadata } from "next";
import "./globals.scss";

export const metadata: Metadata = {
  title: "Touhou Blank Project",
  description: "A blank project with Touhou Mystia Izakaya Assistant style background",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-blend-mystia-pseudo">
        {children}
      </body>
    </html>
  );
}
