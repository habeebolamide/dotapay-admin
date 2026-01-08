import { TransactionSplit } from '@/types/transaction-split.types';

export const sampleTransactionSplits: TransactionSplit[] = [
  {
    id: '1',
    name: 'Developers Split',
    splitType: 'percentage',
    currency: 'NGN',
    code: 'SPL_YGu3mv53Zw',
    created: '2025-09-23T12:00:00Z',
    status: 'active',
    subAccounts: [
      {
        id: '1',
        accountName: 'OGEGBO, CHRISTOPHER OLUWADEMILADE',
        bankName: 'Kuda Bank',
        accountNumber: '2012745135',
        accountAlias: 'OGEGBO, CHRISTOPHER OLUWADEMILADE',
        percentage: 15,
      },
      {
        id: '2',
        accountName: 'Your payout account',
        bankName: 'Kuda Bank',
        accountNumber: '2012745136',
        accountAlias: 'Your payout account',
        percentage: 85,
      },
    ],
    transactionFee: {
      amount: 1.5,
      deductFrom: 'all-accounts',
    },
  },
];

export const availableBanks = [
  'Kuda Bank',
  'Access Bank',
  'GTBank',
  'First Bank',
  'Zenith Bank',
  'UBA',
  'Fidelity Bank',
  'Sterling Bank',
  'FCMB',
  'Unity Bank',
];