import { useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // パスワードをローカルストレージに保存されたパスワードと比較
    const storedPassword = localStorage.getItem('admin_password') || 'admin123';
    
    if (password === storedPassword) {
      // ログイン成功
      localStorage.setItem('admin_logged_in', 'true');
      toast.success('ログインしました');
      setLocation('/admin/case-data');
    } else {
      // ログイン失敗
      toast.error('パスワードが正しくありません');
      setPassword('');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <Lock className="w-6 h-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">管理画面ログイン</CardTitle>
          <CardDescription>
            管理画面にアクセスするにはパスワードを入力してください
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                パスワード
              </label>
              <Input
                id="password"
                type="password"
                placeholder="パスワードを入力"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                autoFocus
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !password}
            >
              {isLoading ? 'ログイン中...' : 'ログイン'}
            </Button>
          </form>
          
          <div className="mt-6 p-3 bg-muted rounded-lg border border-border">
            <p className="text-xs text-muted-foreground">
              <strong>デフォルトパスワード:</strong> admin123
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              初回ログイン後、パスワードを変更することをお勧めします。
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
