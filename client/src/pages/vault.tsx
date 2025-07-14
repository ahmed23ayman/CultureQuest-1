import { useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Upload, File, Image, Video, Trash2, Download, Eye, LogOut, Home } from 'lucide-react';
import { Link } from 'wouter';

interface VaultFile {
  id: number;
  userId: number;
  fileName: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  filePath: string;
  description: string | null;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function VaultPage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(true);

  const { data: files = [], isLoading } = useQuery({
    queryKey: ['/api/vault'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      return apiRequest('/api/vault', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const token = localStorage.getItem('token');
      return apiRequest('/api/vault/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vault'] });
      setUploadDialogOpen(false);
      setSelectedFile(null);
      setDescription('');
      toast({
        title: 'نجح',
        description: 'تم رفع الملف بنجاح',
      });
    },
    onError: (error) => {
      toast({
        title: 'خطأ',
        description: error.message || 'خطأ في رفع الملف',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (fileId: number) => {
      const token = localStorage.getItem('token');
      return apiRequest(`/api/vault/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vault'] });
      toast({
        title: 'نجح',
        description: 'تم حذف الملف بنجاح',
      });
    },
    onError: (error) => {
      toast({
        title: 'خطأ',
        description: error.message || 'خطأ في حذف الملف',
        variant: 'destructive',
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadDialogOpen(true);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('description', description);
    formData.append('isPrivate', isPrivate.toString());

    uploadMutation.mutate(formData);
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="h-6 w-6" />;
    if (mimeType.startsWith('video/')) return <Video className="h-6 w-6" />;
    return <File className="h-6 w-6" />;
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['بايت', 'ك.ب', 'م.ب', 'ج.ب'];
    if (bytes === 0) return '0 بايت';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG');
  };

  const viewFile = (file: VaultFile) => {
    const token = localStorage.getItem('token');
    window.open(`${file.filePath}?token=${token}`, '_blank');
  };

  return (
    <div className="min-h-screen p-4" style={{ background: 'var(--calculator-bg)' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              الخزنة الآمنة
            </h1>
            <p className="text-sm" style={{ color: 'var(--calculator-text-muted)' }}>
              مرحباً {user?.username}
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="operator-btn"
              style={{ background: 'var(--calculator-operator)' }}
            >
              <Upload className="h-4 w-4 mr-2" />
              رفع ملف
            </Button>
            <Link href="/">
              <Button
                variant="outline"
                className="border-white/10"
                style={{ color: 'var(--calculator-text)' }}
              >
                <Home className="h-4 w-4 mr-2" />
                الرئيسية
              </Button>
            </Link>
            <Button
              onClick={logout}
              variant="outline"
              className="border-white/10"
              style={{ color: 'var(--calculator-text)' }}
            >
              <LogOut className="h-4 w-4 mr-2" />
              تسجيل خروج
            </Button>
          </div>
        </div>

        {/* Files Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p style={{ color: 'var(--calculator-text-muted)' }}>جاري التحميل...</p>
            </div>
          ) : files.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Upload className="h-16 w-16 mx-auto mb-4" style={{ color: 'var(--calculator-text-muted)' }} />
              <p style={{ color: 'var(--calculator-text-muted)' }}>لا توجد ملفات محفوظة</p>
              <p className="text-sm mt-2" style={{ color: 'var(--calculator-text-muted)' }}>
                ابدأ برفع ملفاتك الأولى
              </p>
            </div>
          ) : (
            files.map((file: VaultFile) => (
              <Card key={file.id} className="calculator-surface border-white/10 hover:border-white/20 transition-all duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div style={{ color: 'var(--calculator-text)' }}>
                        {getFileIcon(file.mimeType)}
                      </div>
                      <div>
                        <CardTitle className="text-lg truncate" style={{ color: 'var(--calculator-text)' }}>
                          {file.originalName}
                        </CardTitle>
                        <CardDescription className="text-sm" style={{ color: 'var(--calculator-text-muted)' }}>
                          {formatFileSize(file.fileSize)} • {formatDate(file.createdAt)}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => viewFile(file)}
                        className="h-8 w-8 p-0"
                        style={{ color: 'var(--calculator-text)' }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteMutation.mutate(file.id)}
                        className="h-8 w-8 p-0 hover:bg-red-500/20"
                        style={{ color: 'var(--calculator-error)' }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {file.description && (
                  <CardContent className="pt-0">
                    <p className="text-sm" style={{ color: 'var(--calculator-text-muted)' }}>
                      {file.description}
                    </p>
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        {/* Upload Dialog */}
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogContent className="calculator-surface border-white/10">
            <DialogHeader>
              <DialogTitle style={{ color: 'var(--calculator-text)' }}>رفع ملف جديد</DialogTitle>
              <DialogDescription style={{ color: 'var(--calculator-text-muted)' }}>
                اختر إعدادات الملف قبل الرفع
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {selectedFile && (
                <div className="p-4 rounded-lg calculator-display">
                  <div className="flex items-center gap-3">
                    <div style={{ color: 'var(--calculator-text)' }}>
                      {getFileIcon(selectedFile.type)}
                    </div>
                    <div>
                      <p className="font-medium" style={{ color: 'var(--calculator-text)' }}>
                        {selectedFile.name}
                      </p>
                      <p className="text-sm" style={{ color: 'var(--calculator-text-muted)' }}>
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="description" style={{ color: 'var(--calculator-text)' }}>
                  وصف الملف (اختياري)
                </Label>
                <Textarea
                  id="description"
                  placeholder="أضف وصفاً للملف..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="calculator-display border-white/10 text-right"
                  style={{ background: 'var(--calculator-display)', color: 'var(--calculator-text)' }}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="private" style={{ color: 'var(--calculator-text)' }}>
                  ملف خاص
                </Label>
                <Switch
                  id="private"
                  checked={isPrivate}
                  onCheckedChange={setIsPrivate}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleUpload}
                  disabled={uploadMutation.isPending}
                  className="flex-1 equals-btn"
                  style={{ background: 'var(--calculator-equals)' }}
                >
                  {uploadMutation.isPending ? 'جاري الرفع...' : 'رفع الملف'}
                </Button>
                <Button
                  onClick={() => setUploadDialogOpen(false)}
                  variant="outline"
                  className="border-white/10"
                  style={{ color: 'var(--calculator-text)' }}
                >
                  إلغاء
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Footer */}
        <div className="text-center mt-8 pt-6 border-t border-white/10">
          <p className="text-xs px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-white/5 font-serif italic inline-block" style={{ color: 'var(--calculator-text-muted)' }}>
            Developed by Ahmed Ayman
          </p>
        </div>
      </div>
    </div>
  );
}