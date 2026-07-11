import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: [
    // Match root and any locale-prefixed paths
    '/',
    '/(ar|en)/:path*',
    // Skip all internal paths (_next, static assets, etc.)
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ]
};
