import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { ReportWithCustomer } from '../database/reports';

const reportToRows = (reports: ReportWithCustomer[]): string =>
  reports.map((r) => `
    <tr>
      <td>${r.date}</td>
      <td>${r.customer_name}</td>
      <td>${r.activity}</td>
      <td>${r.time_start} → ${r.time_end}</td>
      <td>${r.notes ?? '-'}</td>
    </tr>
  `).join('');

const buildHtml = (reports: ReportWithCustomer[], title: string): string => `
  <html>
    <head>
      <meta charset="utf-8"/>
      <style>
        body { font-family: Helvetica, Arial, sans-serif; padding: 32px; color: #1e293b; }
        h1 { font-size: 22px; margin-bottom: 4px; }
        p.subtitle { color: #64748b; font-size: 13px; margin-bottom: 24px; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        th { background: #0f172a; color: #f8fafc; padding: 10px 12px; text-align: left; }
        td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
        tr:nth-child(even) td { background: #f8fafc; }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <p class="subtitle">Generated on ${new Date().toLocaleDateString('it-IT')}</p>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Customer</th>
            <th>Activity</th>
            <th>Time</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          ${reportToRows(reports)}
        </tbody>
      </table>
    </body>
  </html>
`;

export async function shareReportsPdf(
  reports: ReportWithCustomer[],
  title: string = 'Field Reports'
): Promise<void> {
  const html = buildHtml(reports, title);
  const { uri } = await Print.printToFileAsync({ html });
  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    dialogTitle: 'Share Report',
    UTI: 'com.adobe.pdf',
  });
}