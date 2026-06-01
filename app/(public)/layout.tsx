import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CartProvider } from '@/lib/cart';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <Navbar />
      <div className="pt-16 flex flex-col flex-1">
        {children}
      </div>
      <Footer />
    </CartProvider>
  );
}
