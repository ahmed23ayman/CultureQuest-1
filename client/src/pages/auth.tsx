import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Lock, User } from 'lucide-react';

export default function AuthPage() {
  const { login, register } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const handleSubmit = async (type: 'login' | 'register') => {
    if (!formData.username || !formData.password) {
      toast({
        title: 'خطأ',
        description: 'يرجى ملء جميع الحقول',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const result = type === 'login' 
        ? await login(formData.username, formData.password)
        : await register(formData.username, formData.password);

      if (result.success) {
        toast({
          title: 'نجح',
          description: type === 'login' ? 'تم تسجيل الدخول بنجاح' : 'تم إنشاء الحساب بنجاح',
        });
      } else {
        toast({
          title: 'خطأ',
          description: result.error || 'حدث خطأ غير متوقع',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ في الاتصال',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--calculator-bg)' }}>
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            الخزنة الآمنة
          </h1>
          <p className="text-sm px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/10" style={{ color: 'var(--calculator-text-muted)' }}>
            نظام آمن لحفظ ملفاتك
          </p>
        </div>

        <Card className="calculator-surface border-white/10" style={{ background: 'var(--calculator-surface)', boxShadow: 'var(--calculator-shadow)' }}>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl" style={{ color: 'var(--calculator-text)' }}>
              مرحباً بك
            </CardTitle>
            <CardDescription style={{ color: 'var(--calculator-text-muted)' }}>
              سجل دخولك أو أنشئ حساباً جديداً
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">تسجيل الدخول</TabsTrigger>
                <TabsTrigger value="register">إنشاء حساب</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-right" style={{ color: 'var(--calculator-text)' }}>
                    اسم المستخدم
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4" style={{ color: 'var(--calculator-text-muted)' }} />
                    <Input
                      id="username"
                      type="text"
                      placeholder="أدخل اسم المستخدم"
                      value={formData.username}
                      onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                      className="pl-10 text-right calculator-display border-white/10"
                      style={{ background: 'var(--calculator-display)', color: 'var(--calculator-text)' }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-right" style={{ color: 'var(--calculator-text)' }}>
                    كلمة المرور
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4" style={{ color: 'var(--calculator-text-muted)' }} />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="أدخل كلمة المرور"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      className="pl-10 pr-10 text-right calculator-display border-white/10"
                      style={{ background: 'var(--calculator-display)', color: 'var(--calculator-text)' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 h-4 w-4"
                      style={{ color: 'var(--calculator-text-muted)' }}
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                </div>

                <Button
                  onClick={() => handleSubmit('login')}
                  disabled={isLoading}
                  className="w-full equals-btn"
                  style={{ background: 'var(--calculator-equals)' }}
                >
                  {isLoading ? 'جاري التسجيل...' : 'تسجيل الدخول'}
                </Button>
              </TabsContent>

              <TabsContent value="register" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reg-username" className="text-right" style={{ color: 'var(--calculator-text)' }}>
                    اسم المستخدم
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4" style={{ color: 'var(--calculator-text-muted)' }} />
                    <Input
                      id="reg-username"
                      type="text"
                      placeholder="اختر اسم المستخدم"
                      value={formData.username}
                      onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                      className="pl-10 text-right calculator-display border-white/10"
                      style={{ background: 'var(--calculator-display)', color: 'var(--calculator-text)' }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-password" className="text-right" style={{ color: 'var(--calculator-text)' }}>
                    كلمة المرور
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4" style={{ color: 'var(--calculator-text-muted)' }} />
                    <Input
                      id="reg-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="اختر كلمة المرور"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      className="pl-10 pr-10 text-right calculator-display border-white/10"
                      style={{ background: 'var(--calculator-display)', color: 'var(--calculator-text)' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 h-4 w-4"
                      style={{ color: 'var(--calculator-text-muted)' }}
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                </div>

                <Button
                  onClick={() => handleSubmit('register')}
                  disabled={isLoading}
                  className="w-full secondary-btn"
                  style={{ background: 'var(--calculator-clear)' }}
                >
                  {isLoading ? 'جاري الإنشاء...' : 'إنشاء حساب'}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-xs">
          <p className="px-4 py-2 rounded-full bg-gradient-to-r from-gray-500/10 to-gray-600/10 backdrop-blur-sm border border-white/5" style={{ color: 'var(--calculator-text-muted)' }}>
            © 2024 أحمد أيمن - جميع الحقوق محفوظة
          </p>
        </div>
      </div>
    </div>
  );
}