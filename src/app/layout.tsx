import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { FamilyProvider } from "@/contexts/FamilyContext";
import { AuthProvider } from "@/contexts/AuthContext";
import PWAHandler from "@/components/PWAHandler";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#3b82f6" },
    { media: "(prefers-color-scheme: dark)", color: "#1e40af" }
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover"
};

export const metadata: Metadata = {
  title: {
    default: "Find Your Roots - Family Tree",
    template: "%s | Find Your Roots"
  },
  description: "Discover and manage your family history with an interactive family tree. Create, explore, and preserve your family heritage for future generations.",
  applicationName: "Find Your Roots",
  authors: [
    {
      name: "Zaki Amiri",
      url: "https://github.com/el-gladiador"
    }
  ],
  generator: "Next.js",
  keywords: [
    "family tree",
    "genealogy",
    "family history",
    "heritage",
    "ancestry",
    "family connections",
    "interactive tree"
  ],
  creator: "Zaki Amiri",
  publisher: "Find Your Roots",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://your-domain.com",
    siteName: "Find Your Roots",
    title: "Find Your Roots - Interactive Family Tree",
    description: "Discover and manage your family history with our interactive family tree application.",
    images: [
      {
        url: "/icon-512x512.png",
        width: 512,
        height: 512,
        alt: "Find Your Roots Logo"
      }
    ]
  },
  twitter: {
    card: "summary",
    title: "Find Your Roots - Family Tree",
    description: "Discover and manage your family history with an interactive family tree.",
    images: ["/icon-512x512.png"]
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-16x16.png", sizes: "16x16", type: "image/png" }
    ],
    shortcut: "/icon-192x192.png",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }
    ],
    other: [
      {
        rel: "apple-touch-icon-precomposed",
        url: "/apple-touch-icon.png"
      }
    ]
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Family Tree",
    startupImage: [
      {
        url: "/apple-touch-icon.png",
        media: "(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)"
      },
      {
        url: "/icon-192x192.png",
        media: "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)"
      },
      {
        url: "/icon-192x192.png",
        media: "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)"
      },
      {
        url: "/icon-512x512.png",
        media: "(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)"
      }
    ]
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Family Tree",
    "application-name": "Find Your Roots",
    "msapplication-TileColor": "#3b82f6",
    "msapplication-config": "/browserconfig.xml"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <FamilyProvider>
            {children}
            <PWAHandler />
          </FamilyProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
