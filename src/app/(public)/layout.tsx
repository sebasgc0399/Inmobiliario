import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import type { ReactNode } from 'react';

export default function LayoutPublico({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
