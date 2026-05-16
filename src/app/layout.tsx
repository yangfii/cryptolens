import type { Metadata } from "next";
import { Geist, Geist_Mono, Kantumruy_Pro } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import HeaderAuthSlot from "@/components/header-auth-slot";
import Footer from "@/components/footer";
import { createClient } from "@/lib/supabase/server";
import { LangProvider } from "@/components/lang-provider";
import { ThemeProvider } from "@/components/theme-provider";
import ScrollProgress from "@/components/scroll-progress";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const kantumruyPro = Kantumruy_Pro({
  variable: "--font-khmer",
  subsets: ["khmer", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Sastra trader | Markets Research",
  description:
    "AI-powered markets research and analysis platform for spot traders. Live prices, news sentiment, and deep research on top cryptocurrencies.",
  keywords: ["crypto", "research", "spot trading", "bitcoin", "ethereum", "AI analysis"],
};

// Runs synchronously in <head> before paint to set the theme.
// Prevents flash of wrong theme on initial load.
const themeInitScript = `
(function() {
  try {
    var t = localStorage.getItem('cryptolens:theme');
    if (t !== 'light' && t !== 'dark' && t !== 'system') t = 'system';
    var resolved = t === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : t;
    document.documentElement.setAttribute('data-theme', resolved);
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();
`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Read auth once at the layout level so Header can hide/show nav links
  // based on session. HeaderAuthSlot also runs getUser but it's deduped by
  // Supabase within a single request.
  let isAuthenticated = false;
  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    isAuthenticated = !!user;
  }

  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${geistSans.variable} ${geistMono.variable} ${kantumruyPro.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider>
          <LangProvider>
            <div className="site-bg" aria-hidden="true">
              <div className="site-bg__grid" />
              <div className="site-bg__orb site-bg__orb--accent" />
              <div className="site-bg__orb site-bg__orb--violet" />
              <div className="site-bg__orb site-bg__orb--cyan" />
            </div>
            <ScrollProgress />
            <div className="relative z-10 flex flex-col flex-1">
              <Header
                authSlot={<HeaderAuthSlot />}
                isAuthenticated={isAuthenticated}
              />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </LangProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
