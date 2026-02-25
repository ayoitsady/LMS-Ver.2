"use client";

import { createContext, useContext, useState, useEffect } from "react";
import apiInstance from "@/utils/axios";
import CartId from "@/views/plugins/CartId";

interface CartItem {
  id: string;
  price: number;
  course: {
    title: string;
    image: string;
  };
}

interface CartContextType {
  cartCount: number;
  setCartCount: (count: number) => void;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType>({
  cartCount: 0,
  setCartCount: () => {},
  refreshCart: async () => {},
});

export const useCart = () => useContext(CartContext);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartCount, setCartCount] = useState(0);

  const refreshCart = async () => {
    try {
      const response = await apiInstance.get<CartItem[]>(`course/cart-list/${CartId()}/`);
      setCartCount(response.data.length);
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };

  useEffect(() => {
    refreshCart();
  }, []);

  return (
    <CartContext.Provider value={{ cartCount, setCartCount, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
} 