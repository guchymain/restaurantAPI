import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";

export const metadata = {
  title: "Savoria Restaurant | Artisan Dining & Online Ordering",
  description:
    "Explore our chef-curated menu, order handcrafted dishes, and track real-time kitchen preparation with Savoria Restaurant.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased scroll-smooth">
      <body className="min-h-full flex flex-col bg-stone-100 dark:bg-stone-950 text-stone-900 dark:text-stone-100 selection:bg-amber-500 selection:text-white font-sans transition-colors">
        <AuthProvider>
          <CartProvider>
            <div className="flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-1">{children}</main>

              {/* Shared Cart Slide-Over */}
              <CartDrawer />

              {/* Seamless Warm Footer */}
              <footer className="border-t border-stone-200/80 bg-stone-100 dark:border-stone-850 dark:bg-stone-950 py-10 transition-colors">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                    <div>
                      <span className="font-serif text-lg font-bold tracking-tight text-stone-900 dark:text-stone-100">
                        Savoria Kitchen & Bar
                      </span>
                      <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                        Crafted meals made with seasonal produce and artisan culinary techniques.
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-stone-500 dark:text-stone-400 font-medium">
                      <span>127 Gourmet Avenue</span>
                      <span>•</span>
                      <span>Open Daily 10:00 AM – 10:00 PM</span>
                      <span>•</span>
                      <span>Fresh to Order</span>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-stone-200/60 dark:border-stone-900 text-center text-xs text-stone-400 font-medium">
                    © {new Date().getFullYear()} Savoria Restaurant Management System. All rights reserved.
                  </div>
                </div>
              </footer>
            </div>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
