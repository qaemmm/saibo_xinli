import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { calculateBazi } from '@/services/bazi';
import { validateRedeemCode, generateReport } from '@/services/api';
import type { BaziData } from '@/types/types';

interface FormData {
  year: string;
  month: string;
  day: string;
  hour: string;
  gender: string;
  emotionText: string;
  redeemCode: string;
}

interface InputFormProps {
  onReportGenerated: (report: string, baziData: BaziData) => void;
}

export default function InputForm({ onReportGenerated }: InputFormProps) {
  const [isValidating, setIsValidating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [codeValidated, setCodeValidated] = useState(false);

  const form = useForm<FormData>({
    defaultValues: {
      year: '',
      month: '',
      day: '',
      hour: '12',
      gender: 'male',
      emotionText: '',
      redeemCode: ''
    }
  });

  // 验证兑换码
  const handleValidateCode = async () => {
    const code = form.getValues('redeemCode');
    
    if (!code.trim()) {
      toast.error('请输入兑换码');
      return;
    }

    setIsValidating(true);
    
    try {
      const result = await validateRedeemCode(code);
      
      if (result.success) {
        setCodeValidated(true);
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('验证失败，请稍后重试');
    } finally {
      setIsValidating(false);
    }
  };

  // 生成报告
  const handleSubmit = async (data: FormData) => {
    if (!codeValidated) {
      toast.error('请先验证兑换码');
      return;
    }

    // 验证日期
    const year = parseInt(data.year);
    const month = parseInt(data.month);
    const day = parseInt(data.day);
    const hour = parseInt(data.hour);

    if (year < 1900 || year > 2100) {
      toast.error('请输入有效的年份（1900-2100）');
      return;
    }

    if (month < 1 || month > 12) {
      toast.error('请输入有效的月份（1-12）');
      return;
    }

    if (day < 1 || day > 31) {
      toast.error('请输入有效的日期（1-31）');
      return;
    }

    if (!data.emotionText.trim()) {
      toast.error('请描述您当下的情绪状态');
      return;
    }

    setIsGenerating(true);

    try {
      // 计算八字
      const baziData = calculateBazi(year, month, day, hour, data.gender);

      // 生成报告
      const result = await generateReport(baziData, data.emotionText);

      if (result.success && result.report) {
        onReportGenerated(result.report, baziData);
        toast.success('报告生成成功！');
      } else {
        toast.error(result.error || '生成报告失败');
      }
    } catch (error) {
      console.error('生成报告错误:', error);
      toast.error('生成报告时发生错误');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto card-hover">
      <CardHeader>
        <CardTitle className="text-2xl gradient-text flex items-center gap-2">
          <Sparkles className="w-6 h-6" />
          开启疗愈之旅
        </CardTitle>
        <CardDescription>
          请填写您的基本信息，让我们为您生成专属的疗愈报告
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* 兑换码验证 */}
            <div className="space-y-2">
              <Label htmlFor="redeemCode">兑换码</Label>
              <div className="flex gap-2">
                <FormField
                  control={form.control}
                  name="redeemCode"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="请输入兑换码"
                          disabled={codeValidated}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  onClick={handleValidateCode}
                  disabled={isValidating || codeValidated}
                  variant={codeValidated ? 'secondary' : 'default'}
                >
                  {isValidating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {codeValidated ? '已验证' : '验证'}
                </Button>
              </div>
            </div>

            {/* 出生日期 */}
            <div className="space-y-4">
              <Label>出生日期</Label>
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input {...field} type="number" placeholder="年" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="month"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input {...field} type="number" placeholder="月" min="1" max="12" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="day"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input {...field} type="number" placeholder="日" min="1" max="31" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* 出生时辰 */}
            <FormField
              control={form.control}
              name="hour"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>出生时辰</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="选择时辰" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="0">子时 (23:00-01:00)</SelectItem>
                      <SelectItem value="2">丑时 (01:00-03:00)</SelectItem>
                      <SelectItem value="4">寅时 (03:00-05:00)</SelectItem>
                      <SelectItem value="6">卯时 (05:00-07:00)</SelectItem>
                      <SelectItem value="8">辰时 (07:00-09:00)</SelectItem>
                      <SelectItem value="10">巳时 (09:00-11:00)</SelectItem>
                      <SelectItem value="12">午时 (11:00-13:00)</SelectItem>
                      <SelectItem value="14">未时 (13:00-15:00)</SelectItem>
                      <SelectItem value="16">申时 (15:00-17:00)</SelectItem>
                      <SelectItem value="18">酉时 (17:00-19:00)</SelectItem>
                      <SelectItem value="20">戌时 (19:00-21:00)</SelectItem>
                      <SelectItem value="22">亥时 (21:00-23:00)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 性别 */}
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>性别</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="male" id="male" />
                        <Label htmlFor="male">男</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="female" id="female" />
                        <Label htmlFor="female">女</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 情绪文本 */}
            <FormField
              control={form.control}
              name="emotionText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>当下情绪</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="请描述您当下的情绪状态、困惑或想要探索的问题..."
                      className="min-h-32 resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 提交按钮 */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={!codeValidated || isGenerating}
            >
              {isGenerating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isGenerating ? '正在生成报告...' : '生成疗愈报告'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
