import type React from "react"
import type { Metadata, Viewport } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { MobileNavigation } from "@/components/mobile-navigation"
import { PWAInstallPrompt } from "@/components/pwa-install-prompt"
import "./globals.css"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "CarSub - 車両レンタルアプリ",
  description: "車両レンタル・サブスクリプションサービス",
  generator: "v0.app",
  manifest: "/manifest.json",
  keywords: ["車両レンタル", "カーシェア", "サブスクリプション", "レンタカー"],
  authors: [{ name: "CarSub" }],
  creator: "CarSub",
  publisher: "CarSub",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://carsub.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "CarSub - 車両レンタルアプリ",
    description: "車両レンタル・サブスクリプションサービス",
    url: "https://carsub.vercel.app",
    siteName: "CarSub",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CarSub - 車両レンタルアプリ",
    description: "車両レンタル・サブスクリプションサービス",
    creator: "@carsub",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CarSub",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.jpg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="CarSub" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#2563eb" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} pb-16 md:pb-0`}>
        <Suspense>
          {children}
          <MobileNavigation />
        </Suspense>
        <PWAInstallPrompt />
        <Analytics />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}