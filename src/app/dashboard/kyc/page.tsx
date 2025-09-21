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
  Upload, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  User,
  MapPin,
  Building,
  Camera,
  Plus,
  Eye,
  Download,
  Info
} from 'lucide-react';

interface KYCDocument {
  type: string;
  name: string;
  description: string;
  required: boolean;
  uploaded: boolean;
  url?: string;
}

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
}

const verificationTypes = [
  {
    id: 'IDENTITY',
    name: 'Identity Verification',
    description: 'Verify your identity with government-issued ID documents',
    icon: User,
    documents: [
      { type: 'ID_FRONT', name: 'ID Document (Front)', description: 'Clear photo of the front of your ID', required: true },
      { type: 'ID_BACK', name: 'ID Document (Back)', description: 'Clear photo of the back of your ID', required: true },
      { type: 'SELFIE', name: 'Selfie with ID', description: 'Selfie holding your ID document', required: true },
    ],
  },
  {
    id: 'ADDRESS',
    name: 'Address Verification',
    description: 'Proof of your residential address',
    icon: MapPin,
    documents: [
      { type: 'UTILITY_BILL', name: 'Utility Bill', description: 'Recent utility bill (not older than 3 months)', required: false },
      { type: 'BANK_STATEMENT', name: 'Bank Statement', description: 'Recent bank statement (not older than 3 months)', required: false },
    ],
  },
  {
    id: 'BUSINESS',
    name: 'Business Verification',
    description: 'Verify your business registration and details',
    icon: Building,
    documents: [
      { type: 'BUSINESS_REGISTRATION', name: 'Business Registration', description: 'Business registration certificate', required: true },
      { type: 'TAX_CLEARANCE', name: 'Tax Clearance', description: 'Valid tax clearance certificate', required: true },
      { type: 'BUSINESS_ADDRESS', name: 'Business Address Proof', description: 'Proof of business address', required: true },
    ],
  },
];

// Determine which verification types are available based on user roles
const getAvailableVerificationTypesForUser = (u: any | null) => {
  const roles: string[] = Array.isArray(u?.roles) ? u!.roles : []
  if (roles.includes('BUSINESS_LISTER')) {
    return verificationTypes.filter(t => t.id === 'BUSINESS')
  }
  // Non-business users: identity/address only
  return verificationTypes.filter(t => t.id !== 'BUSINESS')
}

