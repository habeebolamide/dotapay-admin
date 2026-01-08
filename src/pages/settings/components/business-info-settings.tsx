import { useEffect, useState } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useActiveBusiness, useUpdateBusiness } from '@/hooks/use-business';

export const BusinessInfoSettings = () => {
  const { data: activeBusiness, isLoading } = useActiveBusiness();
  const { mutateAsync: updateBusiness, isPending } = useUpdateBusiness(activeBusiness?.id);

  const [businessName, setBusinessName] = useState('');
  const [businessShortName, setBusinessShortName] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');
  const [businessWebsite, setBusinessWebsite] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');

  useEffect(() => {
    if (activeBusiness) {
      setBusinessName(activeBusiness.name ?? '');
      setBusinessShortName(activeBusiness.code ?? '');
      setBusinessEmail(activeBusiness.email ?? '');
      setBusinessPhone(activeBusiness.phone ?? '');
      setBusinessAddress(activeBusiness.address ?? '');
    }
  }, [activeBusiness]);

  const handleReset = () => {
    if (!activeBusiness) return;
    setBusinessName(activeBusiness.name ?? '');
    setBusinessShortName(activeBusiness.code ?? '');
    setBusinessEmail(activeBusiness.email ?? '');
    setBusinessPhone(activeBusiness.phone ?? '');
    setBusinessAddress(activeBusiness.address ?? '');
    setBusinessWebsite('');
  };

  const handleSave = async () => {
    await updateBusiness({
      name: businessName.trim() || activeBusiness?.name,
      email: businessEmail.trim() || activeBusiness?.email,
      phone: businessPhone || undefined,
      address: businessAddress || undefined,
    });
  };

  return (
    <Card className="pb-2.5">
      <CardHeader id="business_info">
        <CardTitle>Business Information</CardTitle>
        <p className="text-sm text-muted-foreground">
          Tell us a little about your business
        </p>
      </CardHeader>
      <CardContent className="grid gap-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="w-full">
            <div className="flex flex-col gap-2.5">
              <Label htmlFor="business_name">Business Name</Label>
              <Input
                id="business_name"
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
          <div className="w-full">
            <div className="flex flex-col gap-2.5">
              <Label htmlFor="business_short_name">Business Short Name</Label>
              <Input
                id="business_short_name"
                type="text"
                placeholder="Optional"
                value={businessShortName}
                onChange={(e) => setBusinessShortName(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="w-full">
            <div className="flex flex-col gap-2.5">
              <Label htmlFor="business_email">Business Email</Label>
              <Input
                id="business_email"
                type="email"
                placeholder="business@example.com"
                value={businessEmail}
                onChange={(e) => setBusinessEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
          <div className="w-full">
            <div className="flex flex-col gap-2.5">
              <Label htmlFor="business_phone">Business Phone No</Label>
              <Input
                id="business_phone"
                type="tel"
                value={businessPhone}
                onChange={(e) => setBusinessPhone(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>
        <div className="w-full">
          <div className="flex flex-col gap-2.5">
            <Label htmlFor="business_website">Business Website (Optional)</Label>
              <Input
                id="business_website"
                type="url"
                placeholder="https://example.com"
                value={businessWebsite}
                onChange={(e) => setBusinessWebsite(e.target.value)}
                disabled={isLoading}
              />
          </div>
        </div>
        <div className="w-full">
          <div className="flex flex-col gap-2.5">
            <Label htmlFor="business_address">Business Address</Label>
            <Textarea
              id="business_address"
              rows={3}
              placeholder="Enter your business address"
              value={businessAddress}
              onChange={(e) => setBusinessAddress(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>
        <div className="w-full">
          <div className="flex flex-col gap-2.5">
            <Label htmlFor="business_logo">Business Icons (Supported format. jpg*png*jpeg*svg)</Label>
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-32 h-32 border-2 border-dashed rounded-lg bg-muted/50">
                <Upload className="w-8 h-8 text-muted-foreground" />
              </div>
              <div className="flex flex-col gap-2">
                <Button variant="outline">Upload Image</Button>
                <Button variant="ghost" size="sm">Reset</Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Supported format. jpg*png*jpeg*svg
            </p>
          </div>
        </div>
        <div className="flex justify-between items-center pt-2.5 border-t">
          <Button variant="outline" onClick={handleReset} disabled={isPending || isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isPending || isLoading}>
            {isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
