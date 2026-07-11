import type { Metadata } from "next";
import { Inter, Gochi_Hand } from "next/font/google";
import "../globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { notFound } from "next/navigation";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap',
});

const gochiHand = Gochi_Hand({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-gochi",
  display: 'swap',
});

const SITE_URL = 'https://fandom-fit.vercel.app';
const SITE_TITLE = 'Fandom Fit | Wear What You Love';
const SITE_DESCRIPTION = 'Premium Egyptian Streetwear inspired by gaming, anime, movies, football, and music culture. Wear What You Love. Made in Egypt.';
const OG_IMAGE = `${SITE_URL}/og-image.png`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  // --- Core ---
  title: {
    default: SITE_TITLE,
    template: '%s | Fandom Fit',
  },
  description: SITE_DESCRIPTION,
  keywords: [
    'Fandom Fit', 'Egyptian streetwear', 'anime tshirts', 'gaming shirts',
    'custom tshirts Egypt', 'fandom clothing', 'made in Egypt fashion',
    'anime merch', 'football shirts Egypt', 'custom design shirts'
  ],
  authors: [{ name: 'Fandom Fit', url: SITE_URL }],
  creator: 'Fandom Fit',
  publisher: 'Fandom Fit',

  // --- Favicon & Icons ---
  icons: {
    icon: [
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/icon-512.png',
  },

  // --- PWA Manifest ---
  manifest: '/manifest.json',

  // --- Open Graph (Facebook, WhatsApp, Discord, LinkedIn, Telegram) ---
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'Fandom Fit',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: 'Fandom Fit — Wear What You Love. Premium Egyptian Streetwear.',
        type: 'image/png',
      },
    ],
  },

  // --- Twitter / X Card ---
  twitter: {
    card: 'summary_large_image',
    site: '@fandomfit',
    creator: '@fandomfit',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE],
  },

  // --- Robots ---
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
    },
  },

  // --- Theme color for browser chrome ---
  other: {
    'theme-color': '#000000',
    'msapplication-TileColor': '#000000',
    'msapplication-TileImage': '/icon-512.png',
  },
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate that the incoming locale parameter is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Get localized messages
  const messages = await getMessages();
  const direction = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html
      lang={locale}
      dir={direction}
      className={`${inter.variable} ${gochiHand.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#EDE0D0] text-[#000000] selection:bg-[#000000] selection:text-[#EDE0D0] overflow-x-hidden">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
