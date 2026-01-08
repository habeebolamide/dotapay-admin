import { useEffect, useState } from 'react';
import {
  BriefcaseIcon,
  Check,
  Loader2,
  Plus,
  TriangleAlert,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { notify } from '@/lib/notifications';
import { TokenStorage } from '@/lib/token-storage';
import { businessService, uploadService } from '@/services';
import { useActiveBusinessId, useBusinesses, useSwitchBusiness } from '@/hooks/use-business';
import { Business, CreateBusinessRequest } from '@/types/business.types';
import { cn } from '@/lib/utils';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface BusinessSwitcherProps {
  fullWidth?: boolean;
  compact?: boolean;
}

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

function CreateBusinessDialog({ onCreated }: { onCreated: (business: Business) => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CreateBusinessRequest>(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const imageUrl = await uploadService.uploadImage(file);
      setForm((prev) => ({ ...prev, logo: imageUrl }));
      notify.success('Logo uploaded');
    } catch (error: any) {
      notify.error(error?.message || 'Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      notify.validationError('Business name and email are required');
      return;
    }

    try {
      setSubmitting(true);
      const business = await businessService.createBusiness(form);
      await businessService.switchBusiness({ business_id: business.id });
      TokenStorage.updateUser({ active_business_id: business.id });
      notify.success('Business created and activated');
      onCreated(business);
      setForm(DEFAULT_FORM);
      setOpen(false);
    } catch (error: any) {
      notify.error(error?.message || 'Failed to create business');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full justify-start" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add business
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create new business</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="business-name">Business name</Label>
              <Input
                id="business-name"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="business-email">Email</Label>
              <Input
                id="business-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="business-phone">Phone</Label>
              <Input
                id="business-phone"
                value={form.phone}
                onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="business-logo">Logo</Label>
              <Input id="business-logo" type="file" accept="image/*" onChange={handleFileChange} />
              {form.logo && (
                <p className="text-xs text-muted-foreground truncate">Uploaded: {form.logo}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="business-address">Address</Label>
            <Textarea
              id="business-address"
              rows={2}
              value={form.address}
              onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="webhook-url">Live webhook URL</Label>
              <Input
                id="webhook-url"
                type="url"
                value={form.webhook_url}
                onChange={(e) => setForm((prev) => ({ ...prev, webhook_url: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="webhook-sandbox-url">Sandbox webhook URL</Label>
              <Input
                id="webhook-sandbox-url"
                type="url"
                value={form.webhook_sandbox_url}
                onChange={(e) => setForm((prev) => ({ ...prev, webhook_sandbox_url: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Sandbox mode</p>
              <p className="text-xs text-muted-foreground">Keep on for testing. You can switch later.</p>
            </div>
            <Switch
              checked={Boolean(form.is_sandbox)}
              onCheckedChange={(checked) => setForm((prev) => ({ ...prev, is_sandbox: checked }))}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={submitting || uploading} className="w-full sm:w-auto">
              {(submitting || uploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create & activate
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function BusinessSwitcher({ fullWidth = false, compact = false }: BusinessSwitcherProps) {
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { data: businesses, isLoading, isFetching, refetch } = useBusinesses(searchTerm);
  const activeBusinessId = useActiveBusinessId();
  const [pendingBusinessId, setPendingBusinessId] = useState<number | null>(null);
  const { mutate: switchBusiness, isPending: switching } = useSwitchBusiness();
  const activeBusiness = businesses?.find((biz) => biz.id === activeBusinessId);
  const pendingBusiness = businesses?.find((biz) => biz.id === pendingBusinessId);
  const triggerLabel = switching
    ? pendingBusiness?.name
      ? `Switching to ${pendingBusiness.name}`
      : 'Switching...'
    : activeBusiness?.name || 'Select business';

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput.trim());
    }, 250);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleSwitch = (businessId: number) => {
    if (businessId === activeBusinessId || switching) return;
    setPendingBusinessId(businessId);
    switchBusiness(businessId, {
      onError: () => setPendingBusinessId(null),
      onSettled: () => setPendingBusinessId(null),
    });
  };

  return (
    <div className={cn('flex items-center', fullWidth && 'w-full')}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {compact ? (
            <Button variant="outline" mode="icon" size="sm" disabled={switching}>
              {switching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <BriefcaseIcon className="h-4 w-4" />
              )}
            </Button>
          ) : (
            <Button
              variant={fullWidth ? 'outline' : 'ghost'}
              className={cn('gap-2 px-2', fullWidth && 'w-full h-10 justify-start text-left')}
              size="sm"
              disabled={switching}
            >
              {switching ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              ) : (
                <BriefcaseIcon className="h-4 w-4" />
              )}
              <div className="flex flex-col text-left">
                <span className="text-xs text-muted-foreground">
                  {switching ? 'Switching' : 'Business'}
                </span>
                <span className="text-sm font-medium truncate max-w-[160px]">
                  {triggerLabel}
                </span>
              </div>
            </Button>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-72">
          <DropdownMenuLabel className="flex flex-col gap-2">
            <span>Businesses</span>
            <Input
              placeholder="Search businesses"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="h-9"
            />
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          <ScrollArea className="max-h-[420px]" viewportClassName="pr-1">
            {isLoading ? (
              <div className="flex items-center gap-2 px-2 py-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading businesses...
              </div>
            ) : businesses && businesses.length > 0 ? (
              businesses.map((biz) => (
                <DropdownMenuItem
                  key={biz.id}
                  onClick={() => handleSwitch(biz.id)}
                  disabled={switching || biz.id === activeBusinessId}
                  className="py-2"
                >
                  <div className="flex w-full items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{biz.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{biz.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={biz.is_sandbox ? 'info' : 'success'} appearance="light" size="xs">
                        {biz.is_sandbox ? 'Sandbox' : 'Live'}
                      </Badge>
                      {switching && pendingBusinessId === biz.id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      ) : (
                        biz.id === activeBusinessId && <Check className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  </div>
                </DropdownMenuItem>
              ))
            ) : (
              <div className="flex items-center gap-2 px-2 py-2 text-sm text-muted-foreground">
                <TriangleAlert className="h-4 w-4" />
                No businesses found
              </div>
            )}
            <ScrollBar orientation="vertical" />
          </ScrollArea>

          <DropdownMenuSeparator />

          <CreateBusinessDialog
            onCreated={(business) => {
              refetch();
              handleSwitch(business.id);
            }}
          />

          {(switching || isFetching) && (
            <DropdownMenuItem disabled className="text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />{' '}
                {switching ? 'Switching business...' : 'Refreshing...'}
              </span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
