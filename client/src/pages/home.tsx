import { Link } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calculator, Shield, LogOut } from 'lucide-react';

export default function HomePage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen p-4" style={{ background: 'var(--calculator-bg)' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              مرحباً {user?.username}
            </h1>
            <p className="text-sm" style={{ color: 'var(--calculator-text-muted)' }}>
              اختر التطبيق الذي تريد استخدامه
            </p>
          </div>
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

        {/* Apps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Calculator App */}
          <Link href="/calculator">
            <Card className="calculator-surface border-white/10 hover:border-white/20 transition-all duration-200 cursor-pointer group">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-4 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 w-fit">
                  <Calculator className="h-8 w-8 text-blue-400 group-hover:scale-110 transition-transform" />
                </div>
                <CardTitle className="text-xl mb-2" style={{ color: 'var(--calculator-text)' }}>
                  آلة حاسبة
                </CardTitle>
                <CardDescription style={{ color: 'var(--calculator-text-muted)' }}>
                  آلة حاسبة متطورة مع واجهة جميلة
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="space-y-2 text-sm" style={{ color: 'var(--calculator-text-muted)' }}>
                  <p>• عمليات حسابية أساسية</p>
                  <p>• الجذر التربيعي والنسبة المئوية</p>
                  <p>• دعم لوحة المفاتيح</p>
                  <p>• تصميم عصري وجذاب</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Vault App */}
          <Link href="/vault">
            <Card className="calculator-surface border-white/10 hover:border-white/20 transition-all duration-200 cursor-pointer group">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-4 rounded-full bg-gradient-to-r from-green-500/20 to-teal-500/20 w-fit">
                  <Shield className="h-8 w-8 text-green-400 group-hover:scale-110 transition-transform" />
                </div>
                <CardTitle className="text-xl mb-2" style={{ color: 'var(--calculator-text)' }}>
                  الخزنة الآمنة
                </CardTitle>
                <CardDescription style={{ color: 'var(--calculator-text-muted)' }}>
                  نظام آمن لحفظ الصور والفيديوهات
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="space-y-2 text-sm" style={{ color: 'var(--calculator-text-muted)' }}>
                  <p>• رفع الصور والفيديوهات</p>
                  <p>• تشفير وحماية الملفات</p>
                  <p>• تنظيم وإدارة سهلة</p>
                  <p>• إعدادات خصوصية متقدمة</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-xs">
          <p className="px-4 py-2 rounded-full bg-gradient-to-r from-gray-500/10 to-gray-600/10 backdrop-blur-sm border border-white/5" style={{ color: 'var(--calculator-text-muted)' }}>
            © 2024 أحمد أيمن - جميع الحقوق محفوظة
          </p>
        </div>
      </div>
    </div>
  );
}