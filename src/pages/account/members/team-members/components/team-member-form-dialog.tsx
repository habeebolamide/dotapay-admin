'use client';

import { useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Role } from '@/services/types/rbac.types';
import type { TeamMember } from '@/services/types/user-management.types';

type TeamMemberFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roles: Role[];
  isLoadingRoles?: boolean;
  initialMember: TeamMember | null;
  onSubmit: (payload: {
    name: string;
    email: string;
    role: string;
    password?: string;
    password_confirmation?: string;
  }) => Promise<void>;
};

export function TeamMemberFormDialog({
  open,
  onOpenChange,
  roles,
  isLoadingRoles,
  initialMember,
  onSubmit,
}: TeamMemberFormDialogProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [saving, setSaving] = useState(false);

  const isEditing = Boolean(initialMember);

  const defaultRole = useMemo(() => {
    if (initialMember?.roles?.length) return initialMember.roles[0];
    return roles.length > 0 ? roles[0].name : '';
  }, [initialMember?.roles, roles]);

  useEffect(() => {
    if (open) {
      setName(initialMember?.name ?? '');
      setEmail(initialMember?.email ?? '');
      setRole(defaultRole);
      setPassword('');
      setPasswordConfirmation('');
      setSaving(false);
    }
  }, [open, initialMember, defaultRole]);

  const passwordsRequired = !isEditing || password.length > 0 || passwordConfirmation.length > 0;
  const passwordsMatch = password === passwordConfirmation;

  const canSubmit =
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    role.length > 0 &&
    (!passwordsRequired || (password.length > 0 && passwordConfirmation.length > 0 && passwordsMatch)) &&
    !saving;

  const handleSubmit = async () => {
    try {
      setSaving(true);
      await onSubmit({
        name: name.trim(),
        email: email.trim(),
        role,
        ...(passwordsRequired
          ? { password, password_confirmation: passwordConfirmation }
          : {}),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Update team member' : 'Invite team member'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Edit the member details or adjust the role.'
              : 'Create a new teammate and assign the right role for access.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground" htmlFor="member-name">
                Full name
              </label>
              <Input
                id="member-name"
                placeholder="e.g. Julius Idowu"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground" htmlFor="member-email">
                Email
              </label>
              <Input
                id="member-email"
                type="email"
                placeholder="julius.idowu@dotapay.ng"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Role</label>
            <Select value={role} onValueChange={setRole} disabled={isLoadingRoles || roles.length === 0}>
              <SelectTrigger>
                <SelectValue placeholder={isLoadingRoles ? 'Fetching roles...' : 'Select role'} />
              </SelectTrigger>
              <SelectContent>
                {roles.map((item) => (
                  <SelectItem key={item.id} value={item.name}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!isLoadingRoles && roles.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No roles available yet. Create a role first to invite members.
              </p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground" htmlFor="member-password">
                Password {isEditing ? <span className="text-muted-foreground">(optional)</span> : '*'}
              </label>
              <Input
                id="member-password"
                type="password"
                placeholder="StrongPass123"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label
                className="text-sm font-medium text-muted-foreground"
                htmlFor="member-password-confirmation"
              >
                Confirm password {isEditing ? <span className="text-muted-foreground">(optional)</span> : '*'}
              </label>
              <Input
                id="member-password-confirmation"
                type="password"
                placeholder="StrongPass123"
                value={passwordConfirmation}
                onChange={(event) => setPasswordConfirmation(event.target.value)}
              />
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            {isEditing
              ? 'Leave the password fields blank to keep the existing password.'
              : 'Set a strong password for the new member.'}
          </p>
          {passwordsRequired && !passwordsMatch && (
            <p className="text-xs text-destructive">Passwords must match before saving.</p>
          )}
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
              'Save member'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
