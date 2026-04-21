import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  const addItem = useCallback((product, qty = 1) => {
    setItems((prev) => {
      const i = prev.findIndex((x) => x.product.id === product.id);
      if (i >= 0) {
        const next = [...prev];
        const q = next[i].quantity + qty;
        next[i] = { ...next[i], quantity: Math.min(q, product.stockQuantity ?? q) };
        return next;
      }
      return [...prev, { product, quantity: Math.min(qty, product.stockQuantity ?? qty) }];
    });
  }, []);

  const setQuantity = useCallback((productId, quantity) => {
    setItems((prev) =>
      prev
        .map((x) =>
          x.product.id === productId
            ? {
                ...x,
                quantity: Math.max(
                  1,
                  Math.min(quantity, x.product.stockQuantity ?? quantity)
                ),
              }
            : x
        )
        .filter((x) => x.quantity > 0)
    );
  }, []);

  const removeItem = useCallback((productId) => {
    setItems((prev) => prev.filter((x) => x.product.id !== productId));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const total = useMemo(
    () =>
      items.reduce((sum, x) => sum + Number(x.product.price) * x.quantity, 0),
    [items]
  );

  const value = useMemo(
    () => ({ items, addItem, setQuantity, removeItem, clear, total }),
    [items, addItem, setQuantity, removeItem, clear, total]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
