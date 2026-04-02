import { type SQLiteRunResult } from 'expo-sqlite';
import db from './db';

/**
 * Item record - represents products/services available for use in reports
 */
export interface Item {
  id: number;
  name: string;
  description: string | null;
  cost: number;
  createdAt: string;
}

/**
 * Type for creating new items (excludes id and createdAt which are auto-generated)
 */
export type NewItem = Omit<Item, 'id' | 'createdAt'>;

/**
 * Add new item to inventory
 * @returns SQLiteRunResult with lastInsertRowId of the newly created item
 */
export function addItem(item: NewItem): SQLiteRunResult {
  return db.runSync(
    `INSERT INTO items (name, description, cost) VALUES (?, ?, ?)`,
    [item.name, item.description, item.cost]
  );
}

/**
 * Get all items sorted by name
 */
export function getAllItems(): Item[] {
  return db.getAllSync<Item>(`SELECT * FROM items ORDER BY name`);
}

/**
 * Get a specific item by ID
 */
export function getItemById(id: number): Item | null {
  return db.getFirstSync<Item>(`SELECT * FROM items WHERE id = ?`, [id]) ?? null;
}

/**
 * Update an existing item
 */
export function updateItem(id: number, item: NewItem): void {
  db.runSync(`UPDATE items SET name=?, description=?, cost=? WHERE id=?`, [item.name, item.description, item.cost, id]);
}

/**
 * Delete an item (cascades to remove from report_items)
 */
export function deleteItem(id: number): void {
  db.runSync(`DELETE FROM items WHERE id = ?`, [id]);
}
