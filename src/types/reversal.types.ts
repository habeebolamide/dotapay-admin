export interface Reversal {
  id: string;
  refundAmount: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  status: 'processed' | 'processing' | 'failed' | 'pending';
  refundedOn: string;
  originalTransactionId?: string;
  reason?: string;
}

export interface ReversalFilterState {
  search: string;
  status?: string[];
  refundAmountFilter: {
    operator: 'more-than' | 'less-than' | 'equal-to';
    amount: number | null;
  };
  dateRange: {
    startDate: string | null;
    endDate: string | null;
  };
}