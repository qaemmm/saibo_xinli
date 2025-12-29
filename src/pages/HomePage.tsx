import { useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import InputForm from '@/components/InputForm';
import BaziDisplay from '@/components/BaziDisplay';
import StepIndicator from '@/components/StepIndicator';
import UnifiedReport from '@/components/UnifiedReport';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
import { generateReport, generateVisualReport } from '@/services/api';
import type { BaziData, VisualReportData } from '@/types/types';

// localStorage 缓存键名
const REPORT_CACHE_KEY = 'bazi_report_cache';

// 报告缓存数据结构
interface ReportCache {
  baziData: BaziData;
  report?: string;
  visualReport?: VisualReportData;
  currentStep: 1 | 2;
  timestamp: number;
}

// 从 localStorage 加载报告缓存
const loadReportCache = (): ReportCache | null => {
  try {
    const cached = localStorage.getItem(REPORT_CACHE_KEY);
    if (cached) {
      const data = JSON.parse(cached) as ReportCache;
      // 检查缓存是否过期（24小时）
      const now = Date.now();
      const cacheAge = now - data.timestamp;
      const maxAge = 24 * 60 * 60 * 1000; // 24小时

      if (cacheAge < maxAge) {
        return data;
      } else {
        // 缓存过期，清除
        localStorage.removeItem(REPORT_CACHE_KEY);
      }
    }
  } catch (error) {
    console.error('加载报告缓存失败:', error);
  }
  return null;
};

// 保存报告缓存到 localStorage
const saveReportCache = (cache: ReportCache) => {
  try {
    localStorage.setItem(REPORT_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error('保存报告缓存失败:', error);
  }
};

// 清除报告缓存
const clearReportCache = () => {
  try {
    localStorage.removeItem(REPORT_CACHE_KEY);
  } catch (error) {
    console.error('清除报告缓存失败:', error);
  }
};

export default function HomePage() {
  // 加载缓存数据
  const cachedReport = loadReportCache();

  const [currentStep, setCurrentStep] = useState<1 | 2>(cachedReport?.currentStep || 1);
  const [report, setReport] = useState<string | null>(cachedReport?.report || null);
  const [visualReport, setVisualReport] = useState<VisualReportData | null>(cachedReport?.visualReport || null);
  const [baziData, setBaziData] = useState<BaziData | null>(cachedReport?.baziData || null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // 监听状态变化，自动保存到缓存
  useEffect(() => {
    if (baziData) {
      const cache: ReportCache = {
        baziData,
        report: report || undefined,
        visualReport: visualReport || undefined,
        currentStep,
        timestamp: Date.now()
      };
      saveReportCache(cache);
    }
  }, [baziData, report, visualReport, currentStep]);

  // 步骤1：排盘完成
  const handleBaziGenerated = (newBaziData: BaziData) => {
    setBaziData(newBaziData);
    setCurrentStep(2);
    toast.success('八字排盘完成！');
  };

  // 步骤2：生成统一报告（同时生成文本和可视化数据）
  const handleGenerateReport = async () => {
    if (!baziData) return;

    setIsGeneratingReport(true);
    try {
      const defaultEmotionText = '请帮我分析一下我的性格特点和当前的人生阶段。';

      // 并行生成两种报告
      const [textResult, visualResult] = await Promise.all([
        generateReport(baziData, defaultEmotionText, {
          timeUnknown: baziData.timeUnknown
        }),
        generateVisualReport(baziData, defaultEmotionText, {
          timeUnknown: baziData.timeUnknown
        })
      ]);

      // 处理文本报告
      if (textResult.success && textResult.report) {
        setReport(textResult.report);
      } else {
        toast.error('文本报告生成失败');
      }

      // 处理可视化报告
      if (visualResult.success && visualResult.visualReport) {
        setVisualReport(visualResult.visualReport);
      } else {
        console.warn('可视化报告生成失败，将只显示文本报告');
      }

      // 只要有一个成功就算成功
      if (textResult.success || visualResult.success) {
        toast.success('AI分析完成！');
      } else {
        toast.error('报告生成失败，请重试');
      }
    } catch (error) {
      console.error('生成报告错误:', error);
      toast.error('生成报告时发生错误');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // 重新开始
  const handleReset = () => {
    setCurrentStep(1);
    setReport(null);
    setVisualReport(null);
    setBaziData(null);
    clearReportCache(); // 清除报告缓存
    toast.success('已重置，缓存已清除');
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-background to-primary/20">
      <Toaster />
      
      {/* 头部 */}
      <header className="w-full border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-text">赛博疗愈师</h1>
                <p className="text-sm text-muted-foreground">AI 心理支持与视觉疗愈系统</p>
              </div>
            </div>
            
            {(baziData || report || visualReport) && (
              <Button onClick={handleReset} variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                重新开始
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="container mx-auto px-4 py-12">
        {!report && !visualReport ? (
          <div className="space-y-8">
            {/* 欢迎区域 */}
            {currentStep === 1 && (
              <div className="text-center space-y-4 max-w-2xl mx-auto mb-8">
                <h2 className="text-3xl xl:text-4xl font-bold gradient-text">
                  欢迎来到赛博疗愈空间
                </h2>
                <p className="text-muted-foreground text-base xl:text-lg">
                  融合传统文化符号与现代 AI 技术，提供温柔而个性化的心理支持
                </p>
              </div>
            )}

            {/* 步骤指示器 */}
            <StepIndicator currentStep={currentStep} />

            {/* 步骤1：输入表单 */}
            {currentStep === 1 && (
              <>
                <InputForm onBaziGenerated={handleBaziGenerated} />

                {/* 底部说明 */}
                <div className="text-center text-sm text-muted-foreground max-w-2xl mx-auto">
                  <p>
                    本系统基于时间数据与文化符号进行解析，内容仅供参考与自我对话。
                    如有严重心理问题，请寻求专业心理咨询师的帮助。
                  </p>
                </div>
              </>
            )}

            {/* 步骤2：排盘结果 + AI分析按钮 */}
            {currentStep === 2 && baziData && (
              <div className="space-y-6 max-w-4xl mx-auto">
                {/* 标题 */}
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold gradient-text">八字排盘完成</h2>
                  <p className="text-muted-foreground">
                    请确认排盘结果，点击下方按钮启动AI分析
                  </p>
                </div>

                {/* 排盘结果展示 */}
                <BaziDisplay baziData={baziData} />

                {/* AI分析按钮 */}
                <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/30">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center gap-4">
                      <Button
                        onClick={handleGenerateReport}
                        disabled={isGeneratingReport}
                        size="lg"
                        className="w-full max-w-md h-14 text-lg font-medium"
                      >
                        {isGeneratingReport ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            AI分析中...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-5 h-5 mr-2" />
                            开始AI分析
                          </>
                        )}
                      </Button>
                      <p className="text-xs text-muted-foreground text-center">
                        将生成包含8维度分析和行动建议的完整报告
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {/* 报告标题 */}
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold gradient-text">您的专属疗愈报告</h2>
              <p className="text-muted-foreground">
                数据杂志风格 · 一屏看懂你的命理密码
              </p>
            </div>

            {/* 统一报告内容 */}
            {report && baziData && (
              <UnifiedReport
                report={report}
                baziData={baziData}
                visualData={visualReport || undefined}
              />
            )}
          </div>
        )}
      </main>

      {/* 页脚 */}
      <footer className="w-full border-t border-border/50 mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2025 赛博疗愈师 · 用科技连接心灵</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
