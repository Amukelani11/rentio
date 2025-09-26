'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  UserPlus,
  Mail,
  Phone,
  Building,
  Calendar,
  Edit,
  Trash2,
  Shield,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { Role } from '@/lib/types';

interface TeamMember {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'OWNER' | 'MANAGER' | 'OPERATIONS' | 'FINANCE' | 'SUPPORT';
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  permissions: string[];
  joined_at: string;
  last_login?: string;
}

interface InviteData {
  email: string;
  role: 'MANAGER' | 'OPERATIONS' | 'FINANCE' | 'SUPPORT';
  permissions: string[];
}

export default function TeamPage() {
  const [user, setUser] = useState<any>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [inviteData, setInviteData] = useState<InviteData>({
    email: '',
    role: 'MANAGER',
    permissions: []
  });

  useEffect(() => {
    fetchUserData();
    fetchTeamMembers();
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

  const fetchTeamMembers = async () => {
    try {
      const response = await fetch('/api/business/team');
      if (response.ok) {
        const data = await response.json();
        setTeamMembers(data.teamMembers || []);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteData.email) return;

    setInviting(true);
    try {
      const response = await fetch('/api/business/team/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inviteData),
      });

      if (response.ok) {
        setShowInviteForm(false);
        setInviteData({ email: '', role: 'MANAGER', permissions: [] });
        fetchTeamMembers(); // Refresh the list
      } else {
        console.error('Error inviting team member');
      }
    } catch (error) {
      console.error('Error inviting team member:', error);
    } finally {
      setInviting(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'OWNER':
        return <Badge className="bg-purple-100 text-purple-800">Owner</Badge>;
      case 'MANAGER':
        return <Badge className="bg-blue-100 text-blue-800">Manager</Badge>;
      case 'OPERATIONS':
        return <Badge className="bg-green-100 text-green-800">Operations</Badge>;
      case 'FINANCE':
        return <Badge className="bg-yellow-100 text-yellow-800">Finance</Badge>;
      case 'SUPPORT':
        return <Badge className="bg-cyan-100 text-cyan-800">Support</Badge>;
      default:
        return <Badge>{role}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'INACTIVE':
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'OWNER':
        return 'Full access to all business features and settings';
      case 'MANAGER':
        return 'Can manage listings, bookings, and team members';
      case 'OPERATIONS':
        return 'Can manage bookings, deliveries, and returns';
      case 'FINANCE':
        return 'Can view earnings, manage payouts, and financial reports';
      case 'SUPPORT':
        return 'Can handle customer inquiries and support tickets';
      default:
        return '';
    }
  };

  const availablePermissions = [
    'view_listings',
    'edit_listings',
    'create_listings',
    'view_bookings',
    'manage_bookings',
    'view_earnings',
    'manage_payouts',
    'view_customers',
    'manage_team',
    'view_analytics'
  ];

  const permissionLabels = {
    'view_listings': 'View Listings',
    'edit_listings': 'Edit Listings',
    'create_listings': 'Create Listings',
    'view_bookings': 'View Bookings',
    'manage_bookings': 'Manage Bookings',
    'view_earnings': 'View Earnings',
    'manage_payouts': 'Manage Payouts',
    'view_customers': 'View Customers',
    'manage_team': 'Manage Team',
    'view_analytics': 'View Analytics'
  };

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
          <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
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
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
            <p className="text-gray-600 mt-1">Manage your business team and permissions</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setShowInviteForm(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Invite Team Member
            </Button>
          </div>
        </div>

        {/* Team Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Team</p>
                  <p className="text-2xl font-bold">{teamMembers.length}</p>
                </div>
                <Users className="h-8 w-8 text-coral-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-green-600">
                    {teamMembers.filter(m => m.status === 'ACTIVE').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {teamMembers.filter(m => m.status === 'PENDING').length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Managers</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {teamMembers.filter(m => m.role === 'MANAGER').length}
                  </p>
                </div>
                <Building className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invite Form */}
        {showInviteForm && (
          <Card>
            <CardHeader>
              <CardTitle>Invite Team Member</CardTitle>
              <CardDescription>
                Send an invitation to join your business team
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={inviteData.email}
                    onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                    placeholder="team@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <select
                    id="role"
                    value={inviteData.role}
                    onChange={(e) => setInviteData({ ...inviteData, role: e.target.value as any })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                  >
                    <option value="MANAGER">Manager</option>
                    <option value="OPERATIONS">Operations</option>
                    <option value="FINANCE">Finance</option>
                    <option value="SUPPORT">Support</option>
                  </select>
                </div>
              </div>

              <div>
                <Label>Role Description</Label>
                <p className="mt-1 text-sm text-gray-600">
                  {getRoleDescription(inviteData.role)}
                </p>
              </div>

              <div>
                <Label>Permissions</Label>
                <div className="grid grid-cols-1 gap-2 py-2 sm:grid-cols-2 md:grid-cols-3">
                  {availablePermissions.map((permission) => (
                    <label key={permission} className="flex items-center gap-2 rounded-lg border border-gray-200 p-2 hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={inviteData.permissions.includes(permission)}
                        onChange={(e) => {
                          const newPermissions = e.target.checked
                            ? [...inviteData.permissions, permission]
                            : inviteData.permissions.filter(p => p !== permission);
                          setInviteData({ ...inviteData, permissions: newPermissions });
                        }}
                        className="rounded border-gray-300 text-coral-600"
                      />
                      <span className="text-sm">{permissionLabels[permission as keyof typeof permissionLabels]}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button className="flex-1" onClick={handleInvite} disabled={inviting || !inviteData.email}>
                  {inviting ? 'Sending Invite...' : 'Send Invitation'}
                </Button>
                <Button className="flex-1" variant="outline" onClick={() => setShowInviteForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Team Members List */}
        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>
              Manage your business team members and their permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teamMembers.map((member) => (
                <div key={member.id} className="rounded-lg border p-4 hover:bg-gray-50">
                  <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
                    <div className="flex gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-coral-100">
                        <span className="text-coral-600 font-semibold text-lg">
                          {member.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold">{member.name}</h3>
                          {getRoleBadge(member.role)}
                          {getStatusBadge(member.status)}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            {member.email}
                          </div>
                          {member.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-4 w-4" />
                              {member.phone}
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Joined {new Date(member.joined_at).toLocaleDateString()}
                          </div>
                        </div>

                        {member.permissions.length > 0 && (
                          <div className="mt-2">
                            <p className="mb-1 text-xs text-gray-500">Permissions:</p>
                            <div className="flex flex-wrap gap-1">
                              {member.permissions.map((permission) => (
                                <Badge key={permission} variant="outline" className="text-xs">
                                  {permissionLabels[permission as keyof typeof permissionLabels]}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Button variant="outline" size="sm" className="w-full sm:w-auto">
                        <Edit className="h-4 w-4" />
                      </Button>
                      {member.role !== 'OWNER' && (
                        <Button variant="outline" size="sm" className="w-full text-red-600 hover:text-red-700 sm:w-auto">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {teamMembers.length === 0 && (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No team members yet</p>
                  <Button onClick={() => setShowInviteForm(true)}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Invite Your First Team Member
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