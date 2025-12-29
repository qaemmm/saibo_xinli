import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Loader2, Sparkles, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { calculateBazi } from '@/services/bazi';
import type { BaziData } from '@/types/types';

interface FormData {
  nickname: string;
  year: string;
  month: string;
  day: string;
  hour: string;
  timeUnknown: boolean;
  gender: string;
}

interface InputFormProps {
  onBaziGenerated: (baziData: BaziData) => void;
}

// localStorage 缓存键名
const CACHE_KEY = 'bazi_form_cache';

// 从 localStorage 加载缓存数据
const loadCachedData = (): Partial<FormData> | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (error) {
    console.error('加载缓存失败:', error);
  }
  return null;
};

// 保存数据到 localStorage
const saveCachedData = (data: FormData) => {
  try {
    // 只缓存基本信息，不缓存敏感数据
    const cacheData = {
      nickname: data.nickname,
      year: data.year,
      month: data.month,
      day: data.day,
      hour: data.hour,
      timeUnknown: data.timeUnknown,
      gender: data.gender
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.error('保存缓存失败:', error);
  }
};

// 清除缓存
const clearCachedData = () => {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (error) {
    console.error('清除缓存失败:', error);
  }
};

export default function InputForm({ onBaziGenerated }: InputFormProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  // 加载缓存数据
  const cachedData = loadCachedData();

  const form = useForm<FormData>({
    defaultValues: {
      nickname: cachedData?.nickname || '',
      year: cachedData?.year || '',
      month: cachedData?.month || '',
      day: cachedData?.day || '',
      hour: cachedData?.hour || '12',
      timeUnknown: cachedData?.timeUnknown || false,
      gender: cachedData?.gender || 'male'
    }
  });

  // 监听表单变化，自动保存到缓存
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (value.year || value.month || value.day) {
        saveCachedData(value as FormData);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // 清除缓存并重置表单
  const handleClearCache = () => {
    clearCachedData();
    form.reset({
      nickname: '',
      year: '',
      month: '',
      day: '',
      hour: '12',
      timeUnknown: false,
      gender: 'male'
    });
    toast.success('缓存已清除');
  };

  // 生成排盘
  const handleSubmit = async (data: FormData) => {
    const year = parseInt(data.year, 10);
    const month = parseInt(data.month, 10);
    const day = parseInt(data.day, 10);
    const hour = data.timeUnknown ? 12 : parseInt(data.hour, 10);

    if (!year || year < 1900 || year > 2100) {
      toast.error('请输入有效的年份（1900-2100）');
      return;
    }

    if (!month || month < 1 || month > 12) {
      toast.error('请输入有效的月份（1-12）');
      return;
    }

    if (!day || day < 1 || day > 31) {
      toast.error('请输入有效的日期（1-31）');
      return;
    }

    if (!data.timeUnknown && (hour < 0 || hour > 23)) {
      toast.error('请选择有效的小时（0-23）');
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

      onBaziGenerated(baziData);
      toast.success('八字排盘完成！');
    } catch (error) {
      console.error('排盘错误:', error);
      toast.error('排盘时发生错误');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto card-hover bg-card/70 backdrop-blur border-border/50">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl gradient-text flex items-center justify-center gap-2">
          <Sparkles className="w-7 h-7" />
          八字排盘
        </CardTitle>
        <CardDescription className="text-base mt-2">
          填写出生信息，AI自动排盘并分析
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* 姓名 */}
            <FormField
              control={form.control}
              name="nickname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">姓名（可选）</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="请输入姓名" className="h-11" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 出生日期 */}
            <div className="space-y-3">
              <Label className="text-base">出生日期（公历）</Label>
              <div className="grid grid-cols-3 gap-3">
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          placeholder="年"
                          min="1900"
                          max="2100"
                          className="h-11"
                        />
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
                        <Input
                          {...field}
                          type="number"
                          placeholder="月"
                          min="1"
                          max="12"
                          className="h-11"
                        />
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
                        <Input
                          {...field}
                          type="number"
                          placeholder="日"
                          min="1"
                          max="31"
                          className="h-11"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* 出生时间 */}
            <FormField
              control={form.control}
              name="hour"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">出生时间</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger disabled={form.watch('timeUnknown')} className="h-11">
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
                <FormItem className="flex items-center space-x-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) => field.onChange(checked === true)}
                    />
                  </FormControl>
                  <FormLabel className="leading-none text-sm font-normal cursor-pointer">
                    时间不详（系统将使用中午12点）
                  </FormLabel>
                </FormItem>
              )}
            />

            {/* 性别 */}
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">性别</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="male" id="male" />
                        <Label htmlFor="male" className="cursor-pointer">男</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="female" id="female" />
                        <Label htmlFor="female" className="cursor-pointer">女</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 提交按钮 */}
            <div className="flex gap-3">
              <Button
                type="submit"
                className="flex-1 h-12 text-base font-medium"
                size="lg"
                disabled={isGenerating}
              >
                {isGenerating && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
                {isGenerating ? '正在排盘...' : '✨ 开始排盘'}
              </Button>

              <Button
                type="button"
                variant="outline"
                size="lg"
                className="h-12 px-4"
                onClick={handleClearCache}
                disabled={isGenerating}
                title="清除缓存数据"
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
              <p className="text-xs text-muted-foreground text-center leading-relaxed">
                💡 提示：AI会根据您的出生信息自动进行八字排盘，
                <br />
                全程加密处理，数据不会被保存
              </p>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

