import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import { Providers } from '@/components/shared/Providers/Providers';
import './globals.scss';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Jackpot.bet - Casino Game Lobby',
  description: 'Discover and play the best casino games. Browse slots, table games, live dealer, and more.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={poppins.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
