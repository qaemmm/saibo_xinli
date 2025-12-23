import { useState } from 'react';
import { Toaster } from '@/components/ui/sonner';
import InputForm from '@/components/InputForm';
import ReportDisplay from '@/components/ReportDisplay';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles } from 'lucide-react';
import type { BaziData } from '@/types/types';

export default function HomePage() {
  const [report, setReport] = useState<string | null>(null);
  const [baziData, setBaziData] = useState<BaziData | null>(null);

  const handleReportGenerated = (newReport: string, newBaziData: BaziData) => {
    setReport(newReport);
    setBaziData(newBaziData);
  };

  const handleReset = () => {
    setReport(null);
    setBaziData(null);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-background to-primary/5">
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
                <p className="text-sm text-muted-foreground">AI心理咨询与视觉疗愈系统</p>
              </div>
            </div>
            
            {report && (
              <Button onClick={handleReset} variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="container mx-auto px-4 py-12">
        {!report ? (
          <div className="space-y-8">
            {/* 欢迎区域 */}
            <div className="text-center space-y-4 max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl xl:text-4xl font-bold gradient-text">
                欢迎来到赛博疗愈空间
              </h2>
              <p className="text-muted-foreground text-base xl:text-lg">
                融合传统命理智慧与现代AI技术，为您提供深度个性化的心理疗愈服务
              </p>
            </div>

            {/* 输入表单 */}
            <InputForm onReportGenerated={handleReportGenerated} />

            {/* 底部说明 */}
            <div className="text-center text-sm text-muted-foreground max-w-2xl mx-auto">
              <p>
                本系统基于传统命理数据结合AI智能分析，提供的建议仅供参考。
                如有严重心理问题，请寻求专业心理咨询师的帮助。
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* 报告标题 */}
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold gradient-text">您的专属疗愈报告</h2>
              <p className="text-muted-foreground">
                请仔细阅读以下内容，愿它能为您带来启发与疗愈
              </p>
            </div>

            {/* 报告内容 */}
            {baziData && <ReportDisplay report={report} baziData={baziData} />}
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