export default function KYCPage() {
  const [user, setUser] = useState<any>(null);
  const [verifications, setVerifications] = useState<KYCVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('');
  const [documents, setDocuments] = useState<Record<string, File>>({});
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, { path: string, name: string, size: number, url?: string }>>({});
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [addressProofChoice, setAddressProofChoice] = useState<string>('');
  const [documentUrls, setDocumentUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [userResponse, verificationsResponse] = await Promise.all([
        fetch('/api/auth/user'),
        fetch('/api/kyc'),
      ]);

      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData.user);
      }

      if (verificationsResponse.ok) {
        const verificationsData = await verificationsResponse.json();
        setVerifications(verificationsData.data.items);
        
        // Fetch signed URLs for all documents
        await fetchDocumentUrls(verificationsData.data.items);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocumentUrls = async (verifications: KYCVerification[]) => {
    try {
      const allFilePaths: string[] = [];
      verifications.forEach(verification => {
        verification.documents.forEach((doc: any) => {
          if (doc.path) {
            allFilePaths.push(doc.path);
          }
        });
      });

      if (allFilePaths.length > 0) {
        const response = await fetch('/api/kyc/files', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ filePaths: allFilePaths }),
        });

        if (response.ok) {
          const data = await response.json();
          const urlMap: Record<string, string> = {};
          allFilePaths.forEach((path, index) => {
            urlMap[path] = data.signedUrls[index];
          });
          setDocumentUrls(urlMap);
        }
      }
    } catch (error) {
      console.error('Error fetching document URLs:', error);
    }
  };

  const handleFileUpload = async (docType: string, file: File) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'image/jpg']
    if (!allowedTypes.includes(file.type)) {
      alert(`Invalid file type: ${file.type}. Please upload JPG, PNG, PDF, or WebP files.`)
      return
    }
    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      alert(`File too large: ${file.name}. Maximum size is 10MB.`)
      return
    }
    
    console.log('[KYC upload] Starting upload for:', docType, file.name)
    
    // Set uploading state
    setUploading(prev => ({ ...prev, [docType]: true }))
    
    try {
      // Use our new upload API
      const formData = new FormData()
      formData.append('files', file)
      
      const response = await fetch('/api/kyc/upload', {
        method: 'POST',
        body: formData,
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Upload failed')
      }
      
      console.log('[KYC upload] Upload successful:', result)
      
      // Store the file info for later use
      setDocuments(prev => ({
        ...prev,
        [docType]: file
      }))
      
      setUploadedDocs(prev => ({ 
        ...prev, 
        [docType]: { 
          path: result.files[0]?.path, 
          name: file.name, 
          size: file.size 
        } 
      }))
      
    } catch (error) {
      console.error('[KYC upload] Upload failed:', error)
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setUploading(prev => ({ ...prev, [docType]: false }))
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'MORE_INFO_REQUIRED': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'REJECTED': return <XCircle className="h-5 w-5 text-red-600" />;
      case 'PENDING': return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'MORE_INFO_REQUIRED': return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      default: return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getVerificationType = (typeId: string) => {
    return verificationTypes.find(t => t.id === typeId);
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType) return;

    const verificationType = getVerificationType(selectedType);
    if (!verificationType) return;

    // Validation rules
    // 1) For ADDRESS: require user to choose the document type, and upload that one
    if (verificationType.id === 'ADDRESS') {
      if (addressProofChoice !== 'UTILITY_BILL' && addressProofChoice !== 'BANK_STATEMENT') {
        alert('Please select which document to upload (Utility Bill or Bank Statement).')
        return
      }
      if (!documents[addressProofChoice]) {
        alert('Please upload the selected document.')
        return
      }
    } else {
      // 2) For other types: all documents marked required must be provided
      const requiredDocs = verificationType.documents.filter(d => d.required)
      const missingDocs = requiredDocs.filter(doc => !documents[doc.type])
      if (missingDocs.length > 0) {
        alert(`Please upload all required documents: ${missingDocs.map(d => d.name).join(', ')}`)
        return
      }
    }

    setSubmitting(true);

    try {
      // Upload files to private KYC bucket
      const formData = new FormData();
      Object.entries(documents).forEach(([type, file]) => {
        formData.append('files', file);
      });

      const uploadResponse = await fetch('/api/kyc/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        alert(errorData.error || 'Failed to upload documents');
        return;
      }

      const uploadData = await uploadResponse.json();
      const uploadedDocuments = uploadData.files.map((file: any, index: number) => {
        const docType = Object.keys(documents)[index];
        return {
          type: docType,
          name: file.filename,
          size: file.size,
          path: file.path,
          uploadedAt: new Date().toISOString(),
        };
      });

      const response = await fetch('/api/kyc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: selectedType,
          documents: uploadedDocuments,
          additionalInfo: additionalInfo || undefined,
        }),
      });

      if (response.ok) {
        setShowUploadForm(false);
        setSelectedType('');
        setDocuments({});
        setAdditionalInfo('');
        fetchData(); // Refresh verifications
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to submit verification');
      }
    } catch (error) {
      console.error('Error submitting verification:', error);
      alert('An error occurred while submitting your verification');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getVerificationStats = () => {
    return {
      total: verifications.length,
      approved: verifications.filter(v => v.status === 'APPROVED').length,
      pending: verifications.filter(v => v.status === 'PENDING').length,
      rejected: verifications.filter(v => v.status === 'REJECTED').length,
    };
  };

  const stats = getVerificationStats();

  if (loading) {
    return (
      <DashboardLayout user={user} showHeader={false}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user} showHeader={false}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">KYC Verification</h1>
            <p className="text-gray-600">Complete your verification to build trust and unlock more features</p>
          </div>
          <Button 
            onClick={() => {
              const available = getAvailableVerificationTypesForUser(user)
              // Auto-select the single available option for business listers
              if (available.length === 1) {
                setSelectedType(available[0].id)
              }
              setShowUploadForm(true)
            }}
            disabled={showUploadForm}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Verification
          </Button>
        </div>

        {/* Stats Cards removed per request */}

        {/* Upload Form */}
        {showUploadForm && (
          <Card>
            <CardHeader>
              <CardTitle>Submit New Verification</CardTitle>
              <CardDescription>
                Choose the type of verification you want to complete
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Verification Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Verification Type *
                  </label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select verification type" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableVerificationTypesForUser(user).map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          <div className="flex items-center space-x-2">
                            <type.icon className="h-4 w-4" />
                            <span>{type.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Document Upload */}
                {selectedType && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      {selectedType === 'ADDRESS' ? 'Select and upload one document' : 'Required Documents'}
                    </label>
                    {selectedType === 'ADDRESS' && (
                      <div className="mb-4">
                        <Select value={addressProofChoice} onValueChange={setAddressProofChoice}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose document type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="UTILITY_BILL">Utility Bill</SelectItem>
                            <SelectItem value="BANK_STATEMENT">Bank Statement</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <div className="space-y-4">
                      {(selectedType === 'ADDRESS'
                        ? getVerificationType(selectedType)?.documents.filter(d => !addressProofChoice || d.type === addressProofChoice)
                        : getVerificationType(selectedType)?.documents
                      )?.map((doc) => (
                        <div key={doc.type} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{doc.name}</h4>
                              <p className="text-xs text-gray-600 mt-1">{doc.description}</p>
                              {doc.required && selectedType !== 'ADDRESS' && (
                                <Badge variant="outline" className="mt-2 text-xs">
                                  Required
                                </Badge>
                              )}
                            </div>
                            <div className="ml-4">
                              {uploading[doc.type] ? (
                                <div className="text-sm text-gray-600">Uploading...</div>
                              ) : documents[doc.type] ? (
                                <div className="flex items-center space-x-2 text-sm text-green-600">
                                  <CheckCircle className="h-4 w-4" />
                                  <span>{documents[doc.type].name}</span>
                                </div>
                              ) : (
                                <div>
                                  <input
                                    id={`file-${doc.type}`}
                                    type="file"
                                    accept="image/*,application/pdf"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) handleFileUpload(doc.type, file);
                                    }}
                                    className="sr-only"
                                  />
                                  <div className="inline-flex items-center gap-2">
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      type="button"
                                      onClick={() => {
                                        const fileInput = document.getElementById(`file-${doc.type}`) as HTMLInputElement;
                                        fileInput?.click();
                                      }}
                                    >
                                      <Upload className="h-4 w-4 mr-2" />
                                      Upload
                                    </Button>
                                    <label htmlFor={`file-${doc.type}`} className="sr-only">Upload {doc.name}</label>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Additional Information */}
                {selectedType && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Information (Optional)
                    </label>
                    <Textarea
                      value={additionalInfo}
                      onChange={(e) => setAdditionalInfo(e.target.value)}
                      placeholder="Any additional information that might help with your verification..."
                      rows={3}
                    />
                  </div>
                )}

                {/* Guidelines */}
                {selectedType && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-1 text-sm">
                        <p>• Ensure all documents are clear and readable</p>
                        <p>• Documents must be current (not older than 3 months for address proof)</p>
                        <p>• File formats accepted: JPG, PNG, PDF (max 10MB each)</p>
                        <p>• Verification typically takes 1-3 business days</p>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowUploadForm(false);
                      setSelectedType('');
                      setDocuments({});
                      setAdditionalInfo('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!selectedType || submitting}
                  >
                    {submitting ? 'Submitting...' : 'Submit Verification'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Existing Verifications */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Your Verifications</h2>
          
          {verifications.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No verifications yet</h3>
                <p className="text-gray-600 mb-4">
                  Complete your verification to build trust and unlock more features
                </p>
                <Button onClick={() => setShowUploadForm(true)}>
                  Start Verification
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {verifications.map((verification) => {
                const verificationType = getVerificationType(verification.type);
                return (
                  <Card key={verification.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          {verificationType?.icon && (
                            <div className="p-2 bg-gray-100 rounded-lg">
                              <verificationType.icon className="h-5 w-5" />
                            </div>
                          )}
                          <div>
                            <CardTitle className="text-lg">
                              {verificationType?.name || verification.type}
                            </CardTitle>
                            <CardDescription>
                              Submitted {formatDate(verification.createdAt)}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(verification.status)}
                          <Badge className={getStatusColor(verification.status)}>
                            {verification.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {/* Documents */}
                        <div>
                          <h4 className="font-medium text-sm mb-2">Documents</h4>
                          <div className="space-y-1">
                            {verification.documents.map((doc: any, index) => (
                              <div key={index} className="flex items-center justify-between text-sm">
                                <span>{doc.name}</span>
                                {doc.path && documentUrls[doc.path] ? (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => window.open(documentUrls[doc.path], '_blank')}
                                  >
                                    <Eye className="h-3 w-3 mr-1" />
                                    View
                                  </Button>
                                ) : (
                                  <Button variant="outline" size="sm" disabled>
                                    <Eye className="h-3 w-3 mr-1" />
                                    Loading...
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Status Information */}
                        {(verification.status === 'REJECTED' || verification.status === 'MORE_INFO_REQUIRED') && (
                          <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              <div>
                                <p className="font-medium">{verification.rejectionReason}</p>
                                {verification.notes && (
                                  <p className="text-sm mt-1">{verification.notes}</p>
                                )}
                              </div>
                            </AlertDescription>
                          </Alert>
                        )}

                        {/* Review Information */}
                        {verification.reviewedAt && (
                          <div className="text-xs text-gray-600">
                            <p>Reviewed on {formatDate(verification.reviewedAt)}</p>
                            {verification.reviewer && (
                              <p>Reviewed by {verification.reviewer.name}</p>
                            )}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex space-x-2 pt-2">
                          {verification.status === 'REJECTED' || verification.status === 'MORE_INFO_REQUIRED' ? (
                            <Button 
                              size="sm" 
                              onClick={() => {
                                setSelectedType(verification.type);
                                setShowUploadForm(true);
                              }}
                            >
                              Resubmit
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
