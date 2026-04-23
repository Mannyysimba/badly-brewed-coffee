import type { Metadata } from "next";
import { Fraunces } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Badly Brewed Coffee",
  description: "A warm little coffee shop management system.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fraunces.variable} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('bbc-theme');if(t==='dark')document.documentElement.classList.add('dark')}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-screen bg-app text-fg">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
