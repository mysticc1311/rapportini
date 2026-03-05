import { createContext, ReactNode, useContext, useState } from 'react';

interface SelectedCustomer {
  id: number;
  name: string;
}

interface CustomerContextType {
  selectedCustomer: SelectedCustomer | null;
  setSelectedCustomer: (customer: SelectedCustomer | null) => void;
}

const CustomerContext = createContext<CustomerContextType | null>(null);

export function CustomerProvider({ children }: { children: ReactNode }) {
  const [selectedCustomer, setSelectedCustomer] = useState<SelectedCustomer | null>(null);

  return (
    <CustomerContext.Provider value={{ selectedCustomer, setSelectedCustomer }}>
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomer() {
  const ctx = useContext(CustomerContext);
  if (!ctx) throw new Error('useCustomer must be used within CustomerProvider');
  return ctx;
}