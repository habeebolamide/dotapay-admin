import {
  PaymentRevenueStats,
  PaymentRevenueChart,
  WalletRevenueChart,
  RecentTransactions,
} from './components';

export function Demo1LightSidebarContent() {
  return (
    <div className="grid gap-5 lg:gap-7.5">
      {/* Revenue Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-7.5 items-stretch">
        <PaymentRevenueStats />
      </div>

      {/* Revenue Chart */}
      <div className="grid gap-5 lg:gap-7.5 items-stretch">
        <PaymentRevenueChart />
      </div>

      {/* Wallet Revenue Chart */}
      <div className="grid gap-5 lg:gap-7.5 items-stretch">
        <WalletRevenueChart />
      </div>

      {/* Recent Transactions */}
      {/* <div className="grid gap-5 lg:gap-7.5 items-stretch">
        <RecentTransactions />
      </div> */} 
    </div>
  );
}
