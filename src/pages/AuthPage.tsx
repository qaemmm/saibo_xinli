import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Lock, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { validateRedeemCode } from '@/services/api';
import { Toaster } from '@/components/ui/sonner';

const AUTH_CODE_KEY = 'cyber_healer_auth_code';

export default function AuthPage() {
  const [code, setCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const navigate = useNavigate();

  // 检查是否已有有效的授权码
  useEffect(() => {
    const savedCode = localStorage.getItem(AUTH_CODE_KEY);
    if (savedCode) {
      // 验证保存的授权码是否仍然有效
      validateSavedCode(savedCode);
    }
  }, []);

  const validateSavedCode = async (savedCode: string) => {
    try {
      const result = await validateRedeemCode(savedCode);
      if (result.success) {
        // 授权码仍然有效，直接跳转
        navigate('/home');
      } else {
        // 授权码已失效，清除本地存储
        localStorage.removeItem(AUTH_CODE_KEY);
      }
    } catch (error) {
      // 验证失败，清除本地存储
      localStorage.removeItem(AUTH_CODE_KEY);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim()) {
      toast.error('请输入授权码');
      return;
    }

    setIsValidating(true);

    try {
      const result = await validateRedeemCode(code);

      if (result.success) {
        // 保存授权码到本地存储
        localStorage.setItem(AUTH_CODE_KEY, code);
        toast.success(result.message || '验证成功！');
        
        // 延迟跳转，让用户看到成功提示
        setTimeout(() => {
          navigate('/home');
        }, 500);
      } else {
        toast.error(result.message || '授权码无效');
      }
    } catch (error) {
      toast.error('验证失败，请稍后重试');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-background to-primary/20 flex items-center justify-center p-4">
      <Toaster />
      
      <Card className="w-full max-w-md card-hover bg-card/90 backdrop-blur border-border/50">
        <CardHeader className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-3xl gradient-text">
            请输入授权码
          </CardTitle>
          <CardDescription className="text-base">
            请输入授权码以访问系统，输入后永久生效
            <br />
            <span className="text-primary font-medium">每天免费 5 次预测</span>
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="authCode" className="sr-only">
                授权码
              </Label>
              <Input
                id="authCode"
                type="text"
                placeholder="请输入授权码"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                disabled={isValidating}
                className="text-center text-lg h-12"
                autoFocus
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base"
              size="lg"
              disabled={isValidating || !code.trim()}
            >
              {isValidating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  验证中...
                </>
              ) : (
                <>
                  确认授权
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>

            <div className="text-center text-sm text-muted-foreground space-y-2">
              <p>测试授权码：</p>
              <div className="flex flex-wrap justify-center gap-2">
                <code className="px-2 py-1 bg-muted rounded text-xs">CYBER2025</code>
                <code className="px-2 py-1 bg-muted rounded text-xs">HEALER888</code>
                <code className="px-2 py-1 bg-muted rounded text-xs">TEST123</code>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

