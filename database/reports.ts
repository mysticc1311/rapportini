import { type SQLiteRunResult } from 'expo-sqlite';
import db from './db';

/**
 * Report record as stored in database
 * - hours_worked: total hours spent on report
 * - hour_cost: hourly rate for the work
 */
export interface Report {
  id: number;
  activity: string;
  customer_id: number;
  date: string;
  hours_worked: number;
  hour_cost: number;
  notes: string | null;
  createdAt: string;
}

/**
 * Report with customer name joined from customers table
 * Used for display in the reports list
 */
export interface ReportWithCustomer extends Report {
  customer_name: string;
}

/**
 * Type for creating new reports (excludes id and createdAt which are auto-generated)
 */
export type NewReport = Omit<Report, 'id' | 'createdAt'>;

/**
 * Add a new report to the database
 * @returns SQLiteRunResult with lastInsertRowId of the newly created report
 */
export function addReport(report: NewReport): SQLiteRunResult {
  return db.runSync(
    `INSERT INTO reports (activity, customer_id, date, hours_worked, hour_cost, notes) VALUES (?, ?, ?, ?, ?, ?)`,
    [report.activity, report.customer_id, report.date, report.hours_worked, report.hour_cost, report.notes]
  );
}

/**
 * Get all reports with customer names, sorted by date (newest first)
 */
export function getAllReports(): ReportWithCustomer[] {
  return db.getAllSync<ReportWithCustomer>(`
    SELECT reports.*, customers.name AS customer_name
    FROM reports
    JOIN customers ON reports.customer_id = customers.id
    ORDER BY reports.date DESC
  `);
}

/**
 * Get all reports for a specific customer
 */
export function getReportsByCustomer(customer_id: number): Report[] {
  return db.getAllSync<Report>(
    `SELECT * FROM reports WHERE customer_id = ? ORDER BY date DESC`,
    [customer_id]
  );
}

/**
 * Update an existing report
 */
export function updateReport(id: number, report: NewReport): void {
  db.runSync(
    `UPDATE reports SET activity=?, customer_id=?, date=?, hours_worked=?, hour_cost=?, notes=? WHERE id=?`,
    [report.activity, report.customer_id, report.date, report.hours_worked, report.hour_cost, report.notes, id]
  );
}

/**
 * Delete a report (cascades to delete associated report_items)
 */
export function deleteReport(id: number): void {
  db.runSync(`DELETE FROM reports WHERE id = ?`, [id]);
}

/**
 * Calculate total cost for a report
 * Total = (hours_worked * hour_cost) + sum(item_cost * item_quantity for each item)
 * @param reportId - ID of the report
 * @returns Total cost as a number
 */
export function getReportTotalCost(reportId: number): number {
  // Get labor cost
  const report = db.getFirstSync<{ hours_worked: number; hour_cost: number }>(
    `SELECT hours_worked, hour_cost FROM reports WHERE id = ?`,
    [reportId]
  );
  if (!report) return 0;

  const laborCost = report.hours_worked * report.hour_cost;

  // Get items cost
  const result = db.getFirstSync<{ total_items_cost: number }>(
    `SELECT COALESCE(SUM(i.cost * ri.quantity), 0) as total_items_cost
     FROM report_items ri
     JOIN items i ON ri.item_id = i.id
     WHERE ri.report_id = ?`,
    [reportId]
  );

  const itemsCost = result?.total_items_cost ?? 0;

  return laborCost + itemsCost;
}