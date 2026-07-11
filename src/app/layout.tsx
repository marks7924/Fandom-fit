import type { Metadata } from 'next';

// Root layout — sets metadataBase so all static route handlers resolve OG images correctly.
// The actual HTML shell and font loading is handled in [locale]/layout.tsx.
export const metadata: Metadata = {
  metadataBase: new URL('https://fandom-fit.vercel.app'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // [locale]/layout.tsx renders the full <html> shell.
  // This root layout is only needed to satisfy Next.js App Router routing conventions
  // and to provide metadataBase for static assets like /icon.png and /opengraph-image.png.
  return children;
}
