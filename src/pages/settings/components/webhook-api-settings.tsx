import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Copy, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { BUSINESS_QUERY_KEYS, useActiveBusiness, useUpdateBusiness } from '@/hooks/use-business';
import { businessService } from '@/services/business.service';

export const WebhookApiSettings = () => {
  const { data: activeBusiness, isLoading } = useActiveBusiness();
  const queryClient = useQueryClient();
  const { mutateAsync: updateBusiness, isPending } = useUpdateBusiness(activeBusiness?.id);

  const [merchantId, setMerchantId] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookSandboxUrl, setWebhookSandboxUrl] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (activeBusiness) {
      setMerchantId(activeBusiness.code ?? '');
      setPublicKey(activeBusiness.public_key ?? '');
      setPrivateKey(activeBusiness.private_key ?? '');
      setWebhookUrl(activeBusiness.webhook_url ?? '');
      setWebhookSandboxUrl(activeBusiness.webhook_sandbox_url ?? '');
    }
  }, [activeBusiness]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const handleGenerateNewKey = async () => {
    const confirmed = window.confirm(
      'Generating a new private key requires updating your integrations. Continue?',
    );

    if (!confirmed) return;

    try {
      setGenerating(true);
      await businessService.regenerateApiKeys();
      toast.success('New private key generated');
      await queryClient.invalidateQueries({ queryKey: BUSINESS_QUERY_KEYS.active });
    } catch (error: any) {
      const message = error?.message || 'Failed to regenerate private key';
      toast.error(message);
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    try {
      await updateBusiness({
        webhook_url: webhookUrl || undefined,
        webhook_sandbox_url: webhookSandboxUrl || undefined,
      });
      toast.success('Webhook settings updated');
    } catch (error: any) {
      const message = error?.message || 'Failed to update webhook settings';
      toast.error(message);
    }
  };

  const handleReset = () => {
    if (!activeBusiness) return;
    setWebhookUrl(activeBusiness.webhook_url ?? '');
    setWebhookSandboxUrl(activeBusiness.webhook_sandbox_url ?? '');
  };

  return (
    <Card className="pb-2.5">
      <CardHeader id="webhook_api">
        <CardTitle>Webhook & API</CardTitle>
        <p className="text-sm text-muted-foreground">
          Manage your API credentials and webhook settings
        </p>
      </CardHeader>
      <CardContent className="grid gap-5">
        <div className="bg-muted/50 p-4 rounded-lg border">
          <h3 className="text-sm font-medium mb-4">API Key</h3>
          <div className="grid gap-4">
            <div className="w-full">
              <div className="flex flex-col gap-2.5">
                <Label htmlFor="merchant_id">Merchant Id</Label>
                <div className="flex gap-2">
                  <Input
                    id="merchant_id"
                    type="text"
                    value={merchantId}
                    readOnly
                    className="bg-background"
                    disabled={isLoading}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopy(merchantId, 'Merchant ID')}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="w-full">
              <div className="flex flex-col gap-2.5">
                <Label htmlFor="public_key">Public key</Label>
                <div className="flex gap-2">
                  <Input
                    id="public_key"
                    type="text"
                    value={publicKey}
                    readOnly
                    className="bg-background"
                    disabled={isLoading}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopy(publicKey, 'Public key')}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="w-full">
              <div className="flex flex-col gap-2.5">
                <Label htmlFor="private_key">Private key</Label>
                <div className="flex gap-2">
                  <Input
                    id="private_key"
                    type={showPrivateKey ? 'text' : 'password'}
                    value={privateKey}
                    readOnly
                    className="bg-background"
                    disabled={isLoading}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowPrivateKey(!showPrivateKey)}
                  >
                    {showPrivateKey ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopy(privateKey, 'Private key')}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" size="sm" onClick={() => window.open('https://docs.dotapay.ng', '_blank')}>
              API Documentation
            </Button>
            <Button variant="outline" size="sm">
              Transfer Simulator
            </Button>
            <Button variant="primary" size="sm" onClick={handleGenerateNewKey} disabled={generating}>
              <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
              {generating ? 'Generating…' : 'Generate new private key'}
            </Button>
          </div>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg border">
          <h3 className="text-sm font-medium mb-4">Webhook Urls</h3>
          <div className="grid gap-4">
            <div className="w-full">
              <div className="flex flex-col gap-2.5">
                <Label htmlFor="webhook_url">Live Webhook Url</Label>
                <Input
                  id="webhook_url"
                  type="url"
                  placeholder="https://example.com/webhook"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="w-full">
              <div className="flex flex-col gap-2.5">
                <Label htmlFor="webhook_sandbox_url">Sandbox Webhook Url</Label>
                <Input
                  id="webhook_sandbox_url"
                  type="url"
                  placeholder="https://sandbox.example.com/webhook"
                  value={webhookSandboxUrl}
                  onChange={(e) => setWebhookSandboxUrl(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
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
