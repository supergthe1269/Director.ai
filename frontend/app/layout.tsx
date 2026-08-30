import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Director.ai Studio",
  description: "From prompt to screen. Sequenced to perfection.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">{children}</body>
    </html>
  );
}
