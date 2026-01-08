export interface PaystackBank {
  id: number;
  name: string;
  slug: string;
  code: string;
  longcode: string;
  gateway: string | null;
  pay_with_bank: boolean;
  supports_transfer: boolean;
  available_for_direct_debit: boolean;
  active: boolean;
  country: string;
  currency: string;
  type: string;
  is_deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaystackBanksResponse {
  status: boolean;
  message: string;
  data: PaystackBank[];
}

class PaystackService {
  private baseUrl = 'https://api.paystack.co';

  async getBanks(): Promise<PaystackBank[]> {
    try {
      const response = await fetch(`${this.baseUrl}/bank`);
      if (!response.ok) {
        throw new Error('Failed to fetch banks');
      }
      const result: PaystackBanksResponse = await response.json();
      return result.data.filter(bank => bank.active && !bank.is_deleted);
    } catch (error) {
      console.error('Error fetching banks:', error);
      throw error;
    }
  }
}

export const paystackService = new PaystackService();
