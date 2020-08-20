import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';
import { Alert } from 'react-native';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const StorafeKey = '@GoMarketplace:products';

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const productsStorage = await AsyncStorage.getItem(StorafeKey);

      if (productsStorage) {
        setProducts(JSON.parse(productsStorage));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async (product: Product) => {
      // TODO ADD A NEW ITEM TO THE CART

      const itemExists = products.findIndex(item => item.id === product.id);

      if (itemExists >= 0) {
        setProducts(current => {
          const newState = current.map(item => {
            return item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item;
          });

          AsyncStorage.setItem(StorafeKey, JSON.stringify(newState));

          return newState;
        });
      } else {
        setProducts(current => {
          const newState = [...current, { ...product, quantity: 1 }];

          AsyncStorage.setItem(StorafeKey, JSON.stringify(newState));

          return newState;
        });
      }
    },
    [products],
  );

  const increment = useCallback(async (id: string) => {
    setProducts(current => {
      const newState = current.map(item =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
      );

      AsyncStorage.setItem(StorafeKey, JSON.stringify(newState));

      return newState;
    });
  }, []);

  const decrement = useCallback(async (id: string) => {
    // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART

    setProducts(current => {
      const itemIndex = current.findIndex(item => item.id === id);

      if (current[itemIndex]?.quantity === 1) {
        const newState = current.filter(item => item.id !== id);
        AsyncStorage.setItem(StorafeKey, JSON.stringify(newState));
        return newState;
      }

      const newState = current.map(item =>
        item.id === id ? { ...item, quantity: item.quantity - 1 } : item,
      );

      AsyncStorage.setItem(StorafeKey, JSON.stringify(newState));

      return newState;
    });
  }, []);

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
