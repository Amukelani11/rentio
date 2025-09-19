'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Plus, X, Image as ImageIcon, MapPin } from 'lucide-react';
import { Category, DepositType, CancellationPolicy } from '@/types';
import dynamic from 'next/dynamic'

// Replace dynamic import with direct import to avoid ChunkLoadError
import RecurrenceEditor from '@/components/RecurrenceEditor'

interface CreateListingForm {
  title: string;
  description: string;
  categoryId: string;
  priceDaily: number;
  priceWeekly?: number;
  weeklyDiscount: number;
  weekendMultiplier: number;
  depositType: DepositType;
  depositValue: number;
  minDays: number;
  maxDays?: number;
  instantBook: boolean;
  requiresKyc: boolean;
  maxDistance?: number;
  location: string;
  latitude?: number;
  longitude?: number;
  pickupAddress?: string;
  deliveryOptions: {
    pickupAvailable: boolean;
    deliveryAvailable: boolean;
    deliveryFeeType: 'fixed' | 'per_km';
    deliveryFee: number;
    deliveryRadius: number;
    pickupLocation?: string;
    pickupInstructions?: string;
    deliveryInstructions?: string;
  };
  availabilityRules: {
    advanceNoticeDays: number;
    minStayDays: number;
    maxStayDays?: number;
  };
  specifications: Record<string, any>;
  tags: string[];
  cancellationPolicy: CancellationPolicy;
}

