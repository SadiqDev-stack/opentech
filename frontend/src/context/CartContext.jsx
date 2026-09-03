import { createContext, useContext, useEffect, useMemo, useState } from "react";

/**
 * Guests keep a cart in localStorage. Once the user signs in the same items are
 * sent to the server cart, so the shape here matches the API cart item shape.
 */
const CartContext = createContext(null);
const STORAGE_KEY = "opentech_cart";

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch {
      // ignore unreadable storage
    }
  }, []);

  function persist(next) {
    setItems(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  const value = useMemo(
    () => ({
      items,
      count: items.reduce((total, item) => total + item.quantity, 0),
      subtotal: items.reduce((total, item) => total + item.price * item.quantity, 0),
      addItem(product, quantity = 1) {
        const existing = items.find((item) => item.productId === product.id);
        if (existing) {
          persist(
            items.map((item) =>
              item.productId === product.id
                ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock || 99) }
                : item,
            ),
          );
          return;
        }
        persist([
          ...items,
          {
            id: product.id,
            productId: product.id,
            name: product.name,
            price: product.price,
            stock: product.stock,
            image: product.images?.[0] || "",
            quantity,
          },
        ]);
      },
      updateQuantity(productId, quantity) {
        if (quantity < 1) return;
        persist(items.map((item) => (item.productId === productId ? { ...item, quantity } : item)));
      },
      removeItem(productId) {
        persist(items.filter((item) => item.productId !== productId));
      },
      clear() {
        persist([]);
      },
      setItems: persist,
    }),
    [items],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
