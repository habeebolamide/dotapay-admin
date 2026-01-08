'use client';

import { useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import type { Permission, Role } from '@/services/types/rbac.types';

type RoleFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  permissions: Permission[];
  isLoading: boolean;
  error: string | null;
  initialRole: Role | null;
  onSubmit: (payload: { name: string; description?: string | null; permissions: string[] }) => Promise<void>;
};

export function RoleFormDialog({
  open,
  onOpenChange,
  permissions,
  isLoading,
  error,
  initialRole,
  onSubmit,
}: RoleFormDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName(initialRole?.name ?? '');
      setDescription(initialRole?.description ?? '');
      setSelectedPermissions(initialRole?.permissions.map((perm) => perm.name) ?? []);
      setSaving(false);
    }
  }, [open, initialRole]);

  const permissionGroups = useMemo(() => {
    const grouped: Record<string, Permission[]> = {};
    permissions.forEach((permission) => {
      const [group] = permission.name.split('.');
      if (!grouped[group]) {
        grouped[group] = [];
      }
      grouped[group].push(permission);
    });
    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
  }, [permissions]);

  const allPermissionNames = useMemo(() => permissions.map((permission) => permission.name), [permissions]);

  const togglePermission = (permissionName: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionName)
        ? prev.filter((name) => name !== permissionName)
        : [...prev, permissionName]
    );
  };

  const toggleAllPermissions = (checked: boolean | 'indeterminate') => {
    if (checked) {
      setSelectedPermissions(allPermissionNames);
    } else {
      setSelectedPermissions([]);
    }
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      await onSubmit({
        name: name.trim(),
        description: description.trim() || undefined,
        permissions: selectedPermissions,
      });
    } finally {
      setSaving(false);
    }
  };

  const canSubmit =
    name.trim().length > 0 &&
    selectedPermissions.length > 0 &&
    !saving &&
    !isLoading &&
    !error;

  const allSelected = allPermissionNames.length > 0 && allPermissionNames.every((name) => selectedPermissions.includes(name));
  const someSelected = !allSelected && selectedPermissions.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{initialRole ? 'Edit Role' : 'Create Role'}</DialogTitle>
          <DialogDescription>
            {initialRole
              ? 'Update the role details and adjust the permissions as needed.'
              : 'Define a new role and assign permissions to control workspace access.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground" htmlFor="role-name">
                Role name
              </label>
              <Input
                id="role-name"
                placeholder="e.g. Finance Manager"
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground" htmlFor="role-description">
                Role description
              </label>
              <Textarea
                id="role-description"
                placeholder="Summarise the responsibilities for this role"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={3}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Assign permissions <span className="text-destructive">*</span>
            </label>
            {isLoading ? (
              <div className="flex h-36 items-center justify-center text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Fetching available permissions...
              </div>
            ) : error ? (
              <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
                {error}
              </div>
            ) : (
              <ScrollArea className="h-72 rounded-md border border-border p-3">
                <div className="mb-4 flex items-center gap-3 rounded-md border border-border/70 bg-muted/30 px-2.5 py-2">
                  <Checkbox
                    checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                    onCheckedChange={toggleAllPermissions}
                    className="mt-0.5"
                  />
                  <div>
                    <p className="text-sm font-semibold leading-snug">Select all permissions</p>
                    <p className="text-xs text-muted-foreground">
                      Quickly assign or remove every permission for this role.
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  {permissionGroups.map(([group, items]) => (
                    <div key={group} className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {group.replace(/[-_.]/g, ' ')}
                      </p>
                      <div className="space-y-1.5">
                        {items.map((permission) => (
                          <label
                            key={permission.id}
                            className="flex cursor-pointer items-start gap-3 rounded-md border border-transparent px-2 py-1.5 transition hover:border-border/80"
                          >
                            <Checkbox
                              checked={selectedPermissions.includes(permission.name)}
                              onCheckedChange={() => togglePermission(permission.name)}
                              className="mt-0.5"
                            />
                            <div>
                              <p className="text-sm font-medium leading-snug">{permission.name}</p>
                              {permission.description && (
                                <p className="text-xs text-muted-foreground">{permission.description}</p>
                              )}
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving
              </>
            ) : (
              'Save Role'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
