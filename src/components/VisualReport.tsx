import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
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
import type { VisualReportData, VisualReportCard } from '@/types/types';

interface VisualReportProps {
  data: VisualReportData;
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

// 颜色映射
const colorMap: Record<string, { bg: string; border: string; text: string; progress: string }> = {
  purple: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    text: 'text-purple-400',
    progress: 'bg-purple-500'
  },
  blue: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    progress: 'bg-blue-500'
  },
  green: {
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    text: 'text-green-400',
    progress: 'bg-green-500'
  },
  yellow: {
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    text: 'text-yellow-400',
    progress: 'bg-yellow-500'
  },
  cyan: {
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    text: 'text-cyan-400',
    progress: 'bg-cyan-500'
  },
  red: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    text: 'text-red-400',
    progress: 'bg-red-500'
  },
  orange: {
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    text: 'text-orange-400',
    progress: 'bg-orange-500'
  },
  pink: {
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/30',
    text: 'text-pink-400',
    progress: 'bg-pink-500'
  }
};

// 单个卡片组件
function ReportCard({ card }: { card: VisualReportCard }) {
  const Icon = iconMap[card.key] || User;
  const colors = colorMap[card.color] || colorMap.purple;

  return (
    <Card className={`card-hover border ${colors.border} ${colors.bg} backdrop-blur transition-all duration-300 hover:scale-[1.02]`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className={`w-5 h-5 ${colors.text}`} />
            <CardTitle className="text-lg">{card.title}</CardTitle>
          </div>
          <span className={`text-sm font-semibold ${colors.text}`}>
            {card.score}/10
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {card.content}
        </p>
        <Progress 
          value={card.score * 10} 
          className="h-2"
          indicatorClassName={colors.progress}
        />
      </CardContent>
    </Card>
  );
}

export default function VisualReport({ data }: VisualReportProps) {
  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 p-4">
      {/* 总体评价卡片 */}
      <Card className="card-hover bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-2xl gradient-text">命理总评</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-base leading-relaxed">{data.summary}</p>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">综合评分</span>
            <Progress 
              value={data.summary_score * 10} 
              className="flex-1 h-3"
              indicatorClassName="bg-gradient-to-r from-purple-500 to-blue-500"
            />
            <span className="text-lg font-bold gradient-text">
              {data.summary_score}/10
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Bento Grid 卡片网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.cards.map((card) => (
          <ReportCard key={card.key} card={card} />
        ))}
      </div>

      {/* 免责声明 */}
      <Card className="bg-card/50 border-border/50">
        <CardContent className="pt-6">
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            ⚠️ 本报告仅供文化交流与心理参考，不具预测功能。
            <br />
            所有分析基于传统文化视角，不构成任何承诺或保证。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

