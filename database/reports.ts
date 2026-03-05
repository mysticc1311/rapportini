import db from './db';

export interface Report {
  id: number;
  activity: string;
  customer_id: number;
  date: string;
  time_start: string;
  time_end: string;
  notes: string | null;
  createdAt: string;
}

export interface ReportWithCustomer extends Report {
  customer_name: string;
}

export type NewReport = Omit<Report, 'id' | 'createdAt'>;

export function addReport(report: NewReport): void {
  db.runSync(
    `INSERT INTO reports (activity, customer_id, date, time_start, time_end, notes) VALUES (?, ?, ?, ?, ?, ?)`,
    [report.activity, report.customer_id, report.date, report.time_start, report.time_end, report.notes]
  );
}

export function getAllReports(): ReportWithCustomer[] {
  return db.getAllSync<ReportWithCustomer>(`
    SELECT reports.*, customers.name
    FROM reports
    JOIN customers ON reports.customer_id = customers.id
    ORDER BY reports.date DESC
  `);
}

export function getReportsByCustomer(customer_id: number): Report[] {
  return db.getAllSync<Report>(
    `SELECT * FROM reports WHERE customer_id = ? ORDER BY date DESC`,
    [customer_id]
  );
}

export function updateReport(id: number, report: NewReport): void {
  db.runSync(
    `UPDATE reports SET activity=?, customer_id=?, date=?, time_start=?, time_end=?, notes=? WHERE id=?`,
    [report.activity, report.customer_id, report.date, report.time_start, report.time_end, report.notes, id]
  );
}

export function deleteReport(id: number): void {
  db.runSync(`DELETE FROM reports WHERE id = ?`, [id]);
}