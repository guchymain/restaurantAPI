"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { UtensilsCrossed, ShoppingBag, User, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const { totalCount, openCart } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isStaffOrAdmin = user?.role === "staff" || user?.role === "admin";
  const navLinks = [
    { name: "Menu", href: "/" },
    { name: isStaffOrAdmin ? "Order Management" : "My Orders", href: "/orders" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-stone-100 dark:border-stone-850 dark:bg-stone-950 transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand / Logo */}
        <Link
          href="/"
          className="group flex items-center gap-2.5 text-stone-900 dark:text-stone-100 transition-transform active:scale-98"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-600 text-white shadow-xs shadow-amber-600/20 group-hover:bg-amber-700 transition-colors">
            <UtensilsCrossed className="h-5 w-5" />
          </div>
          <div>
            <span className="font-serif text-lg font-bold tracking-tight block leading-none text-stone-900 dark:text-stone-100">
              Savoria
            </span>
            <span className="text-[10px] uppercase tracking-wider text-amber-700 dark:text-amber-400 font-sans font-bold">
              Artisan Kitchen
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1.5">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-stone-200/80 text-stone-950 shadow-2xs dark:bg-stone-900 dark:text-white"
                    : "text-stone-700 hover:text-stone-950 hover:bg-stone-200/50 dark:text-stone-300 dark:hover:text-white dark:hover:bg-stone-900/60"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right Action Icons & Auth */}
        <div className="flex items-center gap-3">
          {/* Cart Trigger Button */}
          <button
            onClick={openCart}
            type="button"
            aria-label="View Cart"
            className="relative flex items-center gap-2 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition-all hover:bg-amber-700 active:scale-95 cursor-pointer"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Cart</span>
            {totalCount > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-stone-900 dark:bg-stone-950 px-1.5 text-[11px] font-extrabold text-white shadow-2xs">
                {totalCount}
              </span>
            )}
          </button>

          {/* User Account / Auth */}
          {isAuthenticated ? (
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-stone-300/80 dark:border-stone-800">
              <div className="flex flex-col items-end">
                <span className="text-xs font-bold text-stone-900 dark:text-stone-100 line-clamp-1 max-w-[130px]">
                  {user?.name}
                </span>
                <span className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold">
                  {user?.role === "admin" ? "Admin" : user?.role === "staff" ? "Staff" : "Customer"}
                </span>
              </div>
              <button
                onClick={logout}
                title="Log Out"
                className="flex h-9 w-9 items-center justify-center rounded-xl text-stone-500 hover:text-rose-600 hover:bg-rose-50 dark:text-stone-400 dark:hover:bg-rose-950/40 dark:hover:text-rose-300 transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden sm:flex items-center gap-1.5 rounded-xl border border-stone-300 bg-stone-100 px-3.5 py-2 text-xs font-bold text-stone-800 shadow-2xs hover:bg-stone-200/60 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-200 dark:hover:bg-stone-900 transition-all active:scale-95"
            >
              <User className="h-4 w-4 text-stone-600 dark:text-stone-400" />
              <span>Sign In</span>
            </Link>
          )}

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-stone-700 hover:bg-stone-200/60 dark:text-stone-300 dark:hover:bg-stone-900 md:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="border-b border-stone-200/80 bg-stone-100 px-4 py-4 dark:border-stone-850 dark:bg-stone-950 md:hidden shadow-md">
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-xl text-sm font-bold ${
                  pathname === link.href
                    ? "bg-stone-200 text-stone-900 dark:bg-stone-900 dark:text-white"
                    : "text-stone-700 hover:bg-stone-200/50 dark:text-stone-300 dark:hover:bg-stone-900/60"
                }`}
              >
                {link.name}
              </Link>
            ))}

            <div className="mt-2 pt-3 border-t border-stone-200 dark:border-stone-800">
              {isAuthenticated ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-stone-900 dark:text-stone-100">{user?.name}</p>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      {user?.email} • {user?.role === "admin" ? "Admin" : user?.role === "staff" ? "Staff" : "Customer"}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full rounded-xl bg-amber-600 py-2.5 text-center text-xs font-bold text-white shadow-xs"
                >
                  <User className="h-4 w-4" />
                  <span>Sign In / Register</span>
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
