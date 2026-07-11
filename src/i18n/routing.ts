import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['en', 'ar'],
  defaultLocale: 'en',
  localePrefix: 'as-needed' // Can configure to skip prefix for defaultLocale or always use it. 'as-needed' is great.
});

export const {Link, redirect, usePathname, useRouter, getPathname} = createNavigation(routing);
