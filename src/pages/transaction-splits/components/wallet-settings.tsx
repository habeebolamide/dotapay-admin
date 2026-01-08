'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardHeading } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Wallet, WalletSettingFormData, SplitGroupSettingsRequest } from '@/types/wallet.types';
import { SplitGroup } from '@/services/split-groups.service';
import { walletService } from '@/services/wallet.service';
import { notify } from '@/lib/notifications';
import { Loader2, Wallet as WalletIcon, Save, Search, X } from 'lucide-react';

interface WalletSettingsProps {
  splitGroup: SplitGroup;
}

export function WalletSettings({ splitGroup }: WalletSettingsProps) {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [walletSettings, setWalletSettings] = useState<WalletSettingFormData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);

  // Initial load
  useEffect(() => {
    const initializeWallets = async () => {
      try {
        setLoading(true);
        const response = await walletService.getBusinessWallets();
        setWallets(response.data);

        const initialSettings: WalletSettingFormData[] = response.data.map(wallet => {
          const existingSetting = splitGroup.settings?.find(setting => setting.wallet_id === wallet.slug);
          return {
            wallet_id: wallet.slug,
            name: wallet.name,
            wallet_slug: wallet.slug,
            percentage: existingSetting ? parseFloat(existingSetting.amount) : 0,
          };
        });
        setWalletSettings(initialSettings);
      } catch (error) {
        console.error('Failed to fetch wallets:', error);
        notify.error('Failed to load wallets');
      } finally {
        setLoading(false);
      }
    };

    initializeWallets();
  }, [splitGroup]);

  // Search - only update wallets list, not settings
  useEffect(() => {
    if (loading) return;
    
    const timeoutId = setTimeout(async () => {
      try {
        setSearching(true);
        const params = searchQuery ? { search: searchQuery } : {};
        const response = await walletService.getBusinessWallets(params);
        setWallets(response.data);
      } catch (error) {
        console.error('Failed to search wallets:', error);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, loading]);

  const handlePercentageChange = (walletId: string, percentage: number) => {
    setWalletSettings(prev => {
      const existingIndex = prev.findIndex(s => s.wallet_id === walletId);
      
      if (existingIndex >= 0) {
        // Update existing setting
        return prev.map(setting =>
          setting.wallet_id === walletId
            ? { ...setting, percentage: Math.max(0, Math.min(100, percentage)) }
            : setting
        );
      } else {
        // Add new setting for searched wallet
        const wallet = wallets.find(w => w.slug === walletId);
        if (!wallet) return prev;
        
        return [
          ...prev,
          {
            wallet_id: walletId,
            name: wallet.name,
            wallet_slug: wallet.slug,
            percentage: Math.max(0, Math.min(100, percentage)),
          }
        ];
      }
    });
  };

  const getTotalPercentage = () => {
    return walletSettings.reduce((total, setting) => total + setting.percentage, 0);
  };

  const handleSave = async () => {
    const totalPercentage = getTotalPercentage();

    if (totalPercentage !== 100) {
      notify.error('Total percentage must equal 100%');
      return;
    }

    try {
      setSaving(true);
      const payload: SplitGroupSettingsRequest = {
        split_group_id: splitGroup.id,
        settings: walletSettings
          .filter(setting => setting.percentage > 0)
          .map(setting => ({
            wallet_id: setting.wallet_id,
            amount: setting.percentage,
          })),
      };

      await walletService.saveSplitGroupSettings(payload);
      notify.success('Wallet settings saved successfully');
    } catch (error) {
      console.error('Failed to save wallet settings:', error);
      notify.error('Failed to save wallet settings');
    } finally {
      setSaving(false);
    }
  };

  const formatWalletName = (slug: string) => {
    // Extract meaningful name from wallet slug
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
    // Handle patterns like WALLET_DEMO_KQCUIWCR
    if (slug.startsWith('WALLET_DEMO_')) {
      const code = slug.replace('WALLET_DEMO_', '');
      return `DEMO ${code}`;
    }
    return slug.replace(/WALLET_|_/g, ' ').trim();
  };

  if (loading) {
    return (
      <Card>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading wallets...</p>
          </div>
        </div>
      </Card>
    );
  }

  const totalPercentage = getTotalPercentage();
  const isValidTotal = totalPercentage === 100;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between w-full">
          <CardHeading>Wallet Allocation</CardHeading>
          <div className="flex items-center gap-3">
            <Badge
              variant={isValidTotal ? "secondary" : "destructive"}
              className="text-sm font-medium"
            >
              {totalPercentage}%
            </Badge>
            <Button
              onClick={handleSave}
              disabled={!isValidTotal || saving}
              className="bg-green-600 hover:bg-green-700"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <div className="flex flex-col h-[400px]">
        {/* Search Bar */}
        <div className="px-6 pb-4 mt-3">
          <div className="relative">
            <Search className="size-4 text-muted-foreground absolute start-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search wallets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ps-9 pr-9"
            />
            {searchQuery.length > 0 && !searching && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute end-1.5 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => setSearchQuery('')}
              >
                <X size={14} />
              </Button>
            )}
            {searching && (
              <Loader2 className="size-4 text-muted-foreground absolute end-3 top-1/2 -translate-y-1/2 animate-spin" />
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 space-y-3">
          {(() => {
            // If searching, show only wallets from search results
            // Otherwise show all walletSettings
            const displayedWallets = searchQuery && wallets.length > 0 
              ? wallets.map(wallet => {
                  // Check if wallet exists in settings
                  const existingSetting = walletSettings.find(s => s.wallet_id === wallet.slug);
                  if (existingSetting) {
                    return existingSetting;
                  }
                  // If not in settings, create a new entry for display
                  const splitGroupSetting = splitGroup.settings?.find(s => s.wallet_id === wallet.slug);
                  return {
                    wallet_id: wallet.slug,
                    name: wallet.name,
                    wallet_slug: wallet.slug,
                    percentage: splitGroupSetting ? parseFloat(splitGroupSetting.amount) : 0,
                  };
                })
              : walletSettings;

            return displayedWallets.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <WalletIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">No wallets found</h3>
                  <p className="text-sm text-muted-foreground">
                    {searchQuery ? 'No wallets match your search' : 'No wallets are available for this business'}
                  </p>
                </div>
              </div>
            ) : (
              displayedWallets.map((setting, index) => {
                const wallet = wallets.find(w => w.slug === setting.wallet_id);
                return (
                  <div key={setting.wallet_id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <div className="font-medium text-foreground">{formatWalletName(setting.name)}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Balance: {wallet?.balanceKobo}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Label htmlFor={`percentage-${index}`} className="text-sm font-medium">
                        Percentage:
                      </Label>
                      <div className="relative">
                        <Input
                          id={`percentage-${index}`}
                          type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={setting.percentage}
                        onChange={(e) => handlePercentageChange(setting.wallet_id, parseFloat(e.target.value) || 0)}
                        className="w-20 text-center pr-6"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">
                        %
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
            );
          })()}
        </div>

        {walletSettings.length > 0 && (
          <div className="p-6 pt-0">
            <div className="p-4 bg-muted/30 rounded-lg border border-dashed">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">Total Allocation:</span>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={isValidTotal ? "secondary" : "destructive"}
                    className="text-sm font-medium"
                  >
                    {totalPercentage.toFixed(1)}%
                  </Badge>
                  {!isValidTotal && (
                    <span className="text-sm text-destructive font-medium">
                      Must equal 100%
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
