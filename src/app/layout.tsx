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
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" }
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover"
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
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
        url: "/icons/apple-touch-icon.png",
        width: 180,
        height: 180,
        alt: "Find Your Roots Logo"
      }
    ]
  },
  twitter: {
    card: "summary",
    title: "Find Your Roots - Family Tree",
    description: "Discover and manage your family history with an interactive family tree.",
    images: ["/icons/apple-touch-icon.png"]
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/icon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/icon0.svg", sizes: "any", type: "image/svg+xml" }
    ],
    shortcut: "/icons/apple-touch-icon.png",
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }
    ],
    other: [
      {
        rel: "apple-touch-icon-precomposed",
        url: "/icons/apple-touch-icon.png"
      }
    ]
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Find Your Roots",
    startupImage: [
      {
        url: "/icons/apple-touch-icon.png",
        media: "(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)"
      },
      {
        url: "/icons/apple-touch-icon.png",
        media: "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)"
      },
      {
        url: "/icons/apple-touch-icon.png",
        media: "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)"
      },
      {
        url: "/icons/apple-touch-icon.png",
        media: "(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)"
      }
    ]
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Find Your Roots",
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
        {/* Dynamic theme color script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              function updateThemeColor() {
                const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                const themeColor = isDark ? '#0a0a0a' : '#ffffff';
                
                // Update theme-color meta tag
                let metaThemeColor = document.querySelector('meta[name="theme-color"]');
                if (!metaThemeColor) {
                  metaThemeColor = document.createElement('meta');
                  metaThemeColor.name = 'theme-color';
                  document.head.appendChild(metaThemeColor);
                }
                metaThemeColor.content = themeColor;
                
                // Update for iOS safari
                let metaAppleStatusBar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
                if (!metaAppleStatusBar) {
                  metaAppleStatusBar = document.createElement('meta');
                  metaAppleStatusBar.name = 'apple-mobile-web-app-status-bar-style';
                  document.head.appendChild(metaAppleStatusBar);
                }
                metaAppleStatusBar.content = isDark ? 'black-translucent' : 'default';
              }
              
              // Update on load
              updateThemeColor();
              
              // Listen for theme changes
              window.matchMedia('(prefers-color-scheme: dark)').addListener(updateThemeColor);
            `
          }}
        />
        
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
