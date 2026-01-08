'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { CreateSplitGroupRequest } from '@/types/transaction-split.types';
import { SplitGroup } from '@/services/split-groups.service';

interface NewSplitGroupModalProps {
  onCreateSplitGroup: (data: CreateSplitGroupRequest) => void;
  onUpdateSplitGroup?: (id: number, data: CreateSplitGroupRequest) => void;
  splitGroup?: SplitGroup | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function NewSplitGroupModal({
  onCreateSplitGroup,
  onUpdateSplitGroup,
  splitGroup,
  open: externalOpen,
  onOpenChange: externalOnOpenChange
}: NewSplitGroupModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [formData, setFormData] = useState<CreateSplitGroupRequest>({
    name: '',
    splitType: 'percentage',
  });

  const isEditMode = !!splitGroup;
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = externalOnOpenChange || setInternalOpen;
  const [loading, setLoading] = useState(false);

  // Populate form data when editing
  useEffect(() => {
    if (splitGroup && isEditMode) {
      setFormData({
        name: splitGroup.name,
        splitType: 'percentage', // Always percentage as per requirements
      });
    } else {
      setFormData({
        name: '',
        splitType: 'percentage',
      });
    }
  }, [splitGroup, isEditMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    setLoading(true);
    try {
      if (isEditMode && splitGroup && onUpdateSplitGroup) {
        await onUpdateSplitGroup(splitGroup.id, formData);
      } else {
        await onCreateSplitGroup(formData);
      }

      if (!isEditMode) {
        setFormData({ name: '', splitType: 'percentage' });
      }
      setOpen(false);
    } catch (error) {
      console.error(`Failed to ${isEditMode ? 'update' : 'create'} split group:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateSplitGroupRequest) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };


  const isFormValid = formData.name.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isEditMode && externalOpen === undefined && (
        <DialogTrigger asChild>
          <Button className="bg-green-600 hover:bg-green-700 text-white">
            <Plus size={16} />
            New split group
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Split Group' : 'New Split Group'}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="splitGroupName">Split group name</Label>
              <Input
                id="splitGroupName"
                type="text"
                placeholder="Enter split group name (e.g., Payment Split Group)"
                value={formData.name}
                onChange={handleInputChange('name')}
                required
              />
            </div>

            <div className="space-y-3">
              <Label>Split type</Label>
              <div className="p-3 bg-muted/50 rounded-lg border">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  </div>
                  <Label className="cursor-default font-medium">
                    Percentage split
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground mt-1 ml-6">
                  Split transaction amounts based on percentage allocation
                </p>
              </div>
            </div>
          </form>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid || loading}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {loading
              ? (isEditMode ? 'Updating...' : 'Creating...')
              : (isEditMode ? 'Update' : 'Create')
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}