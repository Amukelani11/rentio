'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Plus,
  DollarSign,
  Calendar,
  TrendingUp,
  Edit,
  Trash2,
  Save,
  X,
  Calendar as CalendarIcon,
  Clock
} from 'lucide-react';
import { Role } from '@/lib/types';

interface PricingRule {
  id: string;
  name: string;
  description: string;
  rule_type: 'WEEKEND' | 'HOLIDAY' | 'SEASONAL' | 'CUSTOM';
  adjustment_type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  adjustment_value: number;
  start_date?: string;
  end_date?: string;
  weekend_days?: number[];
  holiday_date?: string;
  is_recurring_holiday?: boolean;
  min_stay_days: number;
  max_stay_days?: number;
  is_active: boolean;
  listing_title?: string;
}

export default function PricingPage() {
  const [user, setUser] = useState<any>(null);
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRule, setEditingRule] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    rule_type: 'WEEKEND' as const,
    adjustment_type: 'PERCENTAGE' as const,
    adjustment_value: 0,
    start_date: '',
    end_date: '',
    weekend_days: [6, 0], // Saturday, Sunday
    holiday_date: '',
    is_recurring_holiday: false,
    min_stay_days: 1,
    max_stay_days: '',
    listing_id: 'ALL',
    is_active: true
  });

  useEffect(() => {
    fetchUserData();
    fetchPricingRules();
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

  const fetchPricingRules = async () => {
    try {
      const response = await fetch('/api/business/pricing');
      if (response.ok) {
        const data = await response.json();
        setPricingRules(data.pricingRules || []);
      }
    } catch (error) {
      console.error('Error fetching pricing rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...formData,
        max_stay_days: formData.max_stay_days ? parseInt(formData.max_stay_days) : null,
        weekend_days: formData.rule_type === 'WEEKEND' ? formData.weekend_days : null,
        holiday_date: formData.rule_type === 'HOLIDAY' ? formData.holiday_date : null,
        is_recurring_holiday: formData.rule_type === 'HOLIDAY' ? formData.is_recurring_holiday : null,
        start_date: formData.rule_type === 'SEASONAL' ? formData.start_date : null,
        end_date: formData.rule_type === 'SEASONAL' ? formData.end_date : null
      };

      const response = await fetch('/api/business/pricing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setShowAddForm(false);
        setEditingRule(null);
        resetForm();
        fetchPricingRules();
      }
    } catch (error) {
      console.error('Error saving pricing rule:', error);
    }
  };

  const handleEdit = (rule: PricingRule) => {
    setFormData({
      name: rule.name,
      description: rule.description,
      rule_type: rule.rule_type,
      adjustment_type: rule.adjustment_type,
      adjustment_value: rule.adjustment_value,
      start_date: rule.start_date || '',
      end_date: rule.end_date || '',
      weekend_days: rule.weekend_days || [6, 0],
      holiday_date: rule.holiday_date || '',
      is_recurring_holiday: rule.is_recurring_holiday || false,
      min_stay_days: rule.min_stay_days,
      max_stay_days: rule.max_stay_days?.toString() || '',
      listing_id: 'ALL',
      is_active: rule.is_active
    });
    setEditingRule(rule.id);
    setShowAddForm(true);
  };

  const handleDelete = async (ruleId: string) => {
    if (!confirm('Are you sure you want to delete this pricing rule?')) return;

    try {
      const response = await fetch(`/api/business/pricing/${ruleId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchPricingRules();
      }
    } catch (error) {
      console.error('Error deleting pricing rule:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      rule_type: 'WEEKEND',
      adjustment_type: 'PERCENTAGE',
      adjustment_value: 0,
      start_date: '',
      end_date: '',
      weekend_days: [6, 0],
      holiday_date: '',
      is_recurring_holiday: false,
      min_stay_days: 1,
      max_stay_days: '',
      listing_id: 'ALL',
      is_active: true
    });
  };

  const getRuleTypeDescription = (ruleType: string) => {
    switch (ruleType) {
      case 'WEEKEND': return 'Weekend Rates';
      case 'HOLIDAY': return 'Holiday Pricing';
      case 'SEASONAL': return 'Seasonal Rates';
      case 'CUSTOM': return 'Custom Period';
      default: return ruleType;
    }
  };

  const getAdjustmentDisplay = (rule: PricingRule) => {
    if (rule.adjustment_type === 'PERCENTAGE') {
      return `${rule.adjustment_value > 0 ? '+' : ''}${rule.adjustment_value}%`;
    } else {
      return `R ${rule.adjustment_value > 0 ? '+' : ''}${rule.adjustment_value}`;
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive
      ? <Badge className="bg-green-100 text-green-800">Active</Badge>
      : <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
  };

  // Calculate statistics
  const activeRules = pricingRules.filter(r => r.is_active).length;
  const weekendRules = pricingRules.filter(r => r.rule_type === 'WEEKEND').length;
  const seasonalRules = pricingRules.filter(r => r.rule_type === 'SEASONAL').length;
  const holidayRules = pricingRules.filter(r => r.rule_type === 'HOLIDAY').length;

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
          <DollarSign className="h-12 w-12 text-red-500 mx-auto mb-4" />
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
            <h1 className="text-3xl font-bold text-gray-900">Dynamic Pricing</h1>
            <p className="text-gray-600 mt-1">Manage seasonal rates and pricing rules</p>
          </div>
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Pricing Rule
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Rules</p>
                  <p className="text-2xl font-bold">{pricingRules.length}</p>
                </div>
                <DollarSign className="h-8 w-8 text-coral-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-green-600">{activeRules}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Weekend Rules</p>
                  <p className="text-2xl font-bold text-blue-600">{weekendRules}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Seasonal Rules</p>
                  <p className="text-2xl font-bold text-purple-600">{seasonalRules}</p>
                </div>
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {editingRule ? 'Edit Pricing Rule' : 'Add Pricing Rule'}
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingRule(null);
                    resetForm();
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Rule Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Weekend Surcharge"
                  />
                </div>
                <div>
                  <Label htmlFor="rule_type">Rule Type</Label>
                  <Select
                    value={formData.rule_type}
                    onValueChange={(value: any) => setFormData({...formData, rule_type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WEEKEND">Weekend Rates</SelectItem>
                      <SelectItem value="HOLIDAY">Holiday Pricing</SelectItem>
                      <SelectItem value="SEASONAL">Seasonal Rates</SelectItem>
                      <SelectItem value="CUSTOM">Custom Period</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Additional charges for weekend bookings"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="adjustment_type">Adjustment Type</Label>
                  <Select
                    value={formData.adjustment_type}
                    onValueChange={(value: any) => setFormData({...formData, adjustment_type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                      <SelectItem value="FIXED_AMOUNT">Fixed Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="adjustment_value">Adjustment Value</Label>
                  <Input
                    id="adjustment_value"
                    type="number"
                    value={formData.adjustment_value}
                    onChange={(e) => setFormData({...formData, adjustment_value: parseFloat(e.target.value) || 0})}
                    placeholder="20"
                  />
                </div>
                <div className="flex items-end">
                  <Label className="text-sm text-gray-500">
                    {formData.adjustment_type === 'PERCENTAGE' ? '%' : 'R'}
                  </Label>
                </div>
              </div>

              {/* Rule-specific fields */}
              {formData.rule_type === 'SEASONAL' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end_date">End Date</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                    />
                  </div>
                </div>
              )}

              {formData.rule_type === 'HOLIDAY' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="holiday_date">Holiday Date</Label>
                    <Input
                      id="holiday_date"
                      type="date"
                      value={formData.holiday_date}
                      onChange={(e) => setFormData({...formData, holiday_date: e.target.value})}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_recurring_holiday"
                      checked={formData.is_recurring_holiday}
                      onChange={(e) => setFormData({...formData, is_recurring_holiday: e.target.checked})}
                      className="rounded"
                    />
                    <Label htmlFor="is_recurring_holiday">Recurring annually</Label>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="min_stay_days">Minimum Stay (days)</Label>
                  <Input
                    id="min_stay_days"
                    type="number"
                    value={formData.min_stay_days}
                    onChange={(e) => setFormData({...formData, min_stay_days: parseInt(e.target.value) || 1})}
                  />
                </div>
                <div>
                  <Label htmlFor="max_stay_days">Maximum Stay (days)</Label>
                  <Input
                    id="max_stay_days"
                    type="number"
                    value={formData.max_stay_days}
                    onChange={(e) => setFormData({...formData, max_stay_days: e.target.value})}
                    placeholder="No limit"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSubmit}>
                  <Save className="mr-2 h-4 w-4" />
                  {editingRule ? 'Update Rule' : 'Create Rule'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingRule(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pricing Rules List */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing Rules</CardTitle>
            <CardDescription>
              Manage your dynamic pricing rules and seasonal rates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pricingRules.map((rule) => (
                <div key={rule.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{rule.name}</h3>
                        <Badge variant="outline">{getRuleTypeDescription(rule.rule_type)}</Badge>
                        {getStatusBadge(rule.is_active)}
                      </div>

                      <p className="text-gray-600 text-sm mb-3">{rule.description}</p>

                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="font-medium">Adjustment:</span>
                          <span className={rule.adjustment_value > 0 ? 'text-green-600' : 'text-red-600'}>
                            {getAdjustmentDisplay(rule)}
                          </span>
                        </div>

                        {rule.start_date && (
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="h-4 w-4 text-blue-600" />
                            <span>{rule.start_date} - {rule.end_date}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-purple-600" />
                          <span>Min stay: {rule.min_stay_days} days</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(rule)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(rule.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {pricingRules.length === 0 && (
                <div className="text-center py-8">
                  <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No pricing rules configured</p>
                  <Button onClick={() => setShowAddForm(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Rule
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}