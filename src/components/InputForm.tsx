import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { calculateBazi } from '@/services/bazi';
import { validateRedeemCode, generateReport } from '@/services/api';
import type { BaziData } from '@/types/types';

interface FormData {
  nickname: string;
  date: string;
  hour: string;
  timeUnknown: boolean;
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
      nickname: '',
      date: '',
      hour: '12',
      timeUnknown: false,
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

    if (!data.date) {
      toast.error('请选择出生日期');
      return;
    }

    const [yearStr, monthStr, dayStr] = data.date.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const day = parseInt(dayStr, 10);
    const hour = data.timeUnknown ? 12 : parseInt(data.hour, 10);

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

    if (!data.timeUnknown && (hour < 0 || hour > 23)) {
      toast.error('请选择有效的小时（0-23）');
      return;
    }

    if (!data.emotionText.trim()) {
      toast.error('请描述您当下的情绪状态');
      return;
    }

    setIsGenerating(true);

    try {
      // 计算八字
      const baziData = await calculateBazi(
        year,
        month,
        day,
        hour,
        data.gender,
        data.timeUnknown
      );

      // 生成报告
      const result = await generateReport(baziData, data.emotionText, {
        nickname: data.nickname,
        timeUnknown: data.timeUnknown
      });

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

            {/* 称呼 */}
            <FormField
              control={form.control}
              name="nickname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>称呼（选填）</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="怎么称呼你？" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 出生日期 */}
            <div className="space-y-4">
              <Label>出生日期</Label>
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input {...field} type="date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                      <SelectTrigger disabled={form.watch('timeUnknown')}>
                        <SelectValue placeholder="选择时辰" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => (
                        <SelectItem key={i} value={String(i)}>
                          {String(i).padStart(2, '0')} 时
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="timeUnknown"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) => field.onChange(checked === true)}
                    />
                  </FormControl>
                  <FormLabel className="leading-none">时辰未知</FormLabel>
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

            {/* 当下困惑 */}
            <FormField
              control={form.control}
              name="emotionText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>当下的困惑</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="此刻最困扰你的问题是什么？"
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
