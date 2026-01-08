import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

export const AccountOptionsSettings = () => {
  const [transactionCharge, setTransactionCharge] = useState(false);
  const [transferPayment, setTransferPayment] = useState(false);
  const [cardPayment, setCardPayment] = useState(false);
  const [qrCheckout, setQrCheckout] = useState(false);
  const [emailNotificationCustomer, setEmailNotificationCustomer] = useState(false);
  const [emailNotificationMerchant, setEmailNotificationMerchant] = useState(false);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [settlementMode, setSettlementMode] = useState('WALLET');
  const [settlementInterval, setSettlementInterval] = useState('INSTANT');

  return (
    <Card className="pb-2.5">
      <CardHeader id="account_options">
        <CardTitle>Account Options</CardTitle>
        <p className="text-sm text-muted-foreground">
          Configure your account preferences and payment settings
        </p>
      </CardHeader>
      <CardContent className="grid gap-5">
        <div className="bg-muted/50 p-4 rounded-lg border">
          <h3 className="text-sm font-medium mb-4 uppercase text-muted-foreground">Payment</h3>
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="transaction_charge" className="text-sm font-normal">
                  Enable transaction charge on customer
                </Label>
              </div>
              <Switch
                id="transaction_charge"
                checked={transactionCharge}
                onCheckedChange={setTransactionCharge}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="transfer_payment" className="text-sm font-normal">
                  Enable Transfer Payment
                </Label>
              </div>
              <Switch
                id="transfer_payment"
                checked={transferPayment}
                onCheckedChange={setTransferPayment}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="card_payment" className="text-sm font-normal">
                  Enable Card Payment
                </Label>
              </div>
              <Switch
                id="card_payment"
                checked={cardPayment}
                onCheckedChange={setCardPayment}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="qr_checkout" className="text-sm font-normal">
                  QR to Checkout
                </Label>
              </div>
              <Switch
                id="qr_checkout"
                checked={qrCheckout}
                onCheckedChange={setQrCheckout}
              />
            </div>
          </div>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg border">
          <h3 className="text-sm font-medium mb-4 uppercase text-muted-foreground">Account</h3>
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email_notification_customer" className="text-sm font-normal">
                  Enable Email Notification For Customer
                </Label>
              </div>
              <Switch
                id="email_notification_customer"
                checked={emailNotificationCustomer}
                onCheckedChange={setEmailNotificationCustomer}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email_notification_merchant" className="text-sm font-normal">
                  Enable Email Notification Merchant
                </Label>
              </div>
              <Switch
                id="email_notification_merchant"
                checked={emailNotificationMerchant}
                onCheckedChange={setEmailNotificationMerchant}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="two_factor_auth" className="text-sm font-normal">
                  Enable Two Factor Authentication
                </Label>
              </div>
              <Switch
                id="two_factor_auth"
                checked={twoFactorAuth}
                onCheckedChange={setTwoFactorAuth}
              />
            </div>
          </div>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg border">
          <h3 className="text-sm font-medium mb-4 uppercase text-muted-foreground">Settlement</h3>
          <div className="grid gap-4">
            <div className="w-full">
              <div className="flex flex-col gap-2.5">
                <Label htmlFor="settlement_mode">Settlement Mode</Label>
                <Select value={settlementMode} onValueChange={setSettlementMode}>
                  <SelectTrigger id="settlement_mode">
                    <SelectValue placeholder="Select settlement mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WALLET">WALLET</SelectItem>
                    <SelectItem value="BANK">BANK</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="w-full">
              <div className="flex flex-col gap-2.5">
                <Label htmlFor="settlement_interval">Settlement Interval</Label>
                <Select value={settlementInterval} onValueChange={setSettlementInterval}>
                  <SelectTrigger id="settlement_interval">
                    <SelectValue placeholder="Select interval" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INSTANT">INSTANT</SelectItem>
                    <SelectItem value="DAILY">DAILY</SelectItem>
                    <SelectItem value="WEEKLY">WEEKLY</SelectItem>
                    <SelectItem value="MONTHLY">MONTHLY</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-2.5 border-t">
          <Button variant="outline">Cancel</Button>
          <Button>Save Changes</Button>
        </div>
      </CardContent>
    </Card>
  );
};
