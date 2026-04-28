import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { t } from '../constants/translations';
import { getItemsOfReport } from '../database/reportItems';
import { ReportWithCustomer, getReportTotalCost } from '../database/reports';

/**
 * Build report section with all details including items
 * Displays: date, customer, activity, hours, items with quantities, total cost, and notes
 */
const reportToSection = (report: ReportWithCustomer, language: 'en' | 'it' = 'en', index: number = 1, total: number = 1): string => {
  const items = getItemsOfReport(report.id);
  const totalCost = getReportTotalCost(report.id);
  
  const itemsHtml = items.length > 0
    ? items.map(item => `
      <tr>
        <td>${item.name}</td>
        <td>${item.quantity.toFixed(2)}</td>
        <td>€${item.cost.toFixed(2)}</td>
        <td>€${(item.cost * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('')
    : `<tr><td colspan="4">${t('pdfNoItems', language)}</td></tr>`;

  return `
    <div class="report-section">
      <div class="report-page-header">${index}/${total}</div>
      <div class="report-header">
        <div class="header-row">
          <div class="header-col">
            <strong>${t('pdfDate', language)}:</strong> ${report.date}
          </div>
          <div class="header-col">
            <strong>${t('pdfCustomer', language)}:</strong> ${report.customer_name}
          </div>
        </div>
        <div class="header-row">
          <div class="header-col full-width">
            <strong>${t('pdfActivity', language)}:</strong> ${report.activity}
          </div>
        </div>
      </div>

      <div class="report-details">
        <div class="detail-row">
          <span><strong>${t('pdfHoursWorked', language)}:</strong> ${report.hours_worked.toFixed(2)}h</span>
          <span><strong>${t('pdfHourlyRate', language)}:</strong> €${report.hour_cost.toFixed(2)}</span>
        </div>
      </div>

      <div class="items-section">
        <h3>${t('pdfItemsUsed', language)}</h3>
        <table class="items-table">
          <thead>
            <tr>
              <th>${t('pdfItem', language)}</th>
              <th>${t('pdfQty', language)}</th>
              <th>${t('pdfUnitPrice', language)}</th>
              <th>${t('pdfTotal', language)}</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
      </div>

      <div class="total-section">
        <div class="total-row">
          <span>${t('pdfLabourCost', language)}:</span>
          <span>€${(report.hours_worked * report.hour_cost).toFixed(2)}</span>
        </div>
        <div class="total-row">
          <span>${t('pdfMaterialsCost', language)}:</span>
          <span>€${(totalCost - (report.hours_worked * report.hour_cost)).toFixed(2)}</span>
        </div>
        <div class="total-row total-final">
          <span><strong>${t('totalCost', language).toUpperCase()}:</strong></span>
          <span><strong>€${totalCost.toFixed(2)}</strong></span>
        </div>
      </div>

      ${report.notes ? `<div class="notes-section">
        <strong>${t('pdfNotes', language)}:</strong> ${report.notes}
      </div>` : ''}
    </div>
  `;
};

/**
 * Build complete HTML document for PDF export
 * Includes styling and report sections with items and totals
 */
const buildHtml = (reports: ReportWithCustomer[], title: string, language: 'en' | 'it' = 'en'): string => `
  <html>
    <head>
      <meta charset="utf-8"/>
      <style>
        body {
          font-family: Helvetica, Arial, sans-serif;
          padding: 32px;
          padding-bottom: 60px;
          color: #1e293b;
          position: relative;
          counter-reset: page-counter;
        }
        @page {
          margin-bottom: 40px;
          margin-top: 40px;
        }
        h1 { font-size: 28px; margin-bottom: 4px; color: #0f172a; }
        p.subtitle { color: #64748b; font-size: 12px; margin-bottom: 32px; }
        .header-container {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 32px;
        }
        .header-content {
          flex: 1;
        }
        .report-page-header {
          font-size: 11px;
          color: #64748b;
          margin-bottom: 12px;
          text-align: right;
          font-weight: 500;
        }
        .report-section {
          page-break-inside: avoid;
          margin-bottom: 40px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 20px;
          background: #ffffff;
          counter-increment: page-counter;
          margin-top: 60px;
        }
        .report-section:first-of-type {
          margin-top: 0;
        }
        .report-header {
          border-bottom: 2px solid #0f172a;
          padding-bottom: 16px;
          margin-bottom: 16px;
        }
        .header-row {
          display: flex;
          gap: 32px;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }
        .header-col {
          flex: 1;
          min-width: 200px;
        }
        .header-col.full-width {
          flex-basis: 100%;
        }
        .report-details {
          margin-bottom: 20px;
          background: #f8fafc;
          padding: 12px;
          border-radius: 4px;
        }
        .detail-row {
          display: flex;
          gap: 32px;
          flex-wrap: wrap;
        }
        .detail-row span {
          flex: 1;
          min-width: 150px;
        }
        .items-section {
          margin-bottom: 20px;
        }
        .items-section h3 {
          margin: 0 0 12px 0;
          font-size: 14px;
          color: #0f172a;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
        }
        .items-table th {
          background: #0f172a;
          color: #f8fafc;
          padding: 8px 10px;
          text-align: left;
          font-weight: bold;
        }
        .items-table td {
          padding: 8px 10px;
          border-bottom: 1px solid #e2e8f0;
        }
        .items-table tbody tr:nth-child(even) td {
          background: #f8fafc;
        }
        .items-table tbody tr td:nth-child(2),
        .items-table tbody tr td:nth-child(3),
        .items-table tbody tr td:nth-child(4) {
          text-align: right;
        }
        .total-section {
          background: #f0f9ff;
          border: 1px solid #0369a1;
          border-radius: 4px;
          padding: 16px;
          margin-bottom: 16px;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 6px 0;
          font-size: 13px;
        }
        .total-row.total-final {
          border-top: 2px solid #0369a1;
          padding-top: 10px;
          margin-top: 10px;
          font-size: 16px;
          color: #0f172a;
        }
        .notes-section {
          background: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 12px;
          border-radius: 2px;
          font-size: 12px;
          line-height: 1.5;
        }
        .page-footer {
          position: fixed;
          bottom: 20px;
          left: 0;
          right: 0;
          text-align: center;
          font-size: 11px;
          color: #64748b;
          border-top: 1px solid #e2e8f0;
          padding-top: 8px;
        }
      </style>
    </head>
    <body>
      <div class="header-container">
        <div class="header-content">
          <h1>${title}</h1>
          <p class="subtitle">Generated on ${new Date().toLocaleDateString('it-IT')}</p>
        </div>
      </div>
      ${reports.map((report, index) => reportToSection(report, language, index + 1, reports.length)).join('')}
    </body>
  </html>
`;

/**
 * Generate and share PDF of reports
 * 
 * Flow:
 * 1. Convert reports to HTML table
 * 2. Print to PDF file
 * 3. Open native share dialog
 * 
 * @param reports - Array of reports to export
 * @param title - Document title
 */
export async function shareReportsPdf(
  reports: ReportWithCustomer[],
  title: string = 'Field Reports',
  language: 'en' | 'it' = 'en'
): Promise<void> {
  const html = buildHtml(reports, title, language);
  // Generate PDF from HTML
  const { uri } = await Print.printToFileAsync({ html });
  // Open native share sheet
  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    dialogTitle: 'Share Report',
    UTI: 'com.adobe.pdf',
  });
}