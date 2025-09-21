'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Building,
  MapPin,
  Phone,
  Mail,
  Clock,
  Edit,
  Save,
  Camera,
  Upload,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Role } from '@/lib/types';

interface BusinessData {
  id?: string;
  name: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
  business_hours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  delivery_radius: number;
  status: string;
  verified: boolean;
  logo_url?: string;
  cover_image_url?: string;
}

export default function BusinessProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [business, setBusiness] = useState<BusinessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [addressQuery, setAddressQuery] = useState('')
  const [addressResults, setAddressResults] = useState<Array<{ description: string; place_id: string }>>([])
  const [addressOpen, setAddressOpen] = useState(false)

  const defaultBusinessHours = {
    monday: '09:00-17:00',
    tuesday: '09:00-17:00',
    wednesday: '09:00-17:00',
    thursday: '09:00-17:00',
    friday: '09:00-17:00',
    saturday: '09:00-13:00',
    sunday: 'Closed'
  };

  useEffect(() => {
    fetchUserData();
    fetchBusinessData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/auth/user');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchBusinessData = async () => {
    try {
      const response = await fetch('/api/business/profile');
      if (response.ok) {
        const data = await response.json();
        setBusiness({
          ...data.business,
          business_hours: data.business.business_hours || defaultBusinessHours
        });
      } else {
        // Create default business data
        setBusiness({
          name: '',
          description: '',
          phone: '',
          email: '',
          address: '',
          city: '',
          province: '',
          postal_code: '',
          business_hours: defaultBusinessHours,
          delivery_radius: 10,
          status: 'ACTIVE',
          verified: false
        });
      }
    } catch (error) {
      console.error('Error fetching business data:', error);
      setBusiness({
        name: '',
        description: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        province: '',
        postal_code: '',
        business_hours: defaultBusinessHours,
        delivery_radius: 10,
        status: 'ACTIVE',
        verified: false
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!business) return;

    setSaving(true);
    try {
      const response = await fetch('/api/business/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(business),
      });

      if (response.ok) {
        setEditing(false);
        fetchBusinessData(); // Refresh data
      } else {
        console.error('Error saving business profile');
      }
    } catch (error) {
      console.error('Error saving business profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof BusinessData, value: any) => {
    if (business) {
      setBusiness({
        ...business,
        [field]: value
      });
    }
  };

  useEffect(() => {
    const controller = new AbortController()
    const run = async () => {
      try {
        if (!addressQuery || addressQuery.length < 3) {
          setAddressResults([])
          return
        }
        const res = await fetch(`/api/places/autocomplete?q=${encodeURIComponent(addressQuery)}`, { signal: controller.signal })
        const json = await res.json()
        if (json?.data) setAddressResults(json.data)
      } catch {}
    }
    run()
    return () => controller.abort()
  }, [addressQuery])

  const handlePickPlace = async (place_id: string) => {
    try {
      const res = await fetch(`/api/places/details?place_id=${encodeURIComponent(place_id)}`)
      const json = await res.json()
      if (json?.data && business) {
        const d = json.data
        setBusiness({
          ...business,
          address: d.address || d.formatted_address || business.address,
          city: d.city || business.city,
          province: d.province || business.province,
          postal_code: d.postal_code || business.postal_code,
        })
        setAddressOpen(false)
      }
    } catch {}
  }

  const handleBusinessHoursChange = (day: string, value: string) => {
    if (business) {
      setBusiness({
        ...business,
        business_hours: {
          ...business.business_hours,
          [day]: value
        }
      });
    }
  };

  const timeOptions = (() => {
    const arr: string[] = []
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 30) {
        const hh = String(h).padStart(2, '0')
        const mm = String(m).padStart(2, '0')
        arr.push(`${hh}:${mm}`)
      }
    }
    return arr
  })()

  const parseHours = (v: string | undefined) => {
    if (!v || v.toLowerCase() === 'closed') return { closed: true, open: '09:00', close: '17:00' }
    const parts = v.split('-')
    const open = parts[0]?.trim() || '09:00'
    const close = parts[1]?.trim() || '17:00'
    return { closed: false, open, close }
  }

  const formatHours = (closed: boolean, open: string, close: string) => (closed ? 'Closed' : `${open}-${close}`)

  if (loading) {
    return (
      <DashboardLayout user={user}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user || !user.roles.includes(Role.BUSINESS_LISTER)) {
    return (
      <DashboardLayout user={user}>
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-gray-600">You need a Business Lister account to access this page.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Business Profile</h1>
            <p className="text-gray-600 mt-1">Manage your business information and settings</p>
          </div>
          <div className="flex gap-2">
            {editing ? (
              <>
                <Button variant="outline" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </>
            ) : (
              <Button onClick={() => setEditing(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          {business?.verified ? (
            <Badge className="bg-green-100 text-green-800 border-green-200">
              <CheckCircle className="mr-1 h-3 w-3" />
              Verified Business
            </Badge>
          ) : (
            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
              <AlertCircle className="mr-1 h-3 w-3" />
              Pending Verification
            </Badge>
          )}
          <Badge className={business?.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
            {business?.status}
          </Badge>
        </div>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="mr-2 h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Your business details and contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="business-name">Business Name</Label>
                {editing ? (
                  <Input
                    id="business-name"
                    value={business?.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter your business name"
                  />
                ) : (
                  <p className="mt-1 text-lg font-semibold">{business?.name || 'Not set'}</p>
                )}
              </div>
              <div>
                <Label htmlFor="business-email">Business Email</Label>
                {editing ? (
                  <Input
                    id="business-email"
                    type="email"
                    value={business?.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="business@example.com"
                  />
                ) : (
                  <div className="flex items-center mt-1">
                    <Mail className="mr-2 h-4 w-4 text-gray-500" />
                    <span>{business?.email || 'Not set'}</span>
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="business-phone">Phone Number</Label>
                {editing ? (
                  <Input
                    id="business-phone"
                    value={business?.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+27 12 345 6789"
                  />
                ) : (
                  <div className="flex items-center mt-1">
                    <Phone className="mr-2 h-4 w-4 text-gray-500" />
                    <span>{business?.phone || 'Not set'}</span>
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="delivery-radius">Delivery Radius (km)</Label>
                {editing ? (
                  <Input
                    id="delivery-radius"
                    type="number"
                    value={business?.delivery_radius || 10}
                    onChange={(e) => handleInputChange('delivery_radius', parseInt(e.target.value))}
                    min="1"
                    max="100"
                  />
                ) : (
                  <p className="mt-1">{business?.delivery_radius || 10} km</p>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="business-description">Description</Label>
              {editing ? (
                <Textarea
                  id="business-description"
                  value={business?.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your business and what you offer..."
                  rows={3}
                />
              ) : (
                <p className="mt-1 text-gray-700">{business?.description || 'No description provided'}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="mr-2 h-5 w-5" />
              Business Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 relative">
                <Label htmlFor="address">Street Address</Label>
                {editing ? (
                  <>
                    <Input
                      id="address"
                      value={business?.address || ''}
                      onChange={(e) => {
                        handleInputChange('address', e.target.value)
                        setAddressQuery(e.target.value)
                        setAddressOpen(true)
                      }}
                      placeholder="123 Main Street"
                    />
                    {addressOpen && addressResults.length > 0 && (
                      <div className="absolute z-20 mt-1 w-full rounded-xl border bg-white shadow-lg">
                        {addressResults.map((r) => (
                          <button
                            key={r.place_id}
                            type="button"
                            className="block w-full px-3 py-2 text-left hover:bg-slate-50"
                            onClick={() => handlePickPlace(r.place_id)}
                          >
                            {r.description}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <p className="mt-1">{business?.address || 'Not set'}</p>
                )}
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                {editing ? (
                  <Input
                    id="city"
                    value={business?.city || ''}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="Johannesburg"
                  />
                ) : (
                  <p className="mt-1">{business?.city || 'Not set'}</p>
                )}
              </div>
              <div>
                <Label htmlFor="province">Province</Label>
                {editing ? (
                  <Input
                    id="province"
                    value={business?.province || ''}
                    onChange={(e) => handleInputChange('province', e.target.value)}
                    placeholder="Gauteng"
                  />
                ) : (
                  <p className="mt-1">{business?.province || 'Not set'}</p>
                )}
              </div>
              <div>
                <Label htmlFor="postal-code">Postal Code</Label>
                {editing ? (
                  <Input
                    id="postal-code"
                    value={business?.postal_code || ''}
                    onChange={(e) => handleInputChange('postal_code', e.target.value)}
                    placeholder="2000"
                  />
                ) : (
                  <p className="mt-1">{business?.postal_code || 'Not set'}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Business Hours
            </CardTitle>
            <CardDescription>
              Set your operating hours for each day of the week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(business?.business_hours || defaultBusinessHours).map(([day, hours]) => {
                const parsed = parseHours(hours as string)
                return (
                  <div key={day} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="capitalize">{day}</Label>
                      {editing && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>Closed</span>
                          <Switch
                            checked={parsed.closed}
                            onCheckedChange={(checked) => handleBusinessHoursChange(day, formatHours(checked, parsed.open, parsed.close))}
                          />
                        </div>
                      )}
                    </div>
                    {editing ? (
                      parsed.closed ? (
                        <p className="mt-1 text-gray-500">Closed</p>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <Select
                              value={parsed.open}
                              onValueChange={(val) => handleBusinessHoursChange(day, formatHours(false, val, parsed.close))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Open" />
                              </SelectTrigger>
                              <SelectContent>
                                {timeOptions.map((t) => (
                                  <SelectItem key={t} value={t}>{t}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <span className="text-sm text-gray-500">to</span>
                          <div className="flex-1">
                            <Select
                              value={parsed.close}
                              onValueChange={(val) => handleBusinessHoursChange(day, formatHours(false, parsed.open, val))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Close" />
                              </SelectTrigger>
                              <SelectContent>
                                {timeOptions.map((t) => (
                                  <SelectItem key={t} value={t}>{t}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )
                    ) : (
                      <p className="mt-1">{hours}</p>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Branding */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Camera className="mr-2 h-5 w-5" />
              Branding
            </CardTitle>
            <CardDescription>
              Upload your business logo and cover image
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Logo</Label>
                <UploadButton.Area clickableId="upload-logo">
                  <div className="mt-2 flex items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer">
                    {business?.logo ? (
                      <img src={business.logo} alt="Business logo" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <div className="text-center">
                        <Upload className="mx-auto h-8 w-8 text-gray-400" />
                        <p className="text-xs text-gray-600 mt-1">Add Logo</p>
                      </div>
                    )}
                  </div>
                </UploadButton.Area>
                <p className="mt-2 text-xs text-gray-500">PNG or JPG, 512x512+ recommended. Max 2MB.</p>
                {editing && (
                  <UploadButton
                    type="logo"
                    inputId="upload-logo"
                    onUploaded={(url) => handleInputChange('logo' as any, url)}
                    existingUrl={business?.logo}
                    maxSizeBytes={2 * 1024 * 1024}
                  />
                )}
              </div>
              <div>
                <Label>Cover Image</Label>
                <UploadButton.Area clickableId="upload-cover">
                  <div className="mt-2 flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer">
                    {business?.cover_image_url ? (
                      <img src={business.cover_image_url} alt="Cover image" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <div className="text-center">
                        <Upload className="mx-auto h-8 w-8 text-gray-400" />
                        <p className="text-xs text-gray-600 mt-1">Add Cover Image</p>
                      </div>
                    )}
                  </div>
                </UploadButton.Area>
                <p className="mt-2 text-xs text-gray-500">PNG or JPG, 1600x400+ recommended. Max 5MB.</p>
                {editing && (
                  <UploadButton
                    type="cover"
                    inputId="upload-cover"
                    onUploaded={(url) => handleInputChange('cover_image_url' as any, url)}
                    existingUrl={business?.cover_image_url}
                    maxSizeBytes={5 * 1024 * 1024}
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

function UploadButton({ type, onUploaded, inputId, existingUrl, maxSizeBytes }: { type: 'logo' | 'cover'; onUploaded: (url: string) => void; inputId?: string; existingUrl?: string; maxSizeBytes?: number }) {
  const [uploading, setUploading] = useState(false)
  const id = inputId || `upload-${type}`
  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (maxSizeBytes && file.size > maxSizeBytes) {
      alert('File too large')
      e.target.value = ''
      return
    }
    setUploading(true)
    try {
      const body = new FormData()
      body.append('file', file)
      body.append('type', type)
      const res = await fetch('/api/business/media', { method: 'POST', body })
      const json = await res.json()
      if (json?.url) onUploaded(json.url)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }
  return (
    <div className="mt-2 flex items-center gap-2">
      <input id={id} type="file" accept="image/*" className="hidden" onChange={onChange} />
      <label htmlFor={id}>
        <Button variant="outline" size="sm" disabled={uploading}>
          {uploading ? 'Uploading…' : existingUrl ? (type === 'logo' ? 'Change Logo' : 'Change Cover') : (type === 'logo' ? 'Add Logo' : 'Add Cover')}
        </Button>
      </label>
    </div>
  )
}

UploadButton.Area = function Area({ children, clickableId }: { children: React.ReactNode; clickableId: string }) {
  return (
    <div onClick={() => document.getElementById(clickableId)?.click()}>
      {children}
    </div>
  )
}