import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useActiveBusinessId, useBusiness, useUpdateBusiness } from '@/hooks/use-business';

export function BusinessModeToggle() {
  const activeBusinessId = useActiveBusinessId();
  const { data: business, isLoading, isFetching } = useBusiness(activeBusinessId);
  const { mutate: updateBusiness, isPending } = useUpdateBusiness(activeBusinessId);

  if (!activeBusinessId) {
    return null;
  }

  const isSandbox = business?.is_sandbox ?? false;
  const processing = isLoading || isFetching || isPending;

  return (
    <div className="flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1">
      <span className="text-xs font-medium text-muted-foreground">Mode</span>
      <Badge
        variant={isSandbox ? 'info' : 'success'}
        appearance="light"
        size="sm"
        className="capitalize"
      >
        {isSandbox ? 'Sandbox' : 'Live'}
      </Badge>
      <Switch
        checked={isSandbox}
        disabled={processing || !business}
        onCheckedChange={(checked) => updateBusiness({ is_sandbox: checked })}
        aria-label="Toggle sandbox mode"
      />
      {processing && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
    </div>
  );
}