export default function CreateListingPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [newTag, setNewTag] = useState('');
  const TAB_ORDER = ['basic', 'pricing', 'availability', 'logistics', 'settings'] as const;
  const [activeTab, setActiveTab] = useState<(typeof TAB_ORDER)[number]>('basic');
  
  const [formData, setFormData] = useState<CreateListingForm>({
    title: '',
    description: '',
    categoryId: '',
    priceDaily: 0,
    weeklyDiscount: 0,
    weekendMultiplier: 1,
    depositType: DepositType.FIXED,
    depositValue: 0,
    minDays: 1,
    instantBook: false,
    requiresKyc: false,
    location: '',
    pickupAddress: '',
    deliveryOptions: {
      pickupAvailable: true,
      deliveryAvailable: false,
      deliveryFeeType: 'fixed',
      deliveryFee: 0,
      deliveryRadius: 50,
    },
    availabilityRules: {
      advanceNoticeDays: 1,
      minStayDays: 1,
    },
    specifications: {},
    tags: [],
    cancellationPolicy: CancellationPolicy.MODERATE,
  });
  const [images, setImages] = useState<Array<File | string>>([])
  const [uploadingImages, setUploadingImages] = useState(false)
  const [exceptions, setExceptions] = useState<Array<{startDate: string, endDate: string, reason?: string}>>([])
  const [recurrenceRule, setRecurrenceRule] = useState<string | null>(null)
  // image suggestions removed per request
  const [placeSuggestions, setPlaceSuggestions] = useState<Array<{description: string, place_id?: string}>>([])
  const placeTimer = useRef<any>(null)

  // Auto-calc weekly discount whenever daily or weekly price changes
  useEffect(() => {
    const daily = parseFloat(String(formData.priceDaily)) || 0
    const weekly = parseFloat(String(formData.priceWeekly)) || 0
    if (daily > 0 && weekly > 0) {
      const fullWeekly = daily * 7
      const raw = (1 - (weekly / fullWeekly)) * 100
      const clamped = Math.max(0, Math.min(100, Math.round(raw)))
      if (clamped !== (formData.weeklyDiscount || 0)) {
        setFormData(prev => ({ ...prev, weeklyDiscount: clamped }))
      }
    } else if ((formData.weeklyDiscount || 0) !== 0) {
      setFormData(prev => ({ ...prev, weeklyDiscount: 0 }))
    }
  }, [formData.priceDaily, formData.priceWeekly])

  // Local fallback categories used when DB is unavailable
  const defaultCategories = [
    { id: 'tools', name: 'Tools' },
    { id: 'tents-camping', name: 'Tents & Camping' },
    { id: 'clothing-dresses', name: 'Clothing & Dresses' },
    { id: 'electronics', name: 'Electronics' },
    { id: 'trailers-transport', name: 'Trailers & Transport' },
    { id: 'sports-fitness', name: 'Sports & Fitness' },
    { id: 'furniture', name: 'Furniture' },
  ]

  useEffect(() => {
    // Get user data and categories
    const fetchData = async () => {
      try {
        const [userResponse, categoriesResponse] = await Promise.all([
          fetch('/api/auth/user'),
          fetch('/api/categories'),
        ]);

        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData.user);
        }

        // If categories request fails or DB is down, use defaults
        if (!categoriesResponse.ok) {
          console.warn('Categories request failed, using defaults', categoriesResponse.status)
          setCategories(defaultCategories as any)
          if (!formData.categoryId && defaultCategories.length > 0) setFormData(prev => ({ ...prev, categoryId: defaultCategories[0].id }))
        } else {
          let categoriesData = await categoriesResponse.json();
          const payload = Array.isArray(categoriesData) ? categoriesData : (categoriesData.data || categoriesData)
          if (Array.isArray(payload) && payload.length > 0) {
            const cats = payload.flatMap((c: any) => c && c.children ? [ { id: c.id, name: c.name, icon: c.icon, slug: c.slug }, ...(c.children.map((ch: any) => ({ id: ch.id, name: ch.name, icon: ch.icon, slug: ch.slug }))) ] : { id: c.id, name: c.name, icon: c.icon, slug: c.slug })
            const normalized = Array.isArray(cats) ? cats.flat() : [cats]
            setCategories(normalized)
            if (!formData.categoryId && normalized.length > 0) setFormData(prev => ({ ...prev, categoryId: normalized[0].id }))
          } else {
            // fallback to defaults
            console.warn('No categories in payload, using defaults')
            setCategories(defaultCategories as any)
            if (!formData.categoryId && defaultCategories.length > 0) setFormData(prev => ({ ...prev, categoryId: defaultCategories[0].id }))
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        // on error (e.g. DB down) use local defaults
        setCategories(defaultCategories as any)
        if (!formData.categoryId && defaultCategories.length > 0) setFormData(prev => ({ ...prev, categoryId: defaultCategories[0].id }))
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (field: keyof CreateListingForm, value: any) => {
    setFormData(prev => {
      const newFormData = { ...prev, [field]: value };

      // Auto-calculate weekly discount when daily or weekly price changes
      if (field === 'priceDaily' || field === 'priceWeekly') {
        const priceDaily = parseFloat(String(newFormData.priceDaily)) || 0;
        const priceWeekly = parseFloat(String(newFormData.priceWeekly)) || 0;
        console.log('Calculating discount:', { priceDaily, priceWeekly });

        if (priceDaily > 0 && priceWeekly > 0) {
          const fullWeeklyPrice = priceDaily * 7;
          if (priceWeekly < fullWeeklyPrice) {
            const discount = ((fullWeeklyPrice - priceWeekly) / fullWeeklyPrice) * 100;
            newFormData.weeklyDiscount = Math.max(0, Math.round(discount));
            console.log('Calculated discount %:', newFormData.weeklyDiscount);
          } else {
            // If weekly price is higher than 7 days daily, discount is 0
            newFormData.weeklyDiscount = 0;
            console.log('Weekly price is not a discount, setting discount to 0');
          }
        } else {
          // If either price is 0, discount is 0
          newFormData.weeklyDiscount = 0;
        }
      }
      return newFormData;
    });
    // no image suggestions
  };


  const handleNestedChange = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof CreateListingForm] as any,
        [field]: value,
      },
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag('');
    }
  };

  const handleImageFiles = (files: FileList | null) => {
    if (!files) return
    const arr = Array.from(files)
    setImages(prev => [...prev, ...arr])
  }

  // handle file input change
  const onFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleImageFiles(e.target.files)
  }

  const removeImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx))
  }

  const addException = (startDate: string, endDate: string, reason?: string) => {
    setExceptions(prev => [...prev, { startDate, endDate, reason }])
  }

  const removeException = (idx: number) => {
    setExceptions(prev => prev.filter((_, i) => i !== idx))
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const handleSubmit = async (action: 'save' | 'publish') => {
    setSaving(true);
    setError('');

    const isUuid = (v: string | undefined) => !!v && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v)

    try {
      let imageUrls: string[] = []
      if (images.length > 0) {
        setUploadingImages(true)
        const form = new FormData()
        images.forEach((f) => form.append('files', f))
        const uploadRes = await fetch('/api/listings/upload', { method: 'POST', body: form })
        if (uploadRes.ok) {
          const json = await uploadRes.json()
          imageUrls = json.urls || []
        } else {
          console.warn('Image upload failed')
        }
        setUploadingImages(false)
      }

      // Resolve categoryId to a UUID (handle cases where the UI holds a slug)
      let resolvedCategoryId: string | undefined = formData.categoryId
      const selected = categories.find((c: any) => c?.id === formData.categoryId || c?.slug === formData.categoryId)
      if (selected?.id) resolvedCategoryId = selected.id

      if (!isUuid(resolvedCategoryId)) {
        try {
          const r = await fetch('/api/categories')
          if (r.ok) {
            const j = await r.json()
            const payload = Array.isArray(j) ? j : (j.data || j)
            const flat = Array.isArray(payload)
              ? payload.flatMap((c: any) => c?.children ? [c, ...c.children] : [c])
              : []
            const match = flat.find((c: any) => c?.slug === formData.categoryId || c?.id === formData.categoryId)
            if (match?.id) resolvedCategoryId = match.id
          }
        } catch {}
      }

      if (!isUuid(resolvedCategoryId)) {
        setError('Please select a valid category.');
        setSaving(false);
        return;
      }

      // create listing first
      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          categoryId: resolvedCategoryId,
          images: imageUrls,
          status: action === 'publish' ? 'ACTIVE' : 'DRAFT',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create listing');
      }

      const data = await response.json();
      const listingId = data.data.id

      // Save exceptions and recurrence (if set)
      if (listingId) {
        const items: any[] = [...exceptions]
        if (recurrenceRule) {
          items.push({ recurring: true, recurrenceRule })
        }

        if (items.length > 0) {
          await fetch(`/api/listings/${listingId}/unavailabilities`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items }),
          })
        }
      }

      if (action === 'publish') {
        router.push('/dashboard/listings');
      } else {
        router.push('/dashboard/listings/draft');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral-600"></div>
      </div>
    );
  }

  // Allow customers to create listings; the API will auto-upgrade role on first create

  return (
    <DashboardLayout user={user} showHeader={false}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create New Listing</h1>
          <p className="text-gray-600">Fill in the details to list your item for rent</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={(e) => e.preventDefault()}>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="availability">Availability</TabsTrigger>
              <TabsTrigger value="logistics">Logistics</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Basic Information */}
            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Provide the essential details about your item
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      placeholder="What are you renting?"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your item, its condition, and any special features..."
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={4}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.categoryId}
                      onValueChange={(value) => handleInputChange('categoryId', value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="location">Location *</Label>
                    <div className="relative">
                      <Input
                        id="location"
                        autoComplete="off"
                        placeholder="City where item is located"
                        value={formData.location}
                        onChange={(e) => {
                          handleInputChange('location', e.target.value)
                          const v = e.target.value
                          if (placeTimer.current) clearTimeout(placeTimer.current)
                          if (v.trim().length > 1) {
                            placeTimer.current = setTimeout(() => {
                              fetch(`/api/places/autocomplete?q=${encodeURIComponent(v)}&type=city`)
                                .then(r => r.json())
                                .then(j => { if (j.success) setPlaceSuggestions(j.data || []) })
                                .catch(() => {})
                            }, 300)
                          } else {
                            setPlaceSuggestions([])
                          }
                        }}
                        required
                      />
                      {placeSuggestions.length > 0 && (
                        <div className="absolute z-30 left-0 right-0 bg-white border mt-1 max-h-48 overflow-auto">
                          {placeSuggestions.map((p, i) => (
                            <div key={i} className="p-2 hover:bg-gray-100 cursor-pointer" onClick={() => {
                              handleInputChange('location', p.description)
                              setPlaceSuggestions([])
                            }}>{p.description}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="tags">Tags</Label>
                    <div className="flex items-center space-x-2 mb-2">
                      <Input
                        placeholder="Add a tag"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      />
                      <Button type="button" onClick={addTag} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="cursor-pointer">
                          {tag}
                          <X className="h-3 w-3 ml-1" onClick={() => removeTag(tag)} />
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Image uploader + preview (basic info) */}
                  <div>
                    <Label className="block mb-2">Images</Label>
                    <input type="file" accept="image/*" multiple onChange={(e) => onFilesSelected(e as any)} />
                    <div className="mt-3 flex flex-wrap gap-2">
                      {images.map((img, i) => (
                        <div key={i} className="w-28 h-28 bg-gray-100 rounded overflow-hidden relative">
                          {typeof img === 'string' ? (
                            <img src={img} className="w-full h-full object-cover" alt={`img-${i}`} />
                          ) : (
                            <img src={URL.createObjectURL(img)} className="w-full h-full object-cover" alt={(img as File).name} />
                          )}
                          <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-white rounded-full p-1 text-red-600">×</button>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">You can pick recommended images or upload your own. Selected images will be uploaded on Publish.</p>

                    
                  </div>
                </CardContent>
              </Card>

              {/* Quantity */}
              <Card>
                <CardHeader>
                  <CardTitle>Quantity</CardTitle>
                  <CardDescription>
                    Number of identical items available for rent
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid max-w-sm">
                    <Label htmlFor="quantity">Units Available</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min={1}
                      placeholder="1"
                      value={(formData.specifications?.quantity as any) || ''}
                      onChange={(e) => handleNestedChange('specifications', 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
                    />
                    <p className="mt-1 text-xs text-muted-foreground">If more than 1, your listing can be booked by multiple renters at the same time.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Pricing */}
            <TabsContent value="pricing" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Pricing & Deposit</CardTitle>
                  <CardDescription>
                    Set your rental rates and security deposit
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="priceDaily">Daily Rate (ZAR) *</Label>
                      <Input
                        id="priceDaily"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.priceDaily || ''}
                        onChange={(e) => handleInputChange('priceDaily', parseFloat(e.target.value) || 0)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="priceWeekly">Weekly Rate (ZAR)</Label>
                      <Input
                        id="priceWeekly"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.priceWeekly || ''}
                        onChange={(e) => handleInputChange('priceWeekly', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="weeklyDiscount">Weekly Discount (%)</Label>
                      <Input
                        id="weeklyDiscount"
                        type="number"
                        min="0"
                        max="100"
                        placeholder="Auto-calculated"
                        value={formData.weeklyDiscount || ''}
                        readOnly
                        className="bg-slate-100 dark:bg-charcoal-500"
                      />
                       <p className="text-xs text-muted-foreground mt-1">
                        Calculated automatically from the weekly rate.
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="weekendMultiplier">Weekend Multiplier</Label>
                      <Input
                        id="weekendMultiplier"
                        type="number"
                        min="1"
                        step="0.1"
                        placeholder="1.0"
                        value={formData.weekendMultiplier || ''}
                        onChange={(e) => handleInputChange('weekendMultiplier', parseFloat(e.target.value) || 1)}
                      />
                    </div>
                  </div>

                  {/* Minimum/Maximum Days moved to Availability step */}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="depositType">Deposit Type</Label>
                      <Select
                        value={formData.depositType}
                        onValueChange={(value) => handleInputChange('depositType', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={DepositType.FIXED}>Fixed Amount</SelectItem>
                          <SelectItem value={DepositType.PERCENTAGE}>Percentage of Rental</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="depositValue">Deposit Value</Label>
                      <div className="relative">
                        <Input
                          id="depositValue"
                          type="number"
                          min="0"
                          step={formData.depositType === DepositType.PERCENTAGE ? "1" : "0.01"}
                          placeholder={formData.depositType === DepositType.PERCENTAGE ? "0" : "0.00"}
                          value={formData.depositValue || ''}
                          onChange={(e) => handleInputChange('depositValue', parseFloat(e.target.value) || 0)}
                        />
                        {formData.depositType === DepositType.PERCENTAGE && (
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Availability (new step) */}
            <TabsContent value="availability" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Booking Window</CardTitle>
                  <CardDescription>Set minimum/maximum rental duration and lead time.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
                    <div>
                      <Label htmlFor="minDays">Minimum Days</Label>
                      <Input
                        id="minDays"
                        type="number"
                        min={1}
                        placeholder="1"
                        value={formData.minDays || ''}
                        onChange={(e) => {
                          const value = e.target.value
                          if (value === '') {
                            handleInputChange('minDays', 1)
                          } else {
                            const numValue = parseInt(value)
                            if (!isNaN(numValue)) {
                              handleInputChange('minDays', Math.max(1, numValue))
                            }
                          }
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxDays">Maximum Days</Label>
                      <Input
                        id="maxDays"
                        type="number"
                        min={formData.minDays || 1}
                        placeholder="No limit"
                        value={formData.maxDays || ''}
                        onChange={(e) => {
                          const value = e.target.value
                          if (value === '') {
                            handleInputChange('maxDays', undefined)
                          } else {
                            const numValue = parseInt(value)
                            if (!isNaN(numValue)) {
                              handleInputChange('maxDays', Math.max(formData.minDays || 1, numValue))
                            }
                          }
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="advanceNotice">Advance Notice (days)</Label>
                      <Input
                        id="advanceNotice"
                        type="number"
                        min={0}
                        placeholder="0"
                        value={formData.availabilityRules.advanceNoticeDays || ''}
                        onChange={(e) => {
                          const value = e.target.value
                          if (value === '') {
                            handleNestedChange('availabilityRules', 'advanceNoticeDays', 0)
                          } else {
                            const numValue = parseInt(value)
                            if (!isNaN(numValue)) {
                              handleNestedChange('availabilityRules', 'advanceNoticeDays', Math.max(0, numValue))
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Days Available</CardTitle>
                  <CardDescription>Control whether the listing is available on weekdays or weekends. Also manage exceptions and recurring unavailable patterns below.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <Label>Weekdays (Mon–Fri)</Label>
                        <p className="text-xs text-muted-foreground">Allow bookings on weekdays</p>
                      </div>
                      <Switch
                        checked={Boolean((formData.availabilityRules as any)?.weekdays ?? true)}
                        onCheckedChange={(checked) => handleNestedChange('availabilityRules', 'weekdays', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <Label>Weekends (Sat–Sun)</Label>
                        <p className="text-xs text-muted-foreground">Allow bookings on weekends</p>
                      </div>
                      <Switch
                        checked={Boolean((formData.availabilityRules as any)?.weekends ?? true)}
                        onCheckedChange={(checked) => handleNestedChange('availabilityRules', 'weekends', checked)}
                      />
                    </div>
                  </div>

                  {/* Exceptions input */}
                  <div className="mt-4 border-t pt-4">
                    <Label className="block mb-2">Exceptions (one-off date ranges)</Label>
                    <div className="flex gap-2 items-center">
                      <input type="date" id="exc-start" className="input" />
                      <input type="date" id="exc-end" className="input" />
                      <input type="text" id="exc-reason" placeholder="Reason (optional)" className="input" />
                      <button type="button" onClick={() => {
                        const s = (document.getElementById('exc-start') as HTMLInputElement).value
                        const e = (document.getElementById('exc-end') as HTMLInputElement).value
                        const r = (document.getElementById('exc-reason') as HTMLInputElement).value
                        if (s && e) addException(s, e, r)
                      }} className="btn">Add</button>
                    </div>

                    {exceptions.length > 0 && (
                      <ul className="mt-3 list-disc ml-6">
                        {exceptions.map((ex, i) => (
                          <li key={i} className="flex items-center justify-between">
                            <span>{ex.startDate} → {ex.endDate} {ex.reason ? `— ${ex.reason}` : ''}</span>
                            <button onClick={() => removeException(i)} className="text-red-600">Remove</button>
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="mt-6">
                      <Label className="block mb-2">Recurring patterns</Label>
                      <RecurrenceEditor value={recurrenceRule} onChange={(r) => setRecurrenceRule(r)} />
                    </div>
                    
                    <div className="mt-6">
                      <Label htmlFor="pickupAddress">Pickup Address</Label>
                      <Input
                        id="pickupAddress"
                        placeholder="Enter pickup address (e.g., 123 Main St, Cape Town)"
                        value={formData.pickupAddress || ''}
                        onChange={(e) => handleInputChange('pickupAddress', e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        This address will be shown to renters for pickup location
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Logistics */}
            <TabsContent value="logistics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Pickup & Delivery</CardTitle>
                  <CardDescription>
                    Configure how renters can get your item
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="pickupAvailable">Pickup Available</Label>
                    <Switch
                      id="pickupAvailable"
                      checked={formData.deliveryOptions.pickupAvailable}
                      onCheckedChange={(checked) => 
                        handleNestedChange('deliveryOptions', 'pickupAvailable', checked)
                      }
                    />
                  </div>

                  {formData.deliveryOptions.pickupAvailable && (
                    <div>
                      <Label htmlFor="pickupInstructions">Pickup Instructions</Label>
                      <Textarea
                        id="pickupInstructions"
                        placeholder="Provide instructions for pickup location and process..."
                        value={formData.deliveryOptions.pickupInstructions || ''}
                        onChange={(e) => 
                          handleNestedChange('deliveryOptions', 'pickupInstructions', e.target.value)
                        }
                        rows={2}
                      />
                      <div className="mt-3">
                        <Label htmlFor="pickupLocation">Pickup Location (address)</Label>
                        <div className="relative">
                          <Input id="pickupLocation" autoComplete="off" placeholder="e.g. 123 Main St, Cape Town" value={formData.deliveryOptions.pickupLocation || ''} onChange={(e) => {
                            handleNestedChange('deliveryOptions', 'pickupLocation', e.target.value)
                            const v = e.target.value
                            if (placeTimer.current) clearTimeout(placeTimer.current)
                            if (v.trim().length > 2) {
                              placeTimer.current = setTimeout(() => {
                                fetch(`/api/places/autocomplete?q=${encodeURIComponent(v)}`)
                                  .then(r => r.json())
                                  .then(j => { console.debug('[places.autocomplete] client got', j); if (j.success) setPlaceSuggestions(j.data || []) })
                                  .catch((e) => { console.debug('places fetch err', e) })
                              }, 300)
                            } else {
                              setPlaceSuggestions([])
                            }
                          }} onFocus={(e) => {
                            const v = e.currentTarget.value
                            if (v.trim().length > 2) {
                              fetch(`/api/places/autocomplete?q=${encodeURIComponent(v)}`)
                                .then(r => r.json())
                                .then(j => { if (j.success) setPlaceSuggestions(j.data || []) })
                                .catch(() => {})
                            }
                          }} onBlur={() => { setTimeout(() => setPlaceSuggestions([]), 250) }} />
                          {placeSuggestions.length > 0 && (
                            <div className="absolute z-30 left-0 right-0 bg-white border mt-1 max-h-48 overflow-auto">
                              {placeSuggestions.map((p, i) => (
                                <div key={i} className="p-2 hover:bg-gray-100 cursor-pointer" onClick={() => {
                                  handleNestedChange('deliveryOptions', 'pickupLocation', p.description)
                                  setPlaceSuggestions([])
                                }}>{p.description}</div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-muted-foreground">
                        This pickup location will be saved to your profile and used as the default for future listings. Change it anytime in Settings.
                      </div>
                      <div className="mt-2">
                        <Button variant="outline" size="sm" onClick={async () => {
                          // save to profile
                          try {
                            await fetch('/api/profile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pickupLocation: formData.deliveryOptions.pickupLocation }) })
                            alert('Pickup location saved to your profile')
                          } catch (e) {
                            console.error(e)
                            alert('Failed to save pickup location')
                          }
                        }}>Save to profile</Button>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <Label htmlFor="deliveryAvailable">Delivery Available</Label>
                    <Switch
                      id="deliveryAvailable"
                      checked={formData.deliveryOptions.deliveryAvailable}
                      onCheckedChange={(checked) => 
                        handleNestedChange('deliveryOptions', 'deliveryAvailable', checked)
                      }
                    />
                  </div>

                  {formData.deliveryOptions.deliveryAvailable && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="deliveryFeeType">Delivery Fee Type</Label>
                          <Select
                            value={formData.deliveryOptions.deliveryFeeType}
                            onValueChange={(value) => 
                              handleNestedChange('deliveryOptions', 'deliveryFeeType', value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="fixed">Fixed Fee</SelectItem>
                              <SelectItem value="per_km">Per Kilometer</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="deliveryFee">Delivery Fee (ZAR)</Label>
                          <Input
                            id="deliveryFee"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            value={formData.deliveryOptions.deliveryFee || ''}
                            onChange={(e) => 
                              handleNestedChange('deliveryOptions', 'deliveryFee', parseFloat(e.target.value) || 0)
                            }
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="deliveryRadius">Delivery Radius (km)</Label>
                        <Input
                          id="deliveryRadius"
                          type="number"
                          min="1"
                          placeholder="50"
                          value={formData.deliveryOptions.deliveryRadius || ''}
                          onChange={(e) => 
                            handleNestedChange('deliveryOptions', 'deliveryRadius', parseInt(e.target.value) || 50)
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="deliveryInstructions">Delivery Instructions</Label>
                        <Textarea
                          id="deliveryInstructions"
                          placeholder="Provide instructions for delivery process..."
                          value={formData.deliveryOptions.deliveryInstructions || ''}
                          onChange={(e) => 
                            handleNestedChange('deliveryOptions', 'deliveryInstructions', e.target.value)
                          }
                          rows={2}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Availability settings moved to its own step */}
            </TabsContent>

            {/* Settings */}
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Booking Settings</CardTitle>
                  <CardDescription>
                    Configure how your item can be booked
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Instant Book</Label>
                      <p className="text-sm text-gray-600">Allow users to book instantly without approval</p>
                    </div>
                    <Switch
                      checked={formData.instantBook}
                      onCheckedChange={(checked) => handleInputChange('instantBook', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Requires KYC</Label>
                      <p className="text-sm text-gray-600">Only allow verified users to rent this item</p>
                    </div>
                    <Switch
                      checked={formData.requiresKyc}
                      onCheckedChange={(checked) => handleInputChange('requiresKyc', checked)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="maxDistance">Maximum Distance (km)</Label>
                    <Input
                      id="maxDistance"
                      type="number"
                      min="1"
                      placeholder="No limit"
                      value={formData.maxDistance || ''}
                      onChange={(e) => handleInputChange('maxDistance', parseFloat(e.target.value) || undefined)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="cancellationPolicy">Cancellation Policy</Label>
                    <Select
                      value={formData.cancellationPolicy}
                      onValueChange={(value) => handleInputChange('cancellationPolicy', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={CancellationPolicy.MODERATE}>
                          Renter gets 50% refund (if cancellation within 24 hours of start)
                        </SelectItem>
                        <SelectItem value={CancellationPolicy.FLEXIBLE}>
                          Renter gets 100% refund (if cancellation within 24 hours of start)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="mt-2 text-sm text-gray-600 dark:text-slate-200">
                      Full refund 5 days prior to pickup.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Your deposit is protected by our secure payment system and will be released upon successful return of the item.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t">
            <div>
              <Button
                variant="outline"
                onClick={() => {
                  const idx = TAB_ORDER.indexOf(activeTab)
                  if (idx > 0) {
                    const prev = TAB_ORDER[Math.max(0, idx - 1)]
                    setActiveTab(prev)
                  } else {
                    router.back()
                  }
                }}
              >
                Back
              </Button>
            </div>
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard/listings')}
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSubmit('save')}
                disabled={saving}
              >
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Draft
              </Button>
              {activeTab !== 'settings' ? (
                <Button
                  onClick={() => {
                    const idx = TAB_ORDER.indexOf(activeTab)
                    const next = TAB_ORDER[Math.min(idx + 1, TAB_ORDER.length - 1)]
                    setActiveTab(next)
                  }}
                >
                  Next
                </Button>
              ) : (
                <Button onClick={() => handleSubmit('publish')} disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Publish Listing
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
