import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem("cartItems");
    return savedCart ? JSON.parse(savedCart) : [];
  });
  
  // This helps enforce that we only build a cart for one shop at a time to prevent complex shipping/pickup mismatch.
  const [cartShopId, setCartShopId] = useState(() => {
    const savedShopId = localStorage.getItem("cartShopId");
    return savedShopId ? JSON.parse(savedShopId) : null;
  });

  // Sync to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
    localStorage.setItem("cartShopId", JSON.stringify(cartShopId));
  }, [cartItems, cartShopId]);

  const addToCart = (item) => {
    // Check if adding from a different shop, if so clear cart or throw warning
    if (cartShopId && cartShopId !== item.shopId && cartItems.length > 0) {
      // Auto clear the cart if jumping to a brand new shop
      setCartItems([item]);
      setCartShopId(item.shopId);
      return;
    }
    
    setCartShopId(item.shopId);
    setCartItems(prev => [...prev, { ...item, id: Date.now() }]); // simple unique id for map rendering
  };

  const removeFromCart = (itemId) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
    if (cartItems.length === 1) {
      setCartShopId(null);
    }
  };

  const clearCart = () => {
    setCartItems([]);
    setCartShopId(null);
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + item.totalAmount, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      cartShopId,
      addToCart,
      removeFromCart,
      clearCart,
      cartTotal
    }}>
      {children}
    </CartContext.Provider>
  );
};
