import { useState } from 'react';
import { Copy, RefreshCw } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input, InputWrapper } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function InviteWithLink() {
  const [linkInput, setLinkInput] = useState('https://www.ktstudio.com/RSVP?c=12345XYZt');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invite with Link</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-5">
        <div className="flex flex-wrap items-baseline gap-2.5 lg:flex-nowrap">
          <Label className="flex w-full max-w-32">Link</Label>
          <div className="flex grow flex-col items-start gap-5">
            <InputWrapper>
              <Input
                type="text"
                value={linkInput}
                onChange={(event) => setLinkInput(event.target.value)}
              />
              <Button variant="dim" mode="icon" className="-me-2">
                <Copy size={16} />
              </Button>
            </InputWrapper>
            <Button variant="outline">
              <RefreshCw size={12} />
              Reset Link
            </Button>
          </div>
        </div>
        <p className="text-sm text-foreground">
          Click below to RSVP for our exclusive event. Limited spaces available, so don't miss out.
          Reserve your spot now with this special invitation link!
        </p>
      </CardContent>
      <CardFooter className="justify-center">
        <Button>
          <Link to="#">Invite People</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
