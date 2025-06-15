import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LeRobot Dataset Visualizer",
  description: "Visualization of LeRobot Datasets",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Remove Grammarly attributes on load
              document.addEventListener('DOMContentLoaded', () => {
                const body = document.body;
                if (body) {
                  body.removeAttribute('data-gr-ext-installed');
                  body.removeAttribute('data-new-gr-c-s-check-loaded');
                }
              });
            `,
          }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
