import type { ReactNode } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import './globals.css';

export const metadata = {
  title: 'CampusHub — Academic Resource Repository',
  description:
    'A collaborative hub for students to share notes, past papers, lab manuals, and more.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
