'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, Upload, Eye, Loader2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from 'sonner';
import { complianceApi } from '@/services/compliance';
import type { Director, Shareholder } from '@/services/types/compliance.types';
import { uploadService } from '@/services/upload.service';

type DirectorsShareholdersTabProps = {
  complianceId?: number | string;
  initialDirectors?: Director[] | null;
  initialShareholders?: Shareholder[] | null;
  isLoading?: boolean;
};

type DocumentField = {
  url: string;
  name: string;
  uploading: boolean;
};

type PersonFormState = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  bvn: string;
  nin: string;
  id_type: string;
  id_number: string;
  percentage_shareholding: string;
  residential_address: string;
  valid_id_document: DocumentField | null;
  proof_of_address: DocumentField | null;
};

type PersonType = 'director' | 'shareholder';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const generateId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const createBlankPerson = (type: PersonType): PersonFormState => ({
  id: generateId(),
  full_name: '',
  email: '',
  phone: '',
  date_of_birth: '',
  bvn: '',
  nin: '',
  id_type: '',
  id_number: '',
  percentage_shareholding: type === 'shareholder' ? '' : '',
  residential_address: '',
  valid_id_document: null,
  proof_of_address: null,
});

const extractFileName = (url: string) => {
  try {
    const parts = url.split('/');
    return decodeURIComponent(parts[parts.length - 1] || 'document');
  } catch {
    return 'document';
  }
};

