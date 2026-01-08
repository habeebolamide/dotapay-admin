import { Reversal } from '@/types/reversal.types';

export const sampleReversals: Reversal[] = [
  {
    id: '1',
    refundAmount: 20000.00,
    currency: 'NGN',
    customerName: '',
    customerEmail: 'demscript@gmail.com',
    status: 'processed',
    refundedOn: '2025-09-23T14:30:00Z',
    originalTransactionId: 'T425744836061559',
    reason: 'Customer request',
  },
  {
    id: '2',
    refundAmount: 45000.00,
    currency: 'NGN',
    customerName: '',
    customerEmail: 'demscript@gmail.com',
    status: 'processed',
    refundedOn: '2025-09-23T12:15:00Z',
    originalTransactionId: 'T425744836061560',
    reason: 'Duplicate payment',
  },
  {
    id: '3',
    refundAmount: 90000.00,
    currency: 'NGN',
    customerName: '',
    customerEmail: 'demscript@gmail.com',
    status: 'processed',
    refundedOn: '2025-09-23T09:45:00Z',
    originalTransactionId: 'T425744836061561',
    reason: 'Service not delivered',
  },
];