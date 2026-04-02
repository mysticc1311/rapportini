import db from './db';

/**
 * Report-Item relationship record
 * Stores many-to-many connection between reports and items with quantity
 */
export interface ReportItem {
  report_id: number;
  item_id: number;
  quantity: number;
}

/**
 * Report-Item with item details (name, description, cost)
 * Used for display when showing items used in a report
 */
export interface ReportItemWithDetails extends ReportItem {
  name: string;
  description: string | null;
  cost: number;
}

/**
 * Add item to report with specified quantity
 * Uses INSERT OR REPLACE to update quantity if item already exists in report
 */
export function addItemToReport(reportId: number, itemId: number, quantity: number = 1): void {
  db.runSync(
    `INSERT OR REPLACE INTO report_items (report_id, item_id, quantity) VALUES (?, ?, ?)`,
    [reportId, itemId, quantity]
  );
}

/**
 * Remove specific item from a report
 */
export function removeItemFromReport(reportId: number, itemId: number): void {
  db.runSync(`DELETE FROM report_items WHERE report_id = ? AND item_id = ?`, [reportId, itemId]);
}

/**
 * Remove all items from a report
 */
export function clearItemsFromReport(reportId: number): void {
  db.runSync(`DELETE FROM report_items WHERE report_id = ?`, [reportId]);
}

/**
 * Get all items for a specific report with their details
 * Used when viewing report to show what items were used
 */
export function getItemsOfReport(reportId: number): ReportItemWithDetails[] {
  return db.getAllSync<ReportItemWithDetails>(`
    SELECT ri.report_id, ri.item_id, ri.quantity, i.name, i.description, i.cost
    FROM report_items ri
    JOIN items i ON ri.item_id = i.id
    WHERE ri.report_id = ?
  `, [reportId]);
}
