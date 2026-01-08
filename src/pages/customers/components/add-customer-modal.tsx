'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { CreateCustomerRequest } from '@/types/customer.types';
import { notify } from '@/lib/notifications';
import { walletService } from '@/services/wallet.service';
import { Wallet } from '@/types/wallet.types';

interface AddCustomerModalProps {
  onAddCustomer: (customer: CreateCustomerRequest) => void;
}

export function AddCustomerModal({ onAddCustomer }: AddCustomerModalProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<CreateCustomerRequest>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    type: 'wallet',
    reference: '',
    collection_wallet: '',
    wallet_id: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [walletsLoading, setWalletsLoading] = useState(false);
  const [walletsError, setWalletsError] = useState<string | null>(null);

  const loadWallets = async () => {
    if (walletsLoading || wallets.length > 0) return;
    try {
      setWalletsLoading(true);
      setWalletsError(null);
      const response = await walletService.getBusinessWallets({ per_page: 50, page: 1 });
      setWallets(response.data || []);
    } catch (err: any) {
      const message = err?.message || 'Unable to load wallets';
      setWalletsError(message);
      notify.error(message);
    } finally {
      setWalletsLoading(false);
    }
  };

  useEffect(() => {
    if (open && formData.type === 'collection') {
      loadWallets();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, formData.type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.first_name || !formData.last_name || !formData.reference) return;
    if (formData.type === 'collection' && !formData.collection_wallet) {
      setError('Please select a collection wallet');
      return;
    }

    setLoading(true);
    setError(null);

    const customerPromise = onAddCustomer(formData);

    notify.promise(customerPromise, {
      loading: 'Creating customer...',
      success: 'Customer created successfully!',
      error: (err: any) => err?.message || 'Failed to create customer'
    });

    try {
      await customerPromise;
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        type: 'wallet',
        reference: '',
        collection_wallet: '',
        wallet_id: '',
      });
      setError(null);
      setOpen(false);
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to add customer';
      setError(errorMessage);
      console.error('Failed to add customer:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateCustomerRequest) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleTypeChange = (value: 'wallet' | 'collection') => {
    setFormData(prev => ({
      ...prev,
      type: value,
      collection_wallet: value === 'collection' ? prev.collection_wallet : '',
      wallet_id: value === 'collection' ? prev.wallet_id : '',
    }));
  };

  const handleWalletChange = (walletSlug: string) => {
    setFormData(prev => ({ ...prev, collection_wallet: walletSlug, wallet_id: walletSlug }));
  };

  const requiresWallet = formData.type === 'collection';
  const isFormValid =
    formData.email &&
    formData.first_name &&
    formData.last_name &&
    formData.reference &&
    (!requiresWallet || formData.collection_wallet);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700 text-white">
          <Plus size={16} />
          Add Customer
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Customer</DialogTitle>
          <DialogDescription>
            Add a new customer to your database
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                type="text"
                placeholder="John"
                value={formData.first_name}
                onChange={handleInputChange('first_name')}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Doe"
                value={formData.last_name}
                onChange={handleInputChange('last_name')}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="customer@example.com"
                value={formData.email}
                onChange={handleInputChange('email')}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+234 800 000 0000"
                value={formData.phone}
                onChange={handleInputChange('phone')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reference">Reference *</Label>
              <Input
                id="reference"
                type="text"
                placeholder="CUST2025-002"
                value={formData.reference}
                onChange={handleInputChange('reference')}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select value={formData.type} onValueChange={handleTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select customer type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wallet">Wallet</SelectItem>
                  <SelectItem value="collection">Collection</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.type === 'collection' && (
              <div className="space-y-2">
                <Label htmlFor="collection_wallet">Collection Wallet *</Label>
                <Select
                  value={formData.collection_wallet || ''}
                  onValueChange={handleWalletChange}
                  disabled={walletsLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={walletsLoading ? 'Loading wallets...' : 'Select wallet'} />
                  </SelectTrigger>
                  <SelectContent>
                    {wallets.map((wallet) => (
                      <SelectItem key={wallet.slug} value={wallet.slug}>
                        {wallet.name} ({wallet.slug})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {walletsError && <p className="text-xs text-destructive">{walletsError}</p>}
              </div>
            )}
          </form>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid || loading}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {loading ? 'Adding...' : 'Add Customer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
