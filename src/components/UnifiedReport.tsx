import { useRef } from 'react';
import html2canvas from 'html2canvas';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Download, Check } from 'lucide-react';
import { 
  TrendingUp, 
  User, 
  Briefcase, 
  Compass, 
  DollarSign, 
  Heart, 
  Activity, 
  Users 
} from 'lucide-react';
import type { BaziData, VisualReportData } from '@/types/types';

interface UnifiedReportProps {
  report: string;
  baziData: BaziData;
  visualData?: VisualReportData;
}

// 图标映射
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  trading: TrendingUp,
  personality: User,
  career: Briefcase,
  fengshui: Compass,
  wealth: DollarSign,
  marriage: Heart,
  health: Activity,
  family: Users
};

// 解析文本报告
const parseReport = (text: string) => {
  const sections = {
    title: '',
    oneLiner: '',
    tags: [] as string[],
    actionItems: [] as string[]
  };

  // 提取标题
  const titleMatch = text.match(/^\s*#\s*[^:：]*[:：]\s*(.+)$/m);
  if (titleMatch) sections.title = titleMatch[1].replace(/[【】]/g, '').trim();

  // 提取一句话总结
  const oneLinerMatch = text.match(/^\s*>\s*\*?(.+?)\*?\s*$/m);
  if (oneLinerMatch) sections.oneLiner = oneLinerMatch[1].trim();

  // 提取人设标签（从能量原型部分）
  const energyMatch = text.match(/##\s*(?:一、|01\.\s*\/\/\/\s*)(?:能量原型|源代码解码)[\s\S]*?\n([\s\S]*?)(?=##|$)/);
  if (energyMatch) {
    const content = energyMatch[1];
    const tagMatches = content.match(/[「『【]([^」』】]+)[」』】]/g);
    if (tagMatches) {
      sections.tags = tagMatches.slice(0, 4).map(t => t.replace(/[「『【」』】]/g, ''));
    }
  }

  // 提取行动建议
  const actionMatch = text.match(/##\s*(?:四、|04\.\s*\/\/\/\s*)(?:行动处方|能量补丁)[\s\S]*?\n([\s\S]*?)$/);
  if (actionMatch) {
    const content = actionMatch[1];
    const items = content.split(/\n/).filter(line => {
      const trimmed = line.trim();
      return trimmed && (trimmed.startsWith('-') || trimmed.startsWith('•') || /^\d+\./.test(trimmed));
    });
    sections.actionItems = items.slice(0, 5).map(item => 
      item.replace(/^[-•\d.]\s*/, '').trim()
    );
  }

  return sections;
};

export default function UnifiedReport({ report, baziData, visualData }: UnifiedReportProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const parsed = parseReport(report);

  // 下载为图片
  const handleDownloadImage = async () => {
    if (!reportRef.current) return;
    
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        backgroundColor: '#0a0a0a',
        logging: false
      });
      
      const link = document.createElement('a');
      link.download = `赛博疗愈报告_${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('生成图片失败:', error);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4">
      {/* 下载按钮 */}
      <div className="flex justify-end">
        <Button onClick={handleDownloadImage} variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          保存为图片
        </Button>
      </div>

      {/* 报告主体 */}
      <div 
        ref={reportRef}
        className="relative bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#0a0a0a] p-6 md:p-8 rounded-2xl border border-[#8e2de2]/20 overflow-hidden"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' /%3E%3C/filter%3E%3Crect width=\'100\' height=\'100\' filter=\'url(%23noise)\' opacity=\'0.03\' /%3E%3C/svg%3E")',
          backgroundBlendMode: 'overlay'
        }}
      >
        {/* 装饰性光效 */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#8e2de2]/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -z-10" />

        {/* 第一屏：核心信息 */}
        <div className="space-y-6 mb-8">
          {/* 头部：人设标签 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>代号</span>
              <span className="text-[#8e2de2]">///</span>
              <span className="text-foreground font-medium">{parsed.title || '迷途旅人'}</span>
            </div>
            
            {parsed.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {parsed.tags.map((tag, i) => (
                  <span 
                    key={i}
                    className="px-3 py-1 text-xs font-medium bg-[#8e2de2]/20 text-[#8e2de2] border border-[#8e2de2]/30 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 一句话总结 */}
          {parsed.oneLiner && (
            <p className="text-lg md:text-xl font-medium leading-relaxed text-foreground/90">
              {parsed.oneLiner}
            </p>
          )}
        </div>

        {/* 第二屏：8维度分析 + 总体评分 */}
        {visualData && (
          <div className="space-y-6 mb-8">
            {/* 总体评价 */}
            <Card className="bg-gradient-to-br from-[#8e2de2]/10 to-blue-500/10 border-[#8e2de2]/30">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">综合评估</h3>
                    <p className="text-sm leading-relaxed text-foreground/80">
                      {visualData.summary}
                    </p>
                  </div>
                  <div className="flex flex-col items-center gap-2 min-w-[80px]">
                    <div className="text-4xl font-bold text-[#8e2de2]">
                      {visualData.summary_score}
                    </div>
                    <div className="text-xs text-muted-foreground">综合分</div>
                    <Progress
                      value={visualData.summary_score * 10}
                      className="h-2 w-full"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 8维度卡片 - Bento Grid布局 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {visualData.cards.map((card, index) => {
                const Icon = iconMap[card.key] || User;
                const colors = getCardColors(card.color);

                return (
                  <Card
                    key={index}
                    className={`${colors.bg} border-${card.color}-500/30 hover:scale-105 transition-transform duration-200`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div className={`p-2 rounded-lg ${colors.iconBg}`}>
                          <Icon className={`w-4 h-4 ${colors.text}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-foreground mb-1">
                            {card.title}
                          </h4>
                          <div className="flex items-center gap-2">
                            <span className={`text-2xl font-bold ${colors.text}`}>
                              {card.score}
                            </span>
                            <Progress
                              value={card.score * 10}
                              className="h-1.5 flex-1"
                            />
                          </div>
                        </div>
                      </div>
                      <p className="text-xs leading-relaxed text-foreground/70 line-clamp-3">
                        {card.content}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* 第三屏：行动清单 */}
        {parsed.actionItems.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#8e2de2]/50 to-transparent" />
              <h3 className="text-sm font-medium text-[#8e2de2]">行动清单</h3>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#8e2de2]/50 to-transparent" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {parsed.actionItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="mt-0.5 p-1 rounded-full bg-[#8e2de2]/20 border border-[#8e2de2]/30">
                    <Check className="w-3 h-3 text-[#8e2de2]" />
                  </div>
                  <p className="text-sm leading-relaxed text-foreground/80 flex-1">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 底部：八字信息 */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
            <span>八字：{baziData.bazi.year} {baziData.bazi.month} {baziData.bazi.day} {baziData.bazi.hour}</span>
            <span className="text-[#8e2de2]">///</span>
            <span>日主：{baziData.dayMaster}</span>
            <span className="text-[#8e2de2]">///</span>
            <span>喜用神：{baziData.favorableGods.join('、')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// 获取卡片颜色配置
function getCardColors(color: string) {
  const colorMap: Record<string, { bg: string; iconBg: string; text: string }> = {
    purple: { bg: 'bg-purple-500/10', iconBg: 'bg-purple-500/20', text: 'text-purple-400' },
    blue: { bg: 'bg-blue-500/10', iconBg: 'bg-blue-500/20', text: 'text-blue-400' },
    green: { bg: 'bg-green-500/10', iconBg: 'bg-green-500/20', text: 'text-green-400' },
    yellow: { bg: 'bg-yellow-500/10', iconBg: 'bg-yellow-500/20', text: 'text-yellow-400' },
    cyan: { bg: 'bg-cyan-500/10', iconBg: 'bg-cyan-500/20', text: 'text-cyan-400' },
    red: { bg: 'bg-red-500/10', iconBg: 'bg-red-500/20', text: 'text-red-400' },
    orange: { bg: 'bg-orange-500/10', iconBg: 'bg-orange-500/20', text: 'text-orange-400' },
    pink: { bg: 'bg-pink-500/10', iconBg: 'bg-pink-500/20', text: 'text-pink-400' }
  };

  return colorMap[color] || colorMap.purple;
}

