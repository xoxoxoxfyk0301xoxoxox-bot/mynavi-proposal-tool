import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Lock, LogOut } from 'lucide-react';
import { useLocation } from 'wouter';

export default function AdminSettings() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const storedPassword = localStorage.getItem('admin_password') || 'admin123';

    // 現在のパスワードを確認
    if (currentPassword !== storedPassword) {
      toast.error('現在のパスワードが正しくありません');
      setIsLoading(false);
      return;
    }

    // 新しいパスワードを確認
    if (newPassword !== confirmPassword) {
      toast.error('新しいパスワードが一致しません');
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      toast.error('パスワードは6文字以上である必要があります');
      setIsLoading(false);
      return;
    }

    // パスワードを更新
    localStorage.setItem('admin_password', newPassword);
    toast.success('パスワードを変更しました');
    
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setIsLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_logged_in');
    toast.success('ログアウトしました');
    setLocation('/admin/login');
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">管理設定</h1>
          <p className="text-muted-foreground mt-2">
            パスワードやセキュリティ設定を管理します
          </p>
        </div>

        <Tabs defaultValue="password" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="password" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              パスワード変更
            </TabsTrigger>
            <TabsTrigger value="logout" className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              ログアウト
            </TabsTrigger>
          </TabsList>

          <TabsContent value="password" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>パスワード変更</CardTitle>
                <CardDescription>
                  管理画面へのアクセスパスワードを変更します
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="current-password" className="text-sm font-medium">
                      現在のパスワード
                    </label>
                    <Input
                      id="current-password"
                      type="password"
                      placeholder="現在のパスワードを入力"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="new-password" className="text-sm font-medium">
                      新しいパスワード
                    </label>
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="新しいパスワードを入力"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={isLoading}
                    />
                    <p className="text-xs text-muted-foreground">
                      6文字以上の英数字を使用してください
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="confirm-password" className="text-sm font-medium">
                      新しいパスワード（確認）
                    </label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="新しいパスワードを再入力"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
                  >
                    {isLoading ? 'パスワード変更中...' : 'パスワードを変更'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logout" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>ログアウト</CardTitle>
                <CardDescription>
                  管理画面からログアウトします
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    ログアウトすると、次回アクセス時にパスワードの入力が必要になります。
                  </p>
                  <Button
                    onClick={handleLogout}
                    variant="destructive"
                    className="w-full"
                  >
                    ログアウト
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
