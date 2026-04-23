import type { Metadata } from "next";
import localFont from "next/font/local";
import { Fraunces } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import "./globals.css";

const coolvetica = localFont({
  src: [
    { path: "../../public/fonts/Coolvetica-Rg.otf", weight: "400", style: "normal" },
    { path: "../../public/fonts/Coolvetica-It.otf", weight: "400", style: "italic" },
    { path: "../../public/fonts/Coolvetica-Cond.otf", weight: "600", style: "normal" },
  ],
  variable: "--font-sans",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Badly Brewed Coffee — Team 17",
  description: "Badly Brewed Coffee management system. Customer ordering, barista terminal, manager analytics, admin controls.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${coolvetica.variable} ${fraunces.variable}`} suppressHydrationWarning>
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
