'use client';

import { useState, useEffect } from 'react';
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
import { Edit2 } from 'lucide-react';
import { Customer, CreateCustomerRequest } from '@/types/customer.types';
import { notify } from '@/lib/notifications';
import { walletService } from '@/services/wallet.service';
import { Wallet } from '@/types/wallet.types';

interface EditCustomerModalProps {
  customer: Customer;
  onEditCustomer: (customerData: Partial<CreateCustomerRequest>) => void;
  trigger?: React.ReactNode;
}

export function EditCustomerModal({ customer, onEditCustomer, trigger }: EditCustomerModalProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<CreateCustomerRequest>>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    type: 'wallet',
    collection_wallet: '',
    wallet_id: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [walletsLoading, setWalletsLoading] = useState(false);
  const [walletsError, setWalletsError] = useState<string | null>(null);

  // Initialize form data when customer changes or modal opens
  useEffect(() => {
    if (customer && open) {
      setFormData({
        first_name: customer.first_name,
        last_name: customer.last_name,
        email: customer.email,
        phone: customer.phone || '',
        type: customer.type,
        collection_wallet: customer.collection_wallet || '',
        wallet_id: customer.wallet_id || customer.collection_wallet || '',
      });
    }
  }, [customer, open]);

  useEffect(() => {
    if (open && formData.type === 'collection') {
      loadWallets();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, formData.type]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.first_name || !formData.last_name) return;
    if (formData.type === 'collection' && !formData.collection_wallet) {
      setError('Please select a collection wallet');
      return;
    }

    setLoading(true);
    setError(null);

    const updatePromise = onEditCustomer(formData);

    notify.promise(updatePromise, {
      loading: 'Updating customer...',
      success: 'Customer updated successfully!',
      error: (err: any) => err?.message || 'Failed to update customer'
    });

    try {
      await updatePromise;
      setError(null);
      setOpen(false);
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to update customer';
      setError(errorMessage);
      console.error('Failed to update customer:', err);
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

  const isFormValid = formData.email && formData.first_name && formData.last_name;

  const hasChanges = () => {
    return (
      formData.first_name !== customer.first_name ||
      formData.last_name !== customer.last_name ||
      formData.email !== customer.email ||
      formData.phone !== (customer.phone || '') ||
      formData.type !== customer.type ||
      (formData.type === 'collection' && formData.collection_wallet !== customer.collection_wallet)
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Edit2 size={16} />
            Edit Customer
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Customer</DialogTitle>
          <DialogDescription>
            Update customer information
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
            disabled={!isFormValid || loading || !hasChanges()}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? 'Updating...' : 'Update Customer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
