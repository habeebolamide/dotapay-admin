'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogBody,
  DialogContent,
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
import { CreateSubAccountRequest } from '@/types/transaction-split.types';
import { availableBanks } from '@/data/transaction-splits';

interface NewSubaccountModalProps {
  onCreateSubaccount: (data: CreateSubAccountRequest) => void;
  trigger?: React.ReactNode;
}

export function NewSubaccountModal({ onCreateSubaccount, trigger }: NewSubaccountModalProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<CreateSubAccountRequest>({
    bankName: '',
    accountNumber: '',
    accountAlias: '',
  });
  const [loading, setLoading] = useState(false);
  const [accountHolderName, setAccountHolderName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.bankName || !formData.accountNumber || !formData.accountAlias) return;

    setLoading(true);
    try {
      await onCreateSubaccount(formData);
      setFormData({ bankName: '', accountNumber: '', accountAlias: '' });
      setAccountHolderName('');
      setOpen(false);
    } catch (error) {
      console.error('Failed to create subaccount:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateSubAccountRequest) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleBankChange = (value: string) => {
    setFormData(prev => ({ ...prev, bankName: value }));
  };

  const handleAccountNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, accountNumber: value }));

    // Simulate account name lookup
    if (value.length === 10) {
      // Mock account name lookup
      setTimeout(() => {
        setAccountHolderName('OGEGBO, CHRISTOPHER OLUWADEMILADE');
      }, 500);
    } else {
      setAccountHolderName('');
    }
  };

  const isFormValid = formData.bankName && formData.accountNumber.length === 10 && formData.accountAlias;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <Plus size={16} />
            New Subaccount
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New Subaccount</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bankName">Bank name</Label>
              <Select value={formData.bankName} onValueChange={handleBankChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Kuda Bank" />
                </SelectTrigger>
                <SelectContent>
                  {availableBanks.map((bank) => (
                    <SelectItem key={bank} value={bank}>
                      {bank}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountNumber">Bank account number</Label>
              <Input
                id="accountNumber"
                type="text"
                placeholder="Account number"
                value={formData.accountNumber}
                onChange={handleAccountNumberChange}
                maxLength={10}
                required
              />
              {accountHolderName && (
                <p className="text-sm text-muted-foreground">{accountHolderName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountAlias">Account alias</Label>
              <Input
                id="accountAlias"
                type="text"
                placeholder="Account alias"
                value={formData.accountAlias}
                onChange={handleInputChange('accountAlias')}
                required
              />
            </div>
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
            {loading ? 'Creating...' : 'Create and add to group'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}