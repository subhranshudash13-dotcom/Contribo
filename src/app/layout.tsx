import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "next-themes";
import { DM_Sans } from "next/font/google";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import AuthButton from "@/components/ui/AuthButton";
import { NetworkProvider } from "@/components/ui/NetworkProvider";
import Script from "next/script";
import "./globals.css";

// Self-hosted via next/font — no render-blocking Google Fonts CSS request
const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
  weight: ["400", "500", "600", "700", "800"],
  preload: true,
});

export const metadata: Metadata = {
  title: "Contribo | Open Source Programs",
  description:
    "The one place to find, understand, and apply to every paid open-source program in the world.",
  icons: {
    icon: "/icon.svg?v=3",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FBF9F6" },
    { media: "(prefers-color-scheme: dark)", color: "#2B1B15" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={dmSans.variable}>
      <head>
        {/* DNS-prefetch for third-party analytics only when configured */}
        {process.env.NEXT_PUBLIC_GTM_ID && (
          <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        )}
        {process.env.NEXT_PUBLIC_GTM_ID && (
          <Script
            id="gtm"
            strategy="lazyOnload"
            dangerouslySetInnerHTML={{
              __html: `
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','${process.env.NEXT_PUBLIC_GTM_ID}');
              `,
            }}
          />
        )}
      </head>
      <body className={`${dmSans.className} font-sans antialiased bg-page text-primary min-h-screen flex flex-col`}>
        {process.env.NEXT_PUBLIC_GTM_ID && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${process.env.NEXT_PUBLIC_GTM_ID}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        )}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NetworkProvider>
            <Navbar authButton={<AuthButton />} />
            <div className="flex-1 w-full pt-16 px-1">{children}</div>
            <Footer />
          </NetworkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
