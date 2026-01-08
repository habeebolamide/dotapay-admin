import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { complianceApi } from '@/services/compliance';
import type {
  BusinessInformationRequest,
  ComplianceDocuments,
} from '@/services/types/compliance.types';
import { toast } from 'sonner';

const NIGERIAN_STATES = [
  'Abia',
  'Adamawa',
  'Akwa Ibom',
  'Anambra',
  'Bauchi',
  'Bayelsa',
  'Benue',
  'Borno',
  'Cross River',
  'Delta',
  'Ebonyi',
  'Edo',
  'Ekiti',
  'Enugu',
  'FCT - Abuja',
  'Gombe',
  'Imo',
  'Jigawa',
  'Kaduna',
  'Kano',
  'Katsina',
  'Kebbi',
  'Kogi',
  'Kwara',
  'Lagos',
  'Nasarawa',
  'Niger',
  'Ogun',
  'Ondo',
  'Osun',
  'Oyo',
  'Plateau',
  'Rivers',
  'Sokoto',
  'Taraba',
  'Yobe',
  'Zamfara',
];

type BusinessInformationTabProps = {
  initialData: ComplianceDocuments | null;
  isLoading?: boolean;
};

export const BusinessInformationTab = ({
  initialData,
  isLoading = false,
}: BusinessInformationTabProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [rcNumber, setRcNumber] = useState('');
  const [tinNumber, setTinNumber] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [incorporationDate, setIncorporationDate] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [businessNature, setBusinessNature] = useState('');
  const [annualRevenue, setAnnualRevenue] = useState('');
  const [numberOfEmployees, setNumberOfEmployees] = useState('');
  const [hasPrefilled, setHasPrefilled] = useState(false);

  useEffect(() => {
    if (!initialData || hasPrefilled) {
      return;
    }

    setBusinessName(initialData.business_name ?? '');
    setRcNumber(initialData.rc_number ?? '');
    setTinNumber(initialData.tin_number ?? '');
    setBusinessType(initialData.business_type ?? '');
    setIncorporationDate(initialData.incorporation_date ?? '');
    setBusinessAddress(initialData.business_address ?? '');
    setCity(initialData.city ?? '');
    setState(initialData.state ?? '');
    setPostalCode(initialData.postal_code ?? '');
    setBusinessEmail(initialData.business_email ?? '');
    setBusinessPhone(initialData.business_phone ?? '');
    setWebsite(initialData.business_website ?? '');
    setBusinessNature(initialData.business_nature ?? '');
    setAnnualRevenue(initialData.estimated_annual_revenue ?? '');
    setNumberOfEmployees(initialData.number_of_employees ?? '');

    setHasPrefilled(true);
  }, [initialData, hasPrefilled]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data: BusinessInformationRequest = {
        business_name: businessName,
        business_type: businessType,
        business_address: businessAddress,
        business_phone: businessPhone,
        business_email: businessEmail,
        business_website: website,
        rc_number: rcNumber,
        tin_number: tinNumber,
        incorporation_date: incorporationDate,
        city,
        state,
        postal_code: postalCode,
        estimated_annual_revenue: annualRevenue,
        number_of_employees: numberOfEmployees,
        business_nature: businessNature,
      };

      const response = await complianceApi.storeBusinessInformation(data);

      toast.success(response.message || 'Business information saved successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save business information');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 py-5">
      <div>
        <h3 className="text-lg font-semibold mb-1">Business Information</h3>
        <p className="text-sm text-muted-foreground">
          Provide your registered business details as they appear on your CAC documents
        </p>
      </div>

      <div className="grid gap-5">
        {/* Business Registration Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col gap-2.5">
            <Label htmlFor="business_name">
              Registered Business Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="business_name"
              type="text"
              placeholder="As per CAC registration"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
              disabled={isLoading || isSubmitting}
            />
          </div>
          <div className="flex flex-col gap-2.5">
            <Label htmlFor="rc_number">
              RC Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="rc_number"
              type="text"
              placeholder="Corporate Affairs Commission Number"
              value={rcNumber}
              onChange={(e) => setRcNumber(e.target.value)}
              required
              disabled={isLoading || isSubmitting}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col gap-2.5">
            <Label htmlFor="tin_number">
              TIN Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="tin_number"
              type="text"
              placeholder="Tax Identification Number"
              value={tinNumber}
              onChange={(e) => setTinNumber(e.target.value)}
              required
              disabled={isLoading || isSubmitting}
            />
          </div>
          <div className="flex flex-col gap-2.5">
            <Label htmlFor="business_type">
              Business Type <span className="text-destructive">*</span>
            </Label>
            <Select
              value={businessType}
              onValueChange={setBusinessType}
              disabled={isLoading || isSubmitting}
            >
              <SelectTrigger id="business_type">
                <SelectValue placeholder="Select business type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="limited_company">Limited Liability Company</SelectItem>
                <SelectItem value="sole_proprietorship">Sole Proprietorship</SelectItem>
                <SelectItem value="partnership">Partnership</SelectItem>
                <SelectItem value="incorporated_trustees">Incorporated Trustees (NGO)</SelectItem>
                <SelectItem value="public_limited">Public Limited Company</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col gap-2.5">
            <Label htmlFor="incorporation_date">
              Date of Incorporation <span className="text-destructive">*</span>
            </Label>
            <Input
              id="incorporation_date"
              type="date"
              value={incorporationDate}
              onChange={(e) => setIncorporationDate(e.target.value)}
              required
              disabled={isLoading || isSubmitting}
            />
          </div>
          <div className="flex flex-col gap-2.5">
            <Label htmlFor="business_nature">
              Nature of Business <span className="text-destructive">*</span>
            </Label>
            <Select
              value={businessNature}
              onValueChange={setBusinessNature}
              disabled={isLoading || isSubmitting}
            >
              <SelectTrigger id="business_nature">
                <SelectValue placeholder="Select business nature" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ecommerce">E-commerce</SelectItem>
                <SelectItem value="retail">Retail</SelectItem>
                <SelectItem value="services">Professional Services</SelectItem>
                <SelectItem value="technology">Technology/Software</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="healthcare">Healthcare</SelectItem>
                <SelectItem value="hospitality">Hospitality</SelectItem>
                <SelectItem value="logistics">Logistics</SelectItem>
                <SelectItem value="manufacturing">Manufacturing</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Business Address */}
        <div className="space-y-5">
          <h4 className="text-base font-medium">Registered Business Address</h4>

          <div className="flex flex-col gap-2.5">
            <Label htmlFor="business_address">
              Street Address <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="business_address"
              rows={3}
              placeholder="Enter your registered business address"
              value={businessAddress}
              onChange={(e) => setBusinessAddress(e.target.value)}
              required
              disabled={isLoading || isSubmitting}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="flex flex-col gap-2.5">
              <Label htmlFor="city">
                City <span className="text-destructive">*</span>
              </Label>
              <Input
                id="city"
                type="text"
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                disabled={isLoading || isSubmitting}
              />
            </div>
            <div className="flex flex-col gap-2.5">
              <Label htmlFor="state">
                State <span className="text-destructive">*</span>
              </Label>
              <Select
                value={state}
                onValueChange={setState}
                disabled={isLoading || isSubmitting}
              >
                <SelectTrigger id="state">
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {NIGERIAN_STATES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2.5">
              <Label htmlFor="postal_code">Postal Code</Label>
              <Input
                id="postal_code"
                type="text"
                placeholder="Postal code"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                disabled={isLoading || isSubmitting}
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-5">
          <h4 className="text-base font-medium">Contact Information</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-2.5">
              <Label htmlFor="business_email">
                Business Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="business_email"
                type="email"
                placeholder="contact@business.com"
                value={businessEmail}
                onChange={(e) => setBusinessEmail(e.target.value)}
                required
                disabled={isLoading || isSubmitting}
              />
            </div>
            <div className="flex flex-col gap-2.5">
              <Label htmlFor="business_phone">
                Business Phone Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="business_phone"
                type="tel"
                placeholder="+234 XXX XXX XXXX"
                value={businessPhone}
                onChange={(e) => setBusinessPhone(e.target.value)}
                required
                disabled={isLoading || isSubmitting}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <Label htmlFor="website">Business Website (Optional)</Label>
            <Input
              id="website"
              type="url"
              placeholder="https://www.business.com"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              disabled={isLoading || isSubmitting}
            />
          </div>
        </div>

        {/* Additional Business Information */}
        <div className="space-y-5">
          <h4 className="text-base font-medium">Additional Information</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-2.5">
              <Label htmlFor="annual_revenue">
                Estimated Annual Revenue Range <span className="text-destructive">*</span>
              </Label>
              <Select
                value={annualRevenue}
                onValueChange={setAnnualRevenue}
                disabled={isLoading || isSubmitting}
              >
                <SelectTrigger id="annual_revenue">
                  <SelectValue placeholder="Select revenue range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-10m">₦0 - ₦10 Million</SelectItem>
                  <SelectItem value="10m-50m">₦10 Million - ₦50 Million</SelectItem>
                  <SelectItem value="50m-100m">₦50 Million - ₦100 Million</SelectItem>
                  <SelectItem value="100m-500m">₦100 Million - ₦500 Million</SelectItem>
                  <SelectItem value="500m+">₦500 Million+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2.5">
              <Label htmlFor="employees">
                Number of Employees <span className="text-destructive">*</span>
              </Label>
              <Select
                value={numberOfEmployees}
                onValueChange={setNumberOfEmployees}
                disabled={isLoading || isSubmitting}
              >
                <SelectTrigger id="employees">
                  <SelectValue placeholder="Select employee range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-10">1 - 10</SelectItem>
                  <SelectItem value="11-50">11 - 50</SelectItem>
                  <SelectItem value="51-200">51 - 200</SelectItem>
                  <SelectItem value="201-500">201 - 500</SelectItem>
                  <SelectItem value="500+">500+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-2.5 border-t">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting || isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || isLoading}>
            {isSubmitting ? 'Saving...' : isLoading ? 'Loading...' : 'Save & Continue'}
          </Button>
        </div>
      </div>
    </form>
  );
};
