import { createContext, ReactNode, useContext, useState } from 'react';

/**
 * Selected item with quantity tracking
 * Used during report creation to store items the user has chosen
 */
export interface SelectedItem {
  id: number;
  name: string;
  cost: number;
  quantity: number;
}

interface ItemContextType {
  selectedItems: SelectedItem[];
  setSelectedItems: (items: SelectedItem[]) => void;
  addItem: (item: Omit<SelectedItem, 'quantity'>) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearItems: () => void;
}

const ItemContext = createContext<ItemContextType | null>(null);

/**
 * Provider for managing selected items during report creation
 * Items are stored in state and cleared after report is saved
 */
export function ItemProvider({ children }: { children: ReactNode }) {
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);

  // Add new item with default quantity of 1
  const addItem = (item: Omit<SelectedItem, 'quantity'>) => {
    setSelectedItems((prev) => {
      const exists = prev.find((i) => i.id === item.id);
      return exists ? prev : [...prev, { ...item, quantity: 1 }];
    });
  };

  // Remove item from selection
  const removeItem = (id: number) => {
    setSelectedItems((prev) => prev.filter((i) => i.id !== id));
  };

  // Update quantity for a selected item (min 0.1 to prevent empty quantities)
  const updateQuantity = (id: number, quantity: number) => {
    setSelectedItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: Math.max(0.1, quantity) } : i))
    );
  };

  // Clear all selected items (called after report is saved)
  const clearItems = () => {
    setSelectedItems([]);
  };

  return (
    <ItemContext.Provider value={{ selectedItems, setSelectedItems, addItem, removeItem, updateQuantity, clearItems }}>
      {children}
    </ItemContext.Provider>
  );
}

/**
 * Hook to access item selection context
 * Must be used within ItemProvider
 */
export function useItems() {
  const ctx = useContext(ItemContext);
  if (!ctx) throw new Error('useItems must be used within ItemProvider');
  return ctx;
}
