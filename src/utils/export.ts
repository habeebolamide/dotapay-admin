import { Transaction } from '@/types/transaction.types';

export function exportToCSV(data: Transaction[], filename: string = 'transactions') {
  const headers = [
    'Date',
    'Reference',
    'Amount',
    'Currency',
    'Customer Name',
    'Customer Email',
    'Channel',
    'Status',
    'Fees',
    'Gateway Response'
  ];

  const csvContent = [
    headers.join(','),
    ...data.map(transaction => [
      new Date(transaction.date).toLocaleDateString(),
      transaction.reference,
      transaction.amount.toString(),
      transaction.currency,
      `"${transaction.customer.name}"`,
      transaction.customer.email,
      transaction.channel,
      transaction.status,
      transaction.fees?.toString() || '0',
      `"${transaction.gateway_response || ''}"`
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export function generateExportFilename(filters: {
  dateRange?: string;
  status?: string[];
  channel?: string[];
}) {
  const timestamp = new Date().toISOString().split('T')[0];
  let filename = `transactions_${timestamp}`;

  if (filters.dateRange && filters.dateRange !== 'all-time') {
    filename += `_${filters.dateRange}`;
  }

  if (filters.status && filters.status.length > 0) {
    filename += `_${filters.status.join('-')}`;
  }

  if (filters.channel && filters.channel.length > 0) {
    filename += `_${filters.channel.join('-')}`;
  }

  return filename.toLowerCase().replace(/\s+/g, '-');
}