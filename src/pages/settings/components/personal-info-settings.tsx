import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TokenStorage } from '@/lib/token-storage';
import { useAuth } from '@/auth/context/auth-context';

const getInitialPersonalInfo = () => {
  const storedUser = typeof window !== 'undefined' ? TokenStorage.getUser() : null;
  const nameParts = storedUser?.name?.trim().split(/\s+/).filter(Boolean) ?? [];

  return {
    firstName: nameParts[0] ?? '',
    lastName: nameParts.slice(1).join(' '),
    email: storedUser?.email ?? '',
    phone: storedUser?.phone ?? '',
  };
};

export const PersonalInfoSettings = () => {
  const initialValues = useMemo(getInitialPersonalInfo, []);
  const { updateProfile, setUser } = useAuth();

  const [firstName, setFirstName] = useState(initialValues.firstName);
  const [lastName, setLastName] = useState(initialValues.lastName);
  const [email, setEmail] = useState(initialValues.email);
  const [phone, setPhone] = useState(initialValues.phone);
  const [saving, setSaving] = useState(false);

  const handleReset = () => {
    const resetValues = getInitialPersonalInfo();
    setFirstName(resetValues.firstName);
    setLastName(resetValues.lastName);
    setEmail(resetValues.email);
    setPhone(resetValues.phone);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload: any = {
        name: `${firstName} ${lastName}`.trim(),
        email: email.trim(),
        phone: phone.trim(),
      };
      const updatedUser = await updateProfile(payload);
      // Update local storage and context user if returned
      if (updatedUser) {
        const storedUser = TokenStorage.getUser();
        if (storedUser) {
          TokenStorage.setUser({
            ...storedUser,
            name: updatedUser.fullname || payload.name,
            email: updatedUser.email || payload.email,
            phone: updatedUser.phone || payload.phone,
          });
        }
        setUser?.(updatedUser);
      }
    } catch (error) {
      console.error('Failed to update personal info', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="pb-2.5">
      <CardHeader id="personal_info">
        <CardTitle>Personal Info</CardTitle>
        <p className="text-sm text-muted-foreground">
          Update your personal information and contact details
        </p>
      </CardHeader>
      <CardContent className="grid gap-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="w-full">
            <div className="flex flex-col gap-2.5">
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
          </div>
          <div className="w-full">
            <div className="flex flex-col gap-2.5">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="w-full">
            <div className="flex flex-col gap-2.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div className="w-full">
            <div className="flex flex-col gap-2.5">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center pt-2.5 border-t">
          <Button variant="outline" onClick={handleReset} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