export function DirectorsShareholdersTab({
  complianceId,
  initialDirectors,
  initialShareholders,
  isLoading,
}: DirectorsShareholdersTabProps) {
  const [directors, setDirectors] = useState<PersonFormState[]>([createBlankPerson('director')]);
  const [shareholders, setShareholders] = useState<PersonFormState[]>([createBlankPerson('shareholder')]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialDirectors && initialDirectors.length > 0) {
      setDirectors(
        initialDirectors.map((director) => ({
          id: director.id ? String(director.id) : generateId(),
          full_name: director.full_name ?? '',
          email: director.email ?? '',
          phone: director.phone ?? '',
          date_of_birth: director.date_of_birth ?? '',
          bvn: director.bvn ?? '',
          nin: director.nin ?? '',
          id_type: director.id_type ?? '',
          id_number: director.id_number ?? '',
          percentage_shareholding: director.percentage_shareholding ?? '',
          residential_address: director.residential_address ?? '',
          valid_id_document: director.valid_id_document
            ? {
                url: String(director.valid_id_document),
                name: extractFileName(String(director.valid_id_document)),
                uploading: false,
              }
            : null,
          proof_of_address: director.proof_of_address
            ? {
                url: String(director.proof_of_address),
                name: extractFileName(String(director.proof_of_address)),
                uploading: false,
              }
            : null,
        }))
      );
    }
  }, [initialDirectors]);

  useEffect(() => {
    if (initialShareholders && initialShareholders.length > 0) {
      setShareholders(
        initialShareholders.map((shareholder) => ({
          id: shareholder.id ? String(shareholder.id) : generateId(),
          full_name: shareholder.full_name ?? '',
          email: shareholder.email ?? '',
          phone: shareholder.phone ?? '',
          date_of_birth: shareholder.date_of_birth ?? '',
          bvn: shareholder.bvn ?? '',
          nin: shareholder.nin ?? '',
          id_type: shareholder.id_type ?? '',
          id_number: shareholder.id_number ?? '',
          percentage_shareholding: shareholder.percentage_shareholding ?? '',
          residential_address: shareholder.residential_address ?? '',
          valid_id_document: shareholder.valid_id_document
            ? {
                url: String(shareholder.valid_id_document),
                name: extractFileName(String(shareholder.valid_id_document)),
                uploading: false,
              }
            : null,
          proof_of_address: shareholder.proof_of_address
            ? {
                url: String(shareholder.proof_of_address),
                name: extractFileName(String(shareholder.proof_of_address)),
                uploading: false,
              }
            : null,
        }))
      );
    }
  }, [initialShareholders]);

  const addPerson = (type: PersonType) => {
    const setter = type === 'director' ? setDirectors : setShareholders;
    setter((prev) => [...prev, createBlankPerson(type)]);
  };

  const removePerson = (type: PersonType, id: string) => {
    const setter = type === 'director' ? setDirectors : setShareholders;
    setter((prev) => (prev.length > 1 ? prev.filter((person) => person.id !== id) : prev));
  };

  const updatePersonField = (
    type: PersonType,
    id: string,
    field: keyof PersonFormState,
    value: string | DocumentField | null
  ) => {
    const setter = type === 'director' ? setDirectors : setShareholders;
    setter((prev) =>
      prev.map((person) => (person.id === id ? { ...person, [field]: value } : person))
    );
  };

  const handleDocumentSelection = (
    type: PersonType,
    personId: string,
    field: 'valid_id_document' | 'proof_of_address'
  ) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png,image/jpeg,image/jpg,image/webp';
    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;

      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        toast.error('Please upload a valid image (PNG, JPG, JPEG, or WEBP).');
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        toast.error('File size should not exceed 5MB.');
        return;
      }

      updatePersonField(type, personId, field, {
        url: '',
        name: file.name,
        uploading: true,
      });

      try {
        const imageUrl = await uploadService.uploadImage(file);
        updatePersonField(type, personId, field, {
          url: imageUrl,
          name: file.name,
          uploading: false,
        });
        toast.success('Document uploaded successfully');
      } catch (error: any) {
        updatePersonField(type, personId, field, null);
        toast.error(error?.message || 'Failed to upload document');
      }
    };

    input.click();
  };

  const handleRemoveDocument = (
    type: PersonType,
    personId: string,
    field: 'valid_id_document' | 'proof_of_address'
  ) => {
    updatePersonField(type, personId, field, null);
  };

  const validatePersons = (list: PersonFormState[], type: PersonType) => {
    const requiredFields: Array<keyof PersonFormState> = [
      'full_name',
      'email',
      'phone',
      'date_of_birth',
      'id_type',
      'id_number',
      'residential_address',
    ];

    if (type === 'shareholder') {
      requiredFields.push('percentage_shareholding');
    }

    for (const person of list) {
      for (const field of requiredFields) {
        if (!String(person[field] ?? '').trim()) {
          toast.error(
            `${type === 'director' ? 'Director' : 'Shareholder'} ${person.full_name || ''} is missing ${field.replaceAll('_', ' ')}`
          );
          return false;
        }
      }

      if (!person.valid_id_document?.url) {
        toast.error(
          `${type === 'director' ? 'Director' : 'Shareholder'} ${
            person.full_name || ''
          } is missing a valid ID document`
        );
        return false;
      }

      if (!person.proof_of_address?.url) {
        toast.error(
          `${type === 'director' ? 'Director' : 'Shareholder'} ${
            person.full_name || ''
          } is missing a proof of address`
        );
        return false;
      }
    }

    return true;
  };

  const buildPayload = () => ({
    directors: directors.map((director) => ({
      full_name: director.full_name.trim(),
      email: director.email.trim(),
      phone: director.phone.trim(),
      date_of_birth: director.date_of_birth,
      bvn: director.bvn.trim() || undefined,
      nin: director.nin.trim() || undefined,
      residential_address: director.residential_address.trim(),
      id_type: director.id_type,
      id_number: director.id_number.trim(),
      percentage_shareholding: director.percentage_shareholding.trim() || undefined,
      valid_id_document: director.valid_id_document?.url ?? '',
      proof_of_address: director.proof_of_address?.url ?? '',
    })),
    shareholders: shareholders.map((shareholder) => ({
      full_name: shareholder.full_name.trim(),
      email: shareholder.email.trim(),
      phone: shareholder.phone.trim(),
      date_of_birth: shareholder.date_of_birth,
      bvn: shareholder.bvn.trim() || undefined,
      nin: shareholder.nin.trim() || undefined,
      residential_address: shareholder.residential_address.trim(),
      id_type: shareholder.id_type,
      id_number: shareholder.id_number.trim(),
      percentage_shareholding: shareholder.percentage_shareholding.trim() || undefined,
      valid_id_document: shareholder.valid_id_document?.url ?? '',
      proof_of_address: shareholder.proof_of_address?.url ?? '',
    })),
  });

  const handleSubmit = async () => {
    if (!complianceId) {
      toast.error('Compliance ID is not available. Please reload the page.');
      return;
    }

    const directorsValid = validatePersons(directors, 'director');
    if (!directorsValid) return;

    const shareholdersValid = validatePersons(shareholders, 'shareholder');
    if (!shareholdersValid) return;

    setIsSubmitting(true);

    try {
      const payload = buildPayload();
      const response = await complianceApi.storeShareholderInformation(complianceId, payload);
      toast.success(response?.message || 'Directors & Shareholders information saved');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to submit directors & shareholders information');
    } finally {
      setIsSubmitting(false);
    }
  };

  const allUploading = useMemo(
    () =>
      [...directors, ...shareholders].some(
        (person) =>
          person.valid_id_document?.uploading || person.proof_of_address?.uploading
      ),
    [directors, shareholders]
  );

  const renderDocumentSection = (
    type: PersonType,
    person: PersonFormState,
    field: 'valid_id_document' | 'proof_of_address',
    label: string,
    helper: string
  ) => {
    const document = person[field];
    const isUploading = document?.uploading;

    return (
      <div className="flex flex-col gap-2.5">
        <Label>
          {label} <span className="text-destructive">*</span>
        </Label>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="flex items-center justify-center w-24 h-24 border-2 border-dashed rounded-lg bg-muted/40">
            {isUploading ? (
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            ) : (
              <Upload className="w-6 h-6 text-muted-foreground" />
            )}
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleDocumentSelection(type, person.id, field)}
                disabled={isUploading || isSubmitting}
              >
                {document ? 'Replace' : 'Upload'} Document
              </Button>
              {document?.url && !document.uploading && (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(document.url, '_blank', 'noopener')}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveDocument(type, person.id, field)}
                  >
                    <XCircle className="w-4 h-4 mr-1 text-muted-foreground" />
                    Remove
                  </Button>
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {document?.name
                ? `${document.name}${document.uploading ? ' (uploading...)' : ''}`
                : helper}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderPersonForm = (
    person: PersonFormState,
    index: number,
    type: PersonType,
    showRemove: boolean
  ) => (
    <Card key={person.id} className="relative">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            {type === 'director' ? 'Director' : 'Shareholder'} {index + 1}
          </CardTitle>
          {showRemove && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removePerson(type, person.id)}
              className="text-destructive hover:text-destructive"
              disabled={isSubmitting}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col gap-2.5">
            <Label>
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              type="text"
              placeholder="As per government-issued ID"
              value={person.full_name}
              onChange={(event) => updatePersonField(type, person.id, 'full_name', event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2.5">
            <Label>
              Email Address <span className="text-destructive">*</span>
            </Label>
            <Input
              type="email"
              placeholder="email@example.com"
              value={person.email}
              onChange={(event) => updatePersonField(type, person.id, 'email', event.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col gap-2.5">
            <Label>
              Phone Number <span className="text-destructive">*</span>
            </Label>
            <Input
              type="tel"
              placeholder="+234 XXX XXX XXXX"
              value={person.phone}
              onChange={(event) => updatePersonField(type, person.id, 'phone', event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2.5">
            <Label>
              Date of Birth <span className="text-destructive">*</span>
            </Label>
            <Input
              type="date"
              value={person.date_of_birth}
              onChange={(event) => updatePersonField(type, person.id, 'date_of_birth', event.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col gap-2.5">
            <Label>BVN (optional)</Label>
            <Input
              type="text"
              placeholder="11-digit BVN"
              maxLength={11}
              value={person.bvn}
              onChange={(event) => updatePersonField(type, person.id, 'bvn', event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2.5">
            <Label>NIN (optional)</Label>
            <Input
              type="text"
              placeholder="11-digit NIN"
              maxLength={11}
              value={person.nin}
              onChange={(event) => updatePersonField(type, person.id, 'nin', event.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col gap-2.5">
            <Label>
              ID Type <span className="text-destructive">*</span>
            </Label>
            <Select
              value={person.id_type}
              onValueChange={(value) => updatePersonField(type, person.id, 'id_type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select ID type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="National ID">National ID Card</SelectItem>
                <SelectItem value="International Passport">International Passport</SelectItem>
                <SelectItem value="Driver's License">Driver's License</SelectItem>
                <SelectItem value="Voter's Card">Voter's Card</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2.5">
            <Label>
              ID Number <span className="text-destructive">*</span>
            </Label>
            <Input
              type="text"
              placeholder="ID number"
              value={person.id_number}
              onChange={(event) => updatePersonField(type, person.id, 'id_number', event.target.value)}
            />
          </div>
        </div>

        {type === 'shareholder' && (
          <div className="flex flex-col gap-2.5">
            <Label>
              Percentage Shareholding <span className="text-destructive">*</span>
            </Label>
            <Input
              type="number"
              placeholder="e.g., 25"
              min="0"
              max="100"
              value={person.percentage_shareholding}
              onChange={(event) =>
                updatePersonField(type, person.id, 'percentage_shareholding', event.target.value)
              }
            />
          </div>
        )}

        <div className="flex flex-col gap-2.5">
          <Label>
            Residential Address <span className="text-destructive">*</span>
          </Label>
          <Input
            type="text"
            placeholder="Full residential address"
            value={person.residential_address}
            onChange={(event) =>
              updatePersonField(type, person.id, 'residential_address', event.target.value)
            }
          />
        </div>

        {renderDocumentSection(
          type,
          person,
          'valid_id_document',
          'Upload Valid ID Document',
          'PNG, JPG, JPEG, or WEBP (max 5MB)'
        )}

        {renderDocumentSection(
          type,
          person,
          'proof_of_address',
          'Upload Proof of Address',
          'Utility bill not older than 3 months (PNG, JPG, JPEG, or WEBP)'
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 py-5">
      <div>
        <h3 className="text-lg font-semibold mb-1">Directors & Shareholders Information</h3>
        <p className="text-sm text-muted-foreground">
          Provide KYC information for all company directors and shareholders with 10% or more
          ownership. This is required by CBN regulations.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-base font-medium">Company Directors</h4>
          <Button
            variant="outline"
            size="sm"
            onClick={() => addPerson('director')}
            className="gap-2"
            disabled={isSubmitting}
          >
            <Plus className="w-4 h-4" />
            Add Director
          </Button>
        </div>
        <div className="space-y-4">
          {directors.map((director, index) =>
            renderPersonForm(director, index, 'director', directors.length > 1)
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-base font-medium">Shareholders (10% or more ownership)</h4>
          <Button
            variant="outline"
            size="sm"
            onClick={() => addPerson('shareholder')}
            className="gap-2"
            disabled={isSubmitting}
          >
            <Plus className="w-4 h-4" />
            Add Shareholder
          </Button>
        </div>
        <div className="space-y-4">
          {shareholders.map((shareholder, index) =>
            renderPersonForm(shareholder, index, 'shareholder', shareholders.length > 1)
          )}
        </div>
      </div>

      <div className="flex justify-between items-center pt-2.5 border-t">
        <Button type="button" variant="outline" disabled={isSubmitting}>
          Back
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || allUploading || isLoading || !complianceId}
        >
          {isSubmitting ? 'Saving...' : 'Save & Continue'}
        </Button>
      </div>
    </div>
  );
}
