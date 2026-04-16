import type { Metadata } from 'next';
import { Geist, Geist_Mono, Noto_Serif_KR, Noto_Sans_KR } from 'next/font/google';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import './globals.css';

import { ColorSchemeScript, MantineProvider, mantineHtmlProps, createTheme } from '@mantine/core';
import { AppLayout } from '@/components/Layout/AppLayout';
import { AuthProvider } from '@/context/AuthContext';

const notoSerif = Noto_Serif_KR({
  weight: ['400', '700', '900'],
  variable: '--font-serif',
  subsets: ['latin'],
});

const notoSans = Noto_Sans_KR({
  weight: ['400', '500', '700'],
  variable: '--font-sans',
  subsets: ['latin'],
});

const theme = createTheme({
  fontFamily: 'var(--font-sans)',
  headings: {
    fontFamily: 'var(--font-serif)',
  },
  primaryColor: 'bori-deep',
  colors: {
    'bori-deep': [
      '#eefcfb', '#dcf9f5', '#b6f1e9', '#8de8dc', '#6be1d1', '#54dbcb', '#47d9c8', '#38c0b0', '#2bab9c', '#1A2F2F'
    ],
  },
});

export const metadata: Metadata = {
  title: '아르카나 랩 (Arcana Lab)',
  description: '현대적 감각의 타로 리딩 솔루션',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" {...mantineHtmlProps} className={`${notoSerif.variable} ${notoSans.variable}`}>
      <head>
        <ColorSchemeScript defaultColorScheme="light" />
      </head>
      <body className="antialiased">
        <MantineProvider theme={theme} defaultColorScheme="light">
          <AuthProvider>
            <AppLayout>
              {children}
            </AppLayout>
          </AuthProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
