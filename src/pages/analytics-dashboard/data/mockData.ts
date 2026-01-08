// Mock data for the payment dashboard

export const revenueData = [
  { date: "Jan", revenue: 245000, netRevenue: 238000, transactions: 12400 },
  { date: "Feb", revenue: 312000, netRevenue: 303000, transactions: 15600 },
  { date: "Mar", revenue: 289000, netRevenue: 280500, transactions: 14200 },
  { date: "Apr", revenue: 378000, netRevenue: 367000, transactions: 18900 },
  { date: "May", revenue: 425000, netRevenue: 412500, transactions: 21250 },
  { date: "Jun", revenue: 398000, netRevenue: 386000, transactions: 19900 },
  { date: "Jul", revenue: 456000, netRevenue: 442500, transactions: 22800 },
];

export const transactionVolumeData = [
  { date: "00:00", transactions: 120 },
  { date: "04:00", transactions: 80 },
  { date: "08:00", transactions: 450 },
  { date: "12:00", transactions: 890 },
  { date: "16:00", transactions: 1200 },
  { date: "20:00", transactions: 650 },
  { date: "23:00", transactions: 280 },
];

export const paymentTypeData = [
  { name: "Card", value: 45, amount: 2150000 },
  { name: "Transfer", value: 28, amount: 1340000 },
  { name: "USSD", value: 12, amount: 574000 },
  { name: "Wallet", value: 10, amount: 478000 },
  { name: "QR", value: 5, amount: 239000 },
];

export const bankPerformanceData = [
  { bank: "GTBank", successRate: 98.5, avgResponseTime: 1.2, transactions: 45000 },
  { bank: "Access", successRate: 96.8, avgResponseTime: 1.5, transactions: 38000 },
  { bank: "Zenith", successRate: 97.2, avgResponseTime: 1.3, transactions: 42000 },
  { bank: "UBA", successRate: 95.4, avgResponseTime: 1.8, transactions: 28000 },
  { bank: "FirstBank", successRate: 94.1, avgResponseTime: 2.1, transactions: 32000 },
];

export const customerBehaviorData = [
  { date: "Mon", newCustomers: 245, returningCustomers: 890 },
  { date: "Tue", newCustomers: 312, returningCustomers: 945 },
  { date: "Wed", newCustomers: 289, returningCustomers: 1020 },
  { date: "Thu", newCustomers: 378, returningCustomers: 1150 },
  { date: "Fri", newCustomers: 425, returningCustomers: 1280 },
  { date: "Sat", newCustomers: 198, returningCustomers: 720 },
  { date: "Sun", newCustomers: 156, returningCustomers: 580 },
];

export const reconciliationData = [
  { date: "01 Jul", settled: 125000, unsettled: 8500 },
  { date: "02 Jul", settled: 142000, unsettled: 12000 },
  { date: "03 Jul", settled: 118000, unsettled: 6200 },
  { date: "04 Jul", settled: 156000, unsettled: 9800 },
  { date: "05 Jul", settled: 178000, unsettled: 11200 },
  { date: "06 Jul", settled: 145000, unsettled: 7500 },
  { date: "07 Jul", settled: 162000, unsettled: 5800 },
];

export const transactionStatusData = [
  { name: "Successful", value: 94.5, count: 21250 },
  { name: "Failed", value: 3.2, count: 720 },
  { name: "Pending", value: 1.8, count: 405 },
  { name: "Reversed", value: 0.5, count: 112 },
];

export const channelData = [
  { channel: "Web", transactions: 12500, percentage: 55 },
  { channel: "Mobile", transactions: 7200, percentage: 32 },
  { channel: "API", transactions: 2950, percentage: 13 },
];

export const topCustomers = [
  { id: 1, name: "AL Hayat", transactions: 1250, value: 4500000 },
  { id: 2, name: "Rolak", transactions: 980, value: 3200000 },
];

export const kpiMetrics = {
  totalRevenue: 2503000,
  netRevenue: 2428000,
  totalTransactions: 22650,
  successRate: 94.5,
  avgTransactionValue: 110.5,
  refundRate: 1.2,
  revenueGrowth: 12.4,
  highestTransaction: 125000,
  newCustomers: 1850,
  avgProcessingTime: 1.4,
  webhookSuccessRate: 99.2,
  settlementRate: 96.8,
};
