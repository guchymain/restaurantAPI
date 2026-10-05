"use client";

import { useState } from "react";
import { Plus, Minus, ShoppingBag, Check } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function MenuCard({ item }) {
  const { addToCart, items: cartItems } = useCart();
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  // Check if item is already in cart
  const cartItem = cartItems.find((ci) => ci.menuItemId === item.id);
  const isAvailable = item.isAvailable !== false;

  const handleIncrement = () => setQty((prev) => prev + 1);
  const handleDecrement = () => setQty((prev) => (prev > 1 ? prev - 1 : 1));

  const handleAdd = () => {
    if (!isAvailable) return;
    addToCart(item, qty);
    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
      setQty(1);
    }, 1200);
  };

  const formattedPrice = Number(item.price).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

  return (
    <article
      className={`group relative flex flex-col justify-between rounded-2xl border p-5 transition-all duration-200 ${
        isAvailable
          ? "border-stone-200 bg-stone-100 hover:border-amber-500/60 hover:shadow-sm dark:border-stone-850 dark:bg-stone-950 dark:hover:border-amber-500/40"
          : "border-stone-200/60 bg-stone-100 opacity-60 dark:border-stone-850/60 dark:bg-stone-950"
      }`}
    >
      <div>
        {/* Header: Category Badge & Availability */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
            {item.categoryName || item.category?.name || "Kitchen Special"}
          </span>

          {isAvailable ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Available
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 dark:text-rose-300 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
              Sold Out
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors line-clamp-1">
          {item.name}
        </h3>

        {/* Description */}
        <p className="mt-1 text-xs text-stone-600 dark:text-stone-400 line-clamp-2 min-h-[32px] leading-relaxed font-normal">
          {item.description || "Prepared fresh to order using finest local ingredients."}
        </p>
      </div>

      {/* Price & Add to Cart Controls */}
      <div className="mt-5 pt-4 border-t border-stone-200/70 dark:border-stone-850 flex items-center justify-between gap-2">
        <div className="flex flex-col">
          <span className="text-[10px] text-stone-500 dark:text-stone-400 uppercase tracking-wider font-bold">Price</span>
          <span className="font-sans text-lg font-extrabold text-stone-900 dark:text-stone-100">
            {formattedPrice}
          </span>
        </div>

        {isAvailable ? (
          <div className="flex items-center gap-2">
            {/* Quantity Stepper */}
            <div className="flex items-center rounded-xl border border-stone-300 dark:border-stone-800 bg-stone-200/50 dark:bg-stone-900 p-0.5">
              <button
                type="button"
                onClick={handleDecrement}
                disabled={qty <= 1}
                aria-label="Decrease quantity"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-stone-700 hover:bg-stone-300/60 disabled:opacity-30 dark:text-stone-300 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="w-6 text-center text-xs font-bold text-stone-900 dark:text-stone-100">
                {qty}
              </span>
              <button
                type="button"
                onClick={handleIncrement}
                aria-label="Increase quantity"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-stone-700 hover:bg-stone-300/60 dark:text-stone-300 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>

            {/* Add Button */}
            <button
              type="button"
              onClick={handleAdd}
              disabled={justAdded}
              aria-label={`Add ${qty} ${item.name} to cart`}
              className={`flex h-8 items-center gap-1.5 rounded-xl px-3 text-xs font-bold text-white shadow-xs transition-all active:scale-95 cursor-pointer ${
                justAdded
                  ? "bg-emerald-600"
                  : "bg-amber-600 hover:bg-amber-700 shadow-amber-600/20"
              }`}
            >
              {justAdded ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="h-3.5 w-3.5" />
                  <span>Add</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <button
            type="button"
            disabled
            className="rounded-xl border border-stone-300/60 bg-stone-200/40 px-3 py-1.5 text-xs font-medium text-stone-400 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-500 cursor-not-allowed"
          >
            Unavailable
          </button>
        )}
      </div>

      {/* Cart quantity badge indicator if already in cart */}
      {cartItem && (
        <div className="absolute -top-2 -right-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-stone-900 dark:bg-amber-600 px-1.5 text-[10px] font-bold text-white shadow-xs">
          {cartItem.quantity} in cart
        </div>
      )}
    </article>
  );
}
