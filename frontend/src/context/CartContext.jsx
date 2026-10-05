"use client";

import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const savedCart = localStorage.getItem("restaurant_cart");
        if (savedCart) {
          return JSON.parse(savedCart);
        }
      } catch {
        // Ignore fallback
      }
    }
    return [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Save to localStorage whenever items change
  useEffect(() => {
    try {
      localStorage.setItem("restaurant_cart", JSON.stringify(items));
    } catch {
      // Ignore fallback
    }
  }, [items]);

  // Add item or increment quantity
  const addToCart = (menuItem, quantity = 1) => {
    if (!menuItem || menuItem.isAvailable === false) return;

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.menuItemId === menuItem.id);
      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      }
      return [
        ...prevItems,
        {
          menuItemId: menuItem.id,
          name: menuItem.name,
          price: Number(menuItem.price),
          categoryName: menuItem.categoryName || menuItem.category?.name || "",
          quantity: quantity,
        },
      ];
    });
  };

  // Update item quantity
  const updateQuantity = (menuItemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(menuItemId);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.menuItemId === menuItemId ? { ...item, quantity } : item
      )
    );
  };

  // Remove single item from cart
  const removeFromCart = (menuItemId) => {
    setItems((prevItems) => prevItems.filter((item) => item.menuItemId !== menuItemId));
  };

  // Clear entire cart
  const clearCart = () => {
    setItems([]);
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen((prev) => !prev);

  // Computed values
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = Number(
    items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)
  );

  return (
    <CartContext.Provider
      value={{
        items,
        totalCount,
        totalAmount,
        isCartOpen,
        setIsCartOpen,
        openCart,
        closeCart,
        toggleCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
