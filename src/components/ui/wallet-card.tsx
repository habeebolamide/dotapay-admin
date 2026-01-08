'use client';

import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wallet as WalletIcon, MoreVertical, Copy, Settings, Pencil, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Wallet } from '@/types/wallet.types';
import { cn } from '@/lib/utils';

interface WalletCardProps {
  wallet: Wallet;
  onCopy?: (slug: string) => void;
  onSettings?: (wallet: Wallet) => void;
  onEdit?: (wallet: Wallet) => void;
  onDelete?: (wallet: Wallet) => void;
  onClick?: (wallet: Wallet) => void;
  className?: string;
}

export function WalletCard({ wallet, onCopy, onSettings, onEdit, onDelete, onClick, className }: WalletCardProps) {
  const formatWalletName = (slug: string) => {
    if (slug.startsWith('provider-')) {
      return 'Provider Wallet';
    }
    if (slug.includes('_demo')) {
      const parts = slug.split('_');
      if (parts[1] === 'BIZ') {
        return 'BIZ Demo';
      }
      return `${parts[1]} ${parts[2]}`;
    }
    if (slug.startsWith('WALLET_DEMO_')) {
      const code = slug.replace('WALLET_DEMO_', '');
      return `DEMO ${code}`;
    }
    return slug.replace(/WALLET_|_/g, ' ').trim();
  };

  const getWalletType = (slug: string) => {
    if (slug.startsWith('provider-')) {
      return 'Provider';
    }
    if (slug.includes('_demo')) {
      return 'Demo';
    }
    return 'Standard';
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Provider':
        return 'info';
      case 'Demo':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const walletType = getWalletType(wallet.slug);
  const timeAgo = formatDistanceToNow(new Date(wallet.created_at), { addSuffix: true });

  return (
    <Card
      className={cn(
        'overflow-hidden grow justify-between',
        onClick && 'cursor-pointer transition hover:border-primary/40 focus-within:border-primary/60',
        className
      )}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={() => onClick?.(wallet)}
      onKeyDown={(event) => {
        if (!onClick) return;
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick(wallet);
        }
      }}
    >
      <div className="p-5 mb-5">
        <div className="flex items-center justify-between mb-5">
          <Badge size="lg" variant={getTypeColor(walletType) as any} appearance="light">
            {walletType}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                mode="icon"
                onClick={(event) => event.stopPropagation()}
                onKeyDown={(event) => event.stopPropagation()}
              >
                <MoreVertical />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(event) => {
                  event.stopPropagation();
                  onCopy?.(wallet.slug);
                }}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy ID
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(event) => {
                  event.stopPropagation();
                  onSettings?.(wallet);
                }}
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(event) => {
                  event.stopPropagation();
                  onEdit?.(wallet);
                }}
              >
                <Pencil className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete?.(wallet);
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center justify-center h-[50px] mb-2">
          <WalletIcon className="w-12 h-12 text-primary" />
        </div>

        <div className="text-center mb-7">
          <div className="text-lg font-medium text-mono hover:text-primary">
            {formatWalletName(wallet.name)}
          </div>
          <div className="text-sm text-secondary-foreground">
            Created {timeAgo}
          </div>
        </div>

        <div className="flex items-center justify-center flex-wrap gap-2 lg:gap-5">
          <div className="flex flex-col gap-1.5 border border-dashed border-input rounded-md px-3.5 py-2">
            <span className="text-mono text-sm leading-none font-medium">
              ₦{wallet.balance}
            </span>
            <span className="text-secondary-foreground text-xs">
              Balance
            </span>
          </div>
          {/* <div className="flex flex-col gap-1.5 border border-dashed border-input rounded-md px-2.5 py-2">
            <span className="text-mono text-sm leading-none font-medium">
              {wallet.balance}
            </span>
            <span className="text-secondary-foreground text-xs">
              Kobo
            </span>
          </div> */}
        </div>
      </div>
    </Card>
  );
}
