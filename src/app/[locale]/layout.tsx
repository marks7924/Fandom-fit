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

export const metadata: Metadata = {
  title: "Fandom Fit | Wear What You Love",
  description: "Premium Egyptian Streetwear brand inspired by gaming, anime, movies, football, and music culture. Made for fandom lovers.",
  icons: {
    icon: "/favicon.ico",
  }
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
