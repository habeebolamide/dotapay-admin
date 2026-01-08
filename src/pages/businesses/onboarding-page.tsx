import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Building2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { notify } from '@/lib/notifications';
import { TokenStorage } from '@/lib/token-storage';
import { businessService } from '@/services/business.service';
import { uploadService } from '@/services';
import { CreateBusinessRequest } from '@/types/business.types';

const DEFAULT_FORM: CreateBusinessRequest = {
  name: '',
  email: '',
  phone: '',
  address: '',
  logo: '',
  is_sandbox: true,
  webhook_url: '',
  webhook_sandbox_url: '',
};

export function BusinessOnboardingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState<CreateBusinessRequest>(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const redirectTarget = useMemo(() => {
    const nextParam = searchParams.get('next');
    if (!nextParam || nextParam === '/businesses') {
      return '/';
    }
    return nextParam;
  }, [searchParams]);

  useEffect(() => {
    const user = TokenStorage.getUser();
    if (user?.active_business_id) {
      navigate(redirectTarget, { replace: true });
    }
  }, [navigate, redirectTarget]);

  const handleChange = (field: keyof CreateBusinessRequest) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = event.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.name.trim() || !formData.email.trim()) {
      notify.validationError('Business name and email are required');
      return;
    }

    setLoading(true);
    try {
      const business = await businessService.createBusiness(formData);
      await businessService.switchBusiness({ business_id: business.id });
      TokenStorage.updateUser({ active_business_id: business.id });
      notify.success('Business created and activated');
      navigate(redirectTarget, { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create business';
      notify.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const imageUrl = await uploadService.uploadImage(file);
      setFormData((prev) => ({ ...prev, logo: imageUrl }));
      notify.success('Logo uploaded');
    } catch (error: any) {
      notify.error(error?.message || 'Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/40 flex items-center justify-center px-4">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="gap-4 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Building2 className="h-6 w-6" />
          </div>
          <CardTitle>Let&apos;s create your business</CardTitle>
          <CardDescription>
            You need at least one active business profile before accessing Dotapay. Provide the details below to get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="business-name">Business name</Label>
                <Input
                  id="business-name"
                  placeholder="Acme Inc"
                  value={formData.name}
                  onChange={handleChange('name')}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="business-email">Email</Label>
                <Input
                  id="business-email"
                  type="email"
                  placeholder="ops@acme.com"
                  value={formData.email}
                  onChange={handleChange('email')}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="business-phone">Phone</Label>
                <Input
                  id="business-phone"
                  type="tel"
                  placeholder="+234 701 234 5678"
                  value={formData.phone}
                  onChange={handleChange('phone')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="business-logo">Logo</Label>
                <Input
                  id="business-logo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  disabled={uploading}
                />
                {formData.logo && (
                  <p className="text-xs text-muted-foreground truncate">Uploaded: {formData.logo}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="business-address">Address</Label>
              <Textarea
                id="business-address"
                rows={3}
                placeholder="42 Broad Street, Lagos"
                value={formData.address}
                onChange={handleChange('address')}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="webhook-url">Production webhook URL</Label>
                <Input
                  id="webhook-url"
                  type="url"
                  placeholder="https://example.com/webhook"
                  value={formData.webhook_url}
                  onChange={handleChange('webhook_url')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="webhook-sandbox-url">Sandbox webhook URL</Label>
                <Input
                  id="webhook-sandbox-url"
                  type="url"
                  placeholder="https://sandbox.example.com/webhook"
                  value={formData.webhook_sandbox_url}
                  onChange={handleChange('webhook_sandbox_url')}
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="text-sm font-medium">Sandbox mode</p>
                <p className="text-sm text-muted-foreground">
                  Keep this on while testing payments. You can switch anytime.
                </p>
              </div>
              <Switch
                checked={Boolean(formData.is_sandbox)}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, is_sandbox: checked }))
                }
              />
            </div>

            <Button type="submit" disabled={loading || uploading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating business...
                </>
              ) : (
                'Create business'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
