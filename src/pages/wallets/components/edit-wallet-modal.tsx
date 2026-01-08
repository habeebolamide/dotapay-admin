'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Pencil } from 'lucide-react';
import { UpdateWalletRequest, Wallet } from '@/types/wallet.types';

interface EditWalletModalProps {
  wallet: Wallet | null;
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onUpdate: (data: UpdateWalletRequest) => Promise<void>;
}

export function EditWalletModal({ wallet, open, loading, onClose, onUpdate }: EditWalletModalProps) {
  const [walletName, setWalletName] = useState('');

  useEffect(() => {
    if (wallet) {
      setWalletName(wallet.name);
    } else {
      setWalletName('');
    }
  }, [wallet, open]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!wallet || !walletName.trim()) return;

    try {
      await onUpdate({ name: walletName.trim() });
    } catch (error) {
      console.error('Failed to update wallet:', error);
    }
  };

  const isFormValid = walletName.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Wallet</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editWalletName">Wallet name</Label>
              <Input
                id="editWalletName"
                type="text"
                placeholder="Update wallet name"
                value={walletName}
                onChange={(event) => setWalletName(event.target.value)}
                required
              />
              <p className="text-sm text-muted-foreground">
                Update the display name for this wallet.
              </p>
            </div>
          </form>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isFormValid || loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Pencil className="w-4 h-4 mr-2" />
                Update Wallet
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
