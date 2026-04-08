import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();

  const getItemsKey = () => `cartItems_${user ? user.id : 'guest'}`;
  const getShopKey = () => `cartShopId_${user ? user.id : 'guest'}`;

  const [cartItems, setCartItems] = useState([]);
  const [cartShopId, setCartShopId] = useState(null);

  // Re-hydrate the cart whenever the user swaps/logs out
  useEffect(() => {
    const savedCart = localStorage.getItem(getItemsKey());
    const savedShop = localStorage.getItem(getShopKey());
    setCartItems(savedCart ? JSON.parse(savedCart) : []);
    setCartShopId(savedShop ? JSON.parse(savedShop) : null);
  }, [user]);

  // Sync to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem(getItemsKey(), JSON.stringify(cartItems));
    localStorage.setItem(getShopKey(), JSON.stringify(cartShopId));
  }, [cartItems, cartShopId, user]);

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
