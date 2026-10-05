"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { ordersAPI } from "@/lib/api";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function CartDrawer() {
  const router = useRouter();
  const { items, totalCount, totalAmount, isCartOpen, closeCart, updateQuantity, removeFromCart, clearCart } =
    useCart();
  const { user, isAuthenticated } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isCartOpen) return null;

  const handlePlaceOrder = async () => {
    if (items.length === 0) return;
    setError(null);

    if (!isAuthenticated) {
      setError("Please sign in or create an account to place your order.");
      return;
    }

    setLoading(true);
    try {
      const orderPayload = {
        userId: user.id,
        items: items.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
        })),
      };

      const res = await ordersAPI.create(orderPayload);
      clearCart();
      closeCart();

      if (res?.order?.id) {
        router.push(`/orders/${res.order.id}`);
      } else {
        router.push("/orders");
      }
    } catch (err) {
      setError(err.message || "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <aside className="w-screen max-w-md bg-stone-100 dark:bg-stone-950 shadow-2xl flex flex-col border-l border-stone-200/80 dark:border-stone-850 animate-in slide-in-from-right duration-200">
          {/* Drawer Header */}
          <div className="flex items-center justify-between border-b border-stone-200/80 dark:border-stone-850 px-6 py-5 bg-stone-100 dark:bg-stone-950">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                  Your Order Cart
                </h2>
                <p className="text-xs text-stone-600 dark:text-stone-400 font-medium">
                  {totalCount} {totalCount === 1 ? "item" : "items"} selected
                </p>
              </div>
            </div>

            <button
              onClick={closeCart}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-200/60 dark:text-stone-400 dark:hover:text-stone-200 dark:hover:bg-stone-900 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Drawer Error Banner */}
          {error && (
            <div className="mx-6 mt-4 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
              <div className="flex-1">
                <span className="font-medium">{error}</span>
                {!isAuthenticated && (
                  <div className="mt-2">
                    <Link
                      href="/login"
                      onClick={closeCart}
                      className="font-bold text-rose-900 underline hover:text-rose-950 dark:text-rose-300 dark:hover:text-rose-100"
                    >
                      Sign In Now →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Items List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-stone-200/60 dark:divide-stone-850">
            {items.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center py-12">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-200/60 dark:bg-stone-900 text-stone-400">
                  <ShoppingBag className="h-8 w-8" />
                </div>
                <h3 className="mt-4 font-serif text-base font-bold text-stone-800 dark:text-stone-200">
                  Your cart is empty
                </h3>
                <p className="mt-1 text-xs text-stone-500 dark:text-stone-400 max-w-[220px]">
                  Explore our handcrafted menu and add delicious items to get started.
                </p>
                <button
                  onClick={closeCart}
                  className="mt-6 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-amber-700 cursor-pointer"
                >
                  Browse Menu
                </button>
              </div>
            ) : (
              items.map((item) => {
                const itemSubtotal = (item.price * item.quantity).toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                });
                return (
                  <div key={item.menuItemId} className="py-4 first:pt-0 flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-stone-900 dark:text-stone-100 truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                        ${Number(item.price).toFixed(2)} each
                      </p>
                      <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mt-0.5">
                        Subtotal: {itemSubtotal}
                      </p>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center rounded-xl border border-stone-300 dark:border-stone-800 bg-stone-200/60 dark:bg-stone-900 p-0.5">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                          className="flex h-6 w-6 items-center justify-center rounded-lg text-stone-700 dark:text-stone-300 hover:bg-stone-300/60 dark:hover:bg-stone-800 cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-stone-900 dark:text-stone-100">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                          className="flex h-6 w-6 items-center justify-center rounded-lg text-stone-700 dark:text-stone-300 hover:bg-stone-300/60 dark:hover:bg-stone-800 cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.menuItemId)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Drawer Footer & Checkout */}
          {items.length > 0 && (
            <div className="border-t border-stone-200/80 dark:border-stone-850 bg-stone-100 dark:bg-stone-950 p-6">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-xs text-stone-600 dark:text-stone-400 font-medium">
                  <span>Subtotal</span>
                  <span className="font-bold text-stone-800 dark:text-stone-200">${totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-stone-600 dark:text-stone-400 font-medium">
                  <span>Taxes & Kitchen Service</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">Included</span>
                </div>
                <div className="flex justify-between text-base font-bold text-stone-900 dark:text-stone-100 pt-2 border-t border-stone-200 dark:border-stone-800">
                  <span>Total Due</span>
                  <span className="font-serif text-xl font-extrabold text-amber-700 dark:text-amber-400">
                    ${totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {!isAuthenticated && (
                <div className="mb-3 rounded-xl bg-amber-500/10 p-3 text-xs text-amber-950 dark:text-amber-200 border border-amber-500/20">
                  <p className="font-bold text-stone-900 dark:text-stone-100">Sign in required to place orders</p>
                  <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-0.5">
                    Your cart items will remain saved while you sign in.
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={clearCart}
                  className="rounded-xl border border-stone-300 dark:border-stone-800 bg-stone-100 dark:bg-stone-950 px-3.5 py-2.5 text-xs font-bold text-stone-700 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-900 transition-colors cursor-pointer"
                >
                  Clear
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={handlePlaceOrder}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-amber-600 py-3 text-xs font-bold text-white shadow-sm hover:bg-amber-700 active:scale-98 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Sending Order...</span>
                    </>
                  ) : (
                    <>
                      <span>{isAuthenticated ? "Place Order" : "Sign In & Order"}</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
