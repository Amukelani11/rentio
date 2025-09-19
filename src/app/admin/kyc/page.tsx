'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Eye,
  Download,
  FileText,
  User,
  MapPin,
  Building,
  Calendar,
  Mail,
  Phone,
  Star,
  MoreVertical
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface KYCVerification {
  id: string;
  type: string;
  status: string;
  documents: any[];
  additionalInfo?: string;
  rejectionReason?: string;
  notes?: string;
  createdAt: string;
  reviewedAt?: string;
  reviewer?: {
    name: string;
  };
  user: {
    id: string;
    name: string;
    email: string;
    kyc_status: string;
    email_verified: boolean;
    phone_verified: boolean;
    avatar?: string;
    created_at: string;
  };
}

export default function AdminKYCPage() {
  const [user, setUser] = useState<any>(null);
  const [verifications, setVerifications] = useState<KYCVerification[]>([]);
  const [selectedVerification, setSelectedVerification] = useState<KYCVerification | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | 'request_more'>('approve');
  const [rejectionReason, setRejectionReason] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');

  useEffect(() => {
    fetchData();
  }, [statusFilter, typeFilter]);

  const fetchData = async () => {
    try {
      const [userResponse, verificationsResponse] = await Promise.all([
        fetch('/api/auth/user'),
        fetch(`/api/kyc?status=${statusFilter !== 'ALL' ? statusFilter : ''}&type=${typeFilter !== 'ALL' ? typeFilter : ''}`),
      ]);

      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData.user);
      }

      if (verificationsResponse.ok) {
        const verificationsData = await verificationsResponse.json();
        setVerifications(verificationsData.data.items);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VERIFIED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'IDENTITY': return <User className="h-5 w-5" />;
      case 'ADDRESS': return <MapPin className="h-5 w-5" />;
      case 'BUSINESS': return <Building className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'IDENTITY': return 'Identity Verification';
      case 'ADDRESS': return 'Address Verification';
      case 'BUSINESS': return 'Business Verification';
      default: return type;
    }
  };

  const handleReview = async () => {
    if (!selectedVerification) return;

    // Validate required fields based on action
    if ((reviewAction === 'reject' || reviewAction === 'request_more') && !rejectionReason) {
      alert('Please provide a reason for your decision');
      return;
    }

    setProcessing(true);

    try {
      const response = await fetch(`/api/kyc/${selectedVerification.id}/review`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: reviewAction,
          rejectionReason,
          notes: reviewNotes,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message || 'Review submitted successfully');
        setSelectedVerification(null);
        setRejectionReason('');
        setReviewNotes('');
        setReviewAction('approve'); // Reset to default
        fetchData();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to process review');
      }
    } catch (error) {
      console.error('Error processing review:', error);
      alert('An error occurred while processing the review');
    } finally {
      setProcessing(false);
    }
  };

  const filteredVerifications = verifications.filter((verification) => {
    const term = (searchTerm || '').toLowerCase()
    const name = (verification as any)?.user?.name ? String((verification as any).user.name).toLowerCase() : ''
    const email = (verification as any)?.user?.email ? String((verification as any).user.email).toLowerCase() : ''
    return name.includes(term) || email.includes(term)
  });
  const getStats = () => {
    return {
      total: verifications.length,
      pending: verifications.filter(v => v.status === 'PENDING').length,
      approved: verifications.filter(v => v.status === 'VERIFIED').length,
      rejected: verifications.filter(v => v.status === 'REJECTED').length,
      moreInfo: 0,
    };
  };

  const stats = getStats();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleViewDocument = async (doc: any) => {
    try {
      // Get signed URL for viewing the document
      const response = await fetch('/api/kyc/files', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filePaths: [doc.path] }),
      });

      if (response.ok) {
        const data = await response.json();
        const signedUrl = data.signedUrls[0];
        
        if (signedUrl && signedUrl !== 'UNAUTHORIZED' && signedUrl !== 'ERROR') {
          // Open the document in a new tab
          window.open(signedUrl, '_blank');
        } else {
          alert('Unable to generate view link for this document');
        }
      } else {
        alert('Failed to generate view link');
      }
    } catch (error) {
      console.error('Error viewing document:', error);
      alert('Error viewing document');
    }
  };

  const handleDownloadDocument = async (doc: any) => {
    try {
      // Get signed URL for downloading the document
      const response = await fetch('/api/kyc/files', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filePaths: [doc.path] }),
      });

      if (response.ok) {
        const data = await response.json();
        const signedUrl = data.signedUrls[0];
        
        if (signedUrl && signedUrl !== 'UNAUTHORIZED' && signedUrl !== 'ERROR') {
          // Create a temporary link to download the file
          const link = document.createElement('a');
          link.href = signedUrl;
          link.download = doc.name;
          link.target = '_blank';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          alert('Unable to generate download link for this document');
        }
      } else {
        alert('Failed to generate download link');
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Error downloading document');
    }
  };

  if (loading) {
    return (
      <DashboardLayout user={user}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">KYC Verification Management</h1>
          <p className="text-gray-600">Review and manage user verification requests</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">More Info</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.moreInfo}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Verification List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Verification Requests</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="space-y-3 mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Status</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="VERIFIED">Verified</SelectItem>
                        <SelectItem value="REJECTED">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Types</SelectItem>
                        <SelectItem value="IDENTITY">Identity</SelectItem>
                        <SelectItem value="ADDRESS">Address</SelectItem>
                        <SelectItem value="BUSINESS">Business</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Verification List */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredVerifications.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">No verification requests found</p>
                  ) : (
                    filteredVerifications.map((verification) => (
                      <div
                        key={verification.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedVerification?.id === verification.id ? 'border-coral-500 bg-coral-50' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedVerification(verification)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-lg ${
                            verification.status === 'PENDING' ? 'bg-yellow-100' :
                            verification.status === 'VERIFIED' ? 'bg-green-100' :
                            verification.status === 'REJECTED' ? 'bg-red-100' : 'bg-orange-100'
                          }`}>
                            {getTypeIcon(verification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-sm truncate">{verification.user?.name || 'Unknown User'}</h4>
                              <Badge className={getStatusColor(verification.status)}>
                                {verification.status.replace('_', ' ')}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-600 truncate">{verification.user?.email || '-'}</p>
                            <p className="text-xs text-gray-500">{getTypeName(verification.type)}</p>
                            <p className="text-xs text-gray-400">
                              {formatDate(verification.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Review Panel */}
          <div className="lg:col-span-2">
            {selectedVerification ? (
              <div className="space-y-6">
                {/* User Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>User Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                        {selectedVerification.user?.avatar ? (
                          <img 
                            src={selectedVerification.user.avatar} 
                            alt={selectedVerification.user.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{selectedVerification.user?.name || 'Unknown User'}</h3>
                          {selectedVerification.user?.kyc_status === 'VERIFIED' && (
                            <Badge className="bg-green-600">KYC Verified</Badge>
                          )}
                          {selectedVerification.user?.email_verified && (
                            <Badge className="bg-blue-600">Email Verified</Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-1" />
                            <span>{selectedVerification.user?.email || '-'}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>
                              Member since {selectedVerification.user?.created_at ? 
                                new Date(selectedVerification.user.created_at).toLocaleDateString() : 
                                'Unknown'
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Verification Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      {getTypeIcon(selectedVerification.type)}
                      <span className="ml-2">{getTypeName(selectedVerification.type)}</span>
                    </CardTitle>
                    <CardDescription>
                      Submitted on {formatDate(selectedVerification.createdAt)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Documents */}
                      <div>
                        <h4 className="font-medium text-sm mb-3">Submitted Documents</h4>
                        <div className="space-y-3">
                          {selectedVerification.documents.map((doc, index) => (
                            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center space-x-3">
                                <FileText className="h-5 w-5 text-gray-400" />
                                <div>
                                  <p className="font-medium text-sm">{doc.name}</p>
                                  <p className="text-xs text-gray-500">
                                    {(doc.size / 1024 / 1024).toFixed(2)} MB • Uploaded {formatDate(doc.uploadedAt)}
                                  </p>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleViewDocument(doc)}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleDownloadDocument(doc)}
                                >
                                  <Download className="h-4 w-4 mr-1" />
                                  Download
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Additional Information */}
                      {selectedVerification.additionalInfo && (
                        <div>
                          <h4 className="font-medium text-sm mb-2">Additional Information</h4>
                          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                            {selectedVerification.additionalInfo}
                          </p>
                        </div>
                      )}

                      {/* Review Status */}
                      {selectedVerification.status !== 'PENDING' && (
                        <div>
                          <h4 className="font-medium text-sm mb-2">Review History</h4>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            {selectedVerification.rejectionReason && (
                              <div className="mb-2">
                                <span className="font-medium text-sm">Decision: </span>
                                <span className="text-sm">{selectedVerification.rejectionReason}</span>
                              </div>
                            )}
                            {selectedVerification.notes && (
                              <div className="mb-2">
                                <span className="font-medium text-sm">Notes: </span>
                                <span className="text-sm">{selectedVerification.notes}</span>
                              </div>
                            )}
                            {selectedVerification.reviewedAt && (
                              <div className="text-xs text-gray-500">
                                Reviewed on {formatDate(selectedVerification.reviewedAt)}
                                {selectedVerification.reviewer && (
                                  <span> by {selectedVerification.reviewer.name}</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Review Form */}
                {selectedVerification.status === 'PENDING' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Review Verification</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Review Action */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Decision *
                          </label>
                          <div className="flex space-x-4">
                            {[
                              { value: 'approve', label: 'Approve', color: 'bg-green-100 text-green-800' },
                              { value: 'reject', label: 'Reject', color: 'bg-red-100 text-red-800' },
                              { value: 'request_more', label: 'Request More Info', color: 'bg-orange-100 text-orange-800' },
                            ].map((action) => (
                              <button
                                key={action.value}
                                type="button"
                                className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                                  reviewAction === action.value
                                    ? `${action.color} border-current`
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                                onClick={() => {
                                  setReviewAction(action.value as any)
                                  if (action.value === 'approve') {
                                    // Submit immediately for approve
                                    handleReview()
                                  }
                                }}
                              >
                                {action.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Reason */}
                        {(reviewAction === 'reject' || reviewAction === 'request_more') && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Reason *
                            </label>
                            <Textarea
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              placeholder="Explain the reason for your decision..."
                              rows={3}
                            />
                          </div>
                        )}

                        {/* Notes */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Internal Notes (Optional)
                          </label>
                          <Textarea
                            value={reviewNotes}
                            onChange={(e) => setReviewNotes(e.target.value)}
                            placeholder="Add any internal notes about this verification..."
                            rows={2}
                          />
                        </div>

                        {/* Submit */}
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            onClick={() => setSelectedVerification(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleReview}
                            disabled={processing || (reviewAction !== 'approve' && !rejectionReason)}
                          >
                            {processing ? 'Processing...' : 'Submit Review'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Select a verification to review</h3>
                  <p className="text-gray-600">
                    Choose a verification request from the list to view details and process it
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}




