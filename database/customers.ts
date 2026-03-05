import { type SQLiteRunResult } from 'expo-sqlite';
import db from './db';

export interface Customer {
  id: number;
  name: string;
  address: string | null;
  email: string | null;
  phone: string | null;
  createdAt: string;
}

export type NewCustomer = Omit<Customer, 'id' | 'createdAt'>;

export function addCustomer(customer: NewCustomer): SQLiteRunResult {
  return db.runSync(
    `INSERT INTO customers (name, address, email, phone) VALUES (?, ?, ?, ?)`,
    [customer.name, customer.address, customer.email, customer.phone]
  );
}

export function getAllCustomers(): Customer[] {
  return db.getAllSync<Customer>(`SELECT * FROM customers ORDER BY name`);
}

export function getCustomerById(id: number): Customer | null {
  return db.getFirstSync<Customer>(`SELECT * FROM customers WHERE id = ?`, [id]) ?? null;
}

export function updateCustomer(id: number, customer: NewCustomer): void {
  db.runSync(
    `UPDATE customers SET name=?, address=?, email=?, phone=? WHERE id=?`,
    [customer.name, customer.address, customer.email, customer.phone, id]
  );
}

export function deleteCustomer(id: number): void {
  db.runSync(`DELETE FROM customers WHERE id = ?`, [id]);
}