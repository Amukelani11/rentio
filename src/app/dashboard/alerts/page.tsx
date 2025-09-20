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
  AlertTriangle,
  Bell,
  Mail,
  MessageSquare,
  Settings,
  Edit,
  Trash2,
  Save,
  X,
  CheckCircle,
  Clock,
  Package
} from 'lucide-react';
import { Role } from '@/lib/types';

type AlertType = 'LOW_STOCK' | 'OUT_OF_STOCK' | 'REORDER_POINT' | 'MAINTENANCE_DUE'
type Frequency = 'ONCE' | 'DAILY' | 'WEEKLY'

interface StockAlert {
  id: string;
  alert_type: AlertType;
  threshold_quantity?: number;
  threshold_percentage?: number;
  notify_email: boolean;
  notify_sms: boolean;
  notification_frequency: Frequency;
  is_active: boolean;
  last_triggered_at?: string;
  is_resolved: boolean;
  item_name: string;
  current_quantity: number;
  sku: string;
}

interface AlertNotification {
  id: string;
  notification_type: 'EMAIL' | 'SMS';
  recipient: string;
  message: string;
  status: 'PENDING' | 'SENT' | 'FAILED' | 'DELIVERED';
  sent_at?: string;
  delivered_at?: string;
  error_message?: string;
  alert_type: string;
  item_name: string;
  created_at: string;
}

export default function AlertsPage() {
  const [user, setUser] = useState<any>(null);
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([]);
  const [notifications, setNotifications] = useState<AlertNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAlert, setEditingAlert] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'alerts' | 'notifications'>('alerts');

  const [formData, setFormData] = useState({
    inventory_item_id: '',
    alert_type: 'LOW_STOCK' as AlertType,
    threshold_quantity: '',
    threshold_percentage: '',
    notify_email: true,
    notify_sms: false,
    notification_frequency: 'ONCE' as Frequency,
    is_active: true
  });

  useEffect(() => {
    fetchUserData();
    fetchStockAlerts();
    fetchNotifications();
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

  const fetchStockAlerts = async () => {
    try {
      const response = await fetch('/api/business/alerts');
      if (response.ok) {
        const data = await response.json();
        setStockAlerts(data.stockAlerts || []);
      }
    } catch (error) {
      console.error('Error fetching stock alerts:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/business/alerts/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...formData,
        threshold_quantity: formData.threshold_quantity ? parseInt(formData.threshold_quantity) : null,
        threshold_percentage: formData.threshold_percentage ? parseFloat(formData.threshold_percentage) : null
      };

      const response = await fetch('/api/business/alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setShowAddForm(false);
        setEditingAlert(null);
        resetForm();
        fetchStockAlerts();
      }
    } catch (error) {
      console.error('Error saving stock alert:', error);
    }
  };

  const handleEdit = (alert: StockAlert) => {
    setFormData({
      inventory_item_id: alert.id,
      alert_type: alert.alert_type,
      threshold_quantity: alert.threshold_quantity?.toString() || '',
      threshold_percentage: alert.threshold_percentage?.toString() || '',
      notify_email: alert.notify_email,
      notify_sms: alert.notify_sms,
      notification_frequency: alert.notification_frequency,
      is_active: alert.is_active
    });
    setEditingAlert(alert.id);
    setShowAddForm(true);
  };

  const handleDelete = async (alertId: string) => {
    if (!confirm('Are you sure you want to delete this alert?')) return;

    try {
      const response = await fetch(`/api/business/alerts/${alertId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchStockAlerts();
      }
    } catch (error) {
      console.error('Error deleting alert:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      inventory_item_id: '',
      alert_type: 'LOW_STOCK',
      threshold_quantity: '',
      threshold_percentage: '',
      notify_email: true,
      notify_sms: false,
      notification_frequency: 'ONCE',
      is_active: true
    });
  };

  const getAlertTypeDescription = (alertType: string) => {
    switch (alertType) {
      case 'LOW_STOCK': return 'Low Stock Alert';
      case 'OUT_OF_STOCK': return 'Out of Stock Alert';
      case 'REORDER_POINT': return 'Reorder Point Alert';
      case 'MAINTENANCE_DUE': return 'Maintenance Due Alert';
      default: return alertType;
    }
  };

  const getAlertTypeColor = (alertType: string) => {
    switch (alertType) {
      case 'LOW_STOCK': return 'bg-yellow-100 text-yellow-800';
      case 'OUT_OF_STOCK': return 'bg-red-100 text-red-800';
      case 'REORDER_POINT': return 'bg-orange-100 text-orange-800';
      case 'MAINTENANCE_DUE': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadge = (isActive: boolean, isResolved: boolean) => {
    if (isResolved) {
      return <Badge className="bg-green-100 text-green-800">Resolved</Badge>;
    }
    return isActive
      ? <Badge className="bg-green-100 text-green-800">Active</Badge>
      : <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
  };

  const getNotificationStatusBadge = (status: string) => {
    switch (status) {
      case 'SENT': return <Badge className="bg-green-100 text-green-800">Sent</Badge>;
      case 'DELIVERED': return <Badge className="bg-blue-100 text-blue-800">Delivered</Badge>;
      case 'FAILED': return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      case 'PENDING': return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default: return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  // Calculate statistics
  const activeAlerts = stockAlerts.filter(a => a.is_active && !a.is_resolved).length;
  const lowStockAlerts = stockAlerts.filter(a => a.alert_type === 'LOW_STOCK' && a.is_active && !a.is_resolved).length;
  const outOfStockAlerts = stockAlerts.filter(a => a.alert_type === 'OUT_OF_STOCK' && a.is_active && !a.is_resolved).length;
  const recentNotifications = notifications.filter(n => new Date(n.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)).length;

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
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
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
            <h1 className="text-3xl font-bold text-gray-900">Stock Alerts</h1>
            <p className="text-gray-600 mt-1">Manage automated inventory alerts and notifications</p>
          </div>
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Alert
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Alerts</p>
                  <p className="text-2xl font-bold">{stockAlerts.length}</p>
                </div>
                <Bell className="h-8 w-8 text-coral-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Alerts</p>
                  <p className="text-2xl font-bold text-green-600">{activeAlerts}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Low Stock</p>
                  <p className="text-2xl font-bold text-yellow-600">{lowStockAlerts}</p>
                </div>
                <Package className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Recent Notifications</p>
                  <p className="text-2xl font-bold text-blue-600">{recentNotifications}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-blue-600" />
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
                  {editingAlert ? 'Edit Alert' : 'Create Stock Alert'}
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingAlert(null);
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
                  <Label htmlFor="alert_type">Alert Type</Label>
                  <Select
                    value={formData.alert_type}
                    onValueChange={(value: any) => setFormData({...formData, alert_type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW_STOCK">Low Stock</SelectItem>
                      <SelectItem value="OUT_OF_STOCK">Out of Stock</SelectItem>
                      <SelectItem value="REORDER_POINT">Reorder Point</SelectItem>
                      <SelectItem value="MAINTENANCE_DUE">Maintenance Due</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(formData.alert_type === 'LOW_STOCK' || formData.alert_type === 'REORDER_POINT') && (
                  <div>
                    <Label htmlFor="threshold_quantity">Threshold Quantity</Label>
                    <Input
                      id="threshold_quantity"
                      type="number"
                      value={formData.threshold_quantity}
                      onChange={(e) => setFormData({...formData, threshold_quantity: e.target.value})}
                      placeholder="5"
                    />
                  </div>
                )}

                {formData.alert_type === 'LOW_STOCK' && (
                  <div>
                    <Label htmlFor="threshold_percentage">Threshold Percentage (%)</Label>
                    <Input
                      id="threshold_percentage"
                      type="number"
                      value={formData.threshold_percentage}
                      onChange={(e) => setFormData({...formData, threshold_percentage: e.target.value})}
                      placeholder="20"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="notify_email"
                    checked={formData.notify_email}
                    onChange={(e) => setFormData({...formData, notify_email: e.target.checked})}
                    className="rounded"
                  />
                  <Label htmlFor="notify_email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="notify_sms"
                    checked={formData.notify_sms}
                    onChange={(e) => setFormData({...formData, notify_sms: e.target.checked})}
                    className="rounded"
                  />
                  <Label htmlFor="notify_sms" className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    SMS
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    className="rounded"
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
              </div>

              <div>
                <Label htmlFor="notification_frequency">Notification Frequency</Label>
                <Select
                  value={formData.notification_frequency}
                  onValueChange={(value: any) => setFormData({...formData, notification_frequency: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ONCE">Once</SelectItem>
                    <SelectItem value="DAILY">Daily</SelectItem>
                    <SelectItem value="WEEKLY">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSubmit}>
                  <Save className="mr-2 h-4 w-4" />
                  {editingAlert ? 'Update Alert' : 'Create Alert'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingAlert(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <div className="flex border-b">
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'alerts' ? 'border-b-2 border-coral-600 text-coral-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('alerts')}
          >
            Stock Alerts
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'notifications' ? 'border-b-2 border-coral-600 text-coral-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('notifications')}
          >
            Notifications
          </button>
        </div>

        {/* Stock Alerts */}
        {activeTab === 'alerts' && (
          <Card>
            <CardHeader>
              <CardTitle>Active Stock Alerts</CardTitle>
              <CardDescription>
                Monitor your inventory levels and receive automatic notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stockAlerts.map((alert) => (
                  <div key={alert.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{alert.item_name}</h3>
                          <Badge variant="outline" className={getAlertTypeColor(alert.alert_type)}>
                            {getAlertTypeDescription(alert.alert_type)}
                          </Badge>
                          {getStatusBadge(alert.is_active, alert.is_resolved)}
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded">{alert.sku}</code>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center gap-1">
                            <Package className="h-4 w-4" />
                            <span>Current: {alert.current_quantity}</span>
                          </div>

                          {alert.threshold_quantity && (
                            <div className="flex items-center gap-1">
                              <AlertTriangle className="h-4 w-4" />
                              <span>Threshold: {alert.threshold_quantity}</span>
                            </div>
                          )}

                          {alert.threshold_percentage && (
                            <div className="flex items-center gap-1">
                              <AlertTriangle className="h-4 w-4" />
                              <span>Threshold: {alert.threshold_percentage}%</span>
                            </div>
                          )}

                          <div className="flex items-center gap-1">
                            <Bell className="h-4 w-4" />
                            <span>{alert.notification_frequency}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          {alert.notify_email && <Mail className="h-3 w-3" />}
                          {alert.notify_sms && <MessageSquare className="h-3 w-3" />}
                          {alert.last_triggered_at && (
                            <span>Last triggered: {new Date(alert.last_triggered_at).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(alert)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(alert.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {stockAlerts.length === 0 && (
                  <div className="text-center py-8">
                    <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No stock alerts configured</p>
                    <Button onClick={() => setShowAddForm(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Alert
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notifications */}
        {activeTab === 'notifications' && (
          <Card>
            <CardHeader>
              <CardTitle>Notification History</CardTitle>
              <CardDescription>
                Recent alert notifications sent via email and SMS
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.slice(0, 20).map((notification) => (
                  <div key={notification.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{notification.item_name}</h3>
                          <Badge variant="outline" className={getAlertTypeColor(notification.alert_type)}>
                            {getAlertTypeDescription(notification.alert_type)}
                          </Badge>
                          {getNotificationStatusBadge(notification.status)}
                        </div>

                        <p className="text-sm text-gray-600 mb-2">{notification.message}</p>

                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            {notification.notification_type === 'EMAIL' ? (
                              <Mail className="h-3 w-3" />
                            ) : (
                              <MessageSquare className="h-3 w-3" />
                            )}
                            <span>{notification.recipient}</span>
                          </div>
                          <span>Created: {new Date(notification.created_at).toLocaleString()}</span>
                          {notification.sent_at && (
                            <span>Sent: {new Date(notification.sent_at).toLocaleString()}</span>
                          )}
                          {notification.error_message && (
                            <span className="text-red-600">Error: {notification.error_message}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {notifications.length === 0 && (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No notifications found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}