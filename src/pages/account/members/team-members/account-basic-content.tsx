'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Search, ShieldCheck, ShieldQuestion, Trash2, UserCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardHeading, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Permission, Role } from '@/services/types/rbac.types';
import type { TeamMember } from '@/services/types/user-management.types';
import { rbacService } from '@/services/rbac.service';
import { userManagementService } from '@/services/user-management.service';
import { TeamMemberFormDialog } from './components/team-member-form-dialog';
import { RoleFormDialog } from './components/role-form-dialog';

type FetchState<T> = {
  loading: boolean;
  error: string | null;
  data: T;
};

const initialRolesState: FetchState<Role[]> = {
  loading: true,
  error: null,
  data: [],
};

const initialPermissionsState: FetchState<Permission[]> = {
  loading: true,
  error: null,
  data: [],
};

const initialMembersState: FetchState<TeamMember[]> = {
  loading: true,
  error: null,
  data: [],
};

export function AccountTeamMembersContent() {
  return (
    <Tabs defaultValue="roles" className="space-y-6">
      <TabsList variant="line" className="justify-between px-4 md:px-5">
        <div className="flex items-center gap-5">
          <TabsTrigger value="roles">Roles &amp; Permissions</TabsTrigger>
          <TabsTrigger value="members">Team Members</TabsTrigger>
        </div>
      </TabsList>

      <TabsContent value="roles" className="space-y-6">
        <RolesPermissionsPanel />
      </TabsContent>

      <TabsContent value="members" className="space-y-6">
        <TeamMembersPanel />
      </TabsContent>
    </Tabs>
  );
}

function RolesPermissionsPanel() {
  const [rolesState, setRolesState] = useState(initialRolesState);
  const [permissionsState, setPermissionsState] = useState(initialPermissionsState);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchRoles = useCallback(async () => {
    try {
      if (!isRefreshing) {
        setRolesState((prev) => ({ ...prev, loading: true, error: null }));
      }
      const response = await rbacService.getRoles();
      setRolesState({ loading: false, error: null, data: response.data });
      if (!selectedRoleId && response.data.length > 0) {
        setSelectedRoleId(response.data[0].id);
      }
    } catch (error: any) {
      setRolesState((prev) => ({
        ...prev,
        loading: false,
        error: error?.message || 'Unable to load roles',
      }));
    } finally {
      setIsRefreshing(false);
    }
  }, [selectedRoleId, isRefreshing]);

  const fetchPermissions = useCallback(async () => {
    try {
      setPermissionsState((prev) => ({ ...prev, loading: true, error: null }));
      const response = await rbacService.getPermissions();
      setPermissionsState({ loading: false, error: null, data: response.data });
    } catch (error: any) {
      setPermissionsState((prev) => ({
        ...prev,
        loading: false,
        error: error?.message || 'Unable to load permissions',
      }));
    }
  }, []);

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, [fetchRoles, fetchPermissions]);

  const filteredRoles = useMemo(() => {
    if (!searchTerm.trim()) return rolesState.data;
    const lower = searchTerm.toLowerCase();
    return rolesState.data.filter(
      (role) =>
        role.name.toLowerCase().includes(lower) ||
        role.description?.toLowerCase().includes(lower) ||
        role.permissions.some((permission) => permission.name.toLowerCase().includes(lower))
    );
  }, [rolesState.data, searchTerm]);

  const selectedRole = useMemo(
    () => rolesState.data.find((role) => role.id === selectedRoleId) ?? null,
    [rolesState.data, selectedRoleId]
  );

  const handleOpenCreate = () => {
    setEditingRole(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (role: Role) => {
    setEditingRole(role);
    setIsFormOpen(true);
  };

  const handleSubmitRole = async (payload: { name: string; description?: string | null; permissions: string[] }) => {
    try {
      if (editingRole) {
        await rbacService.updateRole(editingRole.id, payload);
        toast.success('Role updated successfully');
      } else {
        await rbacService.createRole(payload);
        toast.success('Role created successfully');
      }
      setIsFormOpen(false);
      setIsRefreshing(true);
      await fetchRoles();
    } catch (error: any) {
      toast.error(error?.message || 'Unable to save role');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardHeading className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Roles</CardTitle>
              <p className="text-sm text-muted-foreground">
                Create roles and assign permissions to control your workspace.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search roles"
                  className="h-auto border-0 bg-transparent p-0 focus-visible:ring-0"
                />
              </div>
              <Button onClick={handleOpenCreate}>
                <Plus className="mr-2 h-4 w-4" />
                New Role
              </Button>
            </div>
          </CardHeading>
        </CardHeader>
        <CardContent>
          {rolesState.loading && !isRefreshing ? (
            <div className="flex h-48 items-center justify-center text-muted-foreground">
              Loading roles...
            </div>
          ) : rolesState.error ? (
            <div className="flex h-48 flex-col items-center justify-center gap-3 text-center">
              <ShieldQuestion className="h-10 w-10 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">{rolesState.error}</p>
                <Button variant="outline" size="sm" className="mt-2" onClick={fetchRoles}>
                  Try Again
                </Button>
              </div>
            </div>
          ) : filteredRoles.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center gap-3 text-center">
              <ShieldCheck className="h-10 w-10 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">No roles found</p>
                <p className="text-xs text-muted-foreground">Try adjusting your search or create a new role.</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-[1.2fr,1fr]">
              <div className="space-y-2">
                {filteredRoles.map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setSelectedRoleId(role.id)}
                    className={cn(
                      'w-full rounded-lg border px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
                      selectedRoleId === role.id
                        ? 'border-primary/60 bg-primary/5'
                        : 'border-border hover:border-primary/40 hover:bg-muted/40'
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold leading-snug line-clamp-1">{role.name}</p>
                        {role.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{role.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {role.permissions.length} permissions
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleOpenEdit(role);
                          }}
                        >
                          Edit
                        </Button>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <Card className="border border-border">
                <CardHeader>
                  <CardHeading>
                    <CardTitle className="text-base">Role details</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Review assigned permissions and manage membership.
                    </p>
                  </CardHeading>
                </CardHeader>
                <CardContent>
                  {!selectedRole ? (
                    <div className="flex h-56 flex-col items-center justify-center gap-3 text-center text-muted-foreground">
                      <UserCircle2 className="h-10 w-10" />
                      <p className="text-sm">Select a role to view its permissions.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground uppercase">Role name</p>
                        <p className="text-base font-semibold">{selectedRole.name}</p>
                        {selectedRole.description && (
                          <p className="mt-1 text-sm text-muted-foreground">{selectedRole.description}</p>
                        )}
                      </div>

                      <div>
                        <p className="text-sm font-medium text-muted-foreground uppercase">Permissions</p>
                        {selectedRole.permissions.length === 0 ? (
                          <p className="mt-2 text-sm text-muted-foreground">
                            This role has no permissions yet.
                          </p>
                        ) : (
                          <ScrollArea className="mt-3 h-40 rounded-md border border-dashed border-border p-3">
                            <div className="space-y-2">
                              {selectedRole.permissions.map((permission) => (
                                <div key={permission.id} className="rounded-md border border-border/70 p-2">
                                  <p className="text-sm font-medium">{permission.name}</p>
                                  {permission.description && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {permission.description}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        )}
                      </div>

                      <div className="rounded-md border border-dashed border-border/70 bg-muted/30 p-3">
                        <p className="text-sm font-medium">Members with this role</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          User assignment will surface here once available through the API.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      <RoleFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        permissions={permissionsState.data}
        isLoading={permissionsState.loading}
        error={permissionsState.error}
        initialRole={editingRole}
        onSubmit={handleSubmitRole}
      />
    </div>
  );
}

function TeamMembersPanel() {
  const [membersState, setMembersState] = useState(initialMembersState);
  const [roleOptionsState, setRoleOptionsState] = useState(initialRolesState);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchMembers = useCallback(async () => {
    try {
      if (!isRefreshing) {
        setMembersState((prev) => ({ ...prev, loading: true, error: null }));
      }
      const response = await userManagementService.listUsers();
      const members = response?.data?.data ?? [];
      setMembersState({ loading: false, error: null, data: members });
    } catch (error: any) {
      setMembersState((prev) => ({
        ...prev,
        loading: false,
        error: error?.message || 'Unable to load team members',
      }));
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing]);

  const fetchRoleOptions = useCallback(async () => {
    try {
      setRoleOptionsState((prev) => ({ ...prev, loading: true, error: null }));
      const response = await rbacService.getRoles();
      setRoleOptionsState({ loading: false, error: null, data: response.data });
    } catch (error: any) {
      setRoleOptionsState((prev) => ({
        ...prev,
        loading: false,
        error: error?.message || 'Unable to load roles',
      }));
      toast.error(error?.message || 'Unable to load roles for assignment');
    }
  }, []);

  useEffect(() => {
    fetchMembers();
    fetchRoleOptions();
  }, [fetchMembers, fetchRoleOptions]);

  const filteredMembers = useMemo(() => {
    if (!searchTerm.trim()) return membersState.data;
    const lower = searchTerm.toLowerCase();
    return membersState.data.filter((member) => {
      const roles = member.roles?.join(' ') ?? '';
      return (
        member.name.toLowerCase().includes(lower) ||
        member.email.toLowerCase().includes(lower) ||
        roles.toLowerCase().includes(lower) ||
        (member.status ? member.status.toLowerCase().includes(lower) : false)
      );
    });
  }, [membersState.data, searchTerm]);

  const handleOpenCreate = () => {
    setEditingMember(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (member: TeamMember) => {
    setEditingMember(member);
    setIsFormOpen(true);
  };

  const handleSubmitMember = async (payload: {
    name: string;
    email: string;
    role: string;
    password?: string;
    password_confirmation?: string;
  }) => {
    try {
      if (editingMember) {
        await userManagementService.updateUser(editingMember.id, payload);
        toast.success('Team member updated successfully');
      } else {
        await userManagementService.createUser(payload);
        toast.success('Team member created successfully');
      }
      setIsFormOpen(false);
      setIsRefreshing(true);
      await fetchMembers();
    } catch (error: any) {
      toast.error(error?.message || 'Unable to save team member');
    }
  };

  const handleDeleteMember = async (memberId: number) => {
    try {
      await userManagementService.deleteUser(memberId);
      toast.success('Team member deleted');
      setIsRefreshing(true);
      await fetchMembers();
    } catch (error: any) {
      toast.error(error?.message || 'Unable to delete member');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardHeading className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Team Members</CardTitle>
              <p className="text-sm text-muted-foreground">
                Create teammates, assign roles, and manage workspace access.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search by name, email, or role"
                  className="h-auto border-0 bg-transparent p-0 focus-visible:ring-0"
                />
              </div>
              <Button onClick={handleOpenCreate}>
                <Plus className="mr-2 h-4 w-4" />
                New member
              </Button>
            </div>
          </CardHeading>
        </CardHeader>
        <CardContent>
          {membersState.loading && !isRefreshing ? (
            <div className="flex h-48 items-center justify-center text-muted-foreground">
              Loading team members...
            </div>
          ) : membersState.error ? (
            <div className="flex h-48 flex-col items-center justify-center gap-3 text-center">
              <ShieldQuestion className="h-10 w-10 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">{membersState.error}</p>
                <Button variant="outline" size="sm" className="mt-2" onClick={fetchMembers}>
                  Try Again
                </Button>
              </div>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center gap-3 text-center">
              <UserCircle2 className="h-10 w-10 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">No team members found</p>
                <p className="text-xs text-muted-foreground">Try a different search or add a teammate.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex flex-col gap-3 rounded-lg border border-border/70 bg-card/40 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold leading-snug">{member.name}</p>
                      {member.status && (
                        <Badge variant="outline" className="text-[11px] capitalize">
                          {member.status}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{member.email}</p>
                    {member.roles?.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2">
                        {member.roles.map((role) => (
                          <Badge key={`${member.id}-${role}`} variant="secondary" className="text-[11px] capitalize">
                            {role}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="h-8" onClick={() => handleOpenEdit(member)}>
                      Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 text-destructive hover:text-destructive">
                          <Trash2 className="mr-1.5 h-4 w-4" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete team member</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will remove {member.name} from your workspace. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            variant="destructive"
                            onClick={() => handleDeleteMember(member.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <TeamMemberFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        roles={roleOptionsState.data}
        isLoadingRoles={roleOptionsState.loading}
        initialMember={editingMember}
        onSubmit={handleSubmitMember}
      />
    </div>
  );
}
