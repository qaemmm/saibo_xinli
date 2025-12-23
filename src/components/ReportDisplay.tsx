import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, Sun, Moon, Heart, Zap } from 'lucide-react';
import type { BaziData } from '@/types/types';

interface ReportDisplayProps {
  report: string;
  baziData: BaziData;
}

export default function ReportDisplay({ report, baziData }: ReportDisplayProps) {
  // 解析报告内容
  const parseReport = (text: string) => {
    const sections = {
      energyArchetype: '',
      lightAndShadow: '',
      currentResponse: '',
      actionPrescription: ''
    };

    // 使用正则表达式提取各个部分
    const energyMatch = text.match(/##\s*一、能量原型\s*([\s\S]*?)(?=##\s*二、|$)/);
    const lightMatch = text.match(/##\s*二、光与影\s*([\s\S]*?)(?=##\s*三、|$)/);
    const responseMatch = text.match(/##\s*三、当下回应\s*([\s\S]*?)(?=##\s*四、|$)/);
    const actionMatch = text.match(/##\s*四、行动处方\s*([\s\S]*?)$/);

    if (energyMatch) sections.energyArchetype = energyMatch[1].trim();
    if (lightMatch) sections.lightAndShadow = lightMatch[1].trim();
    if (responseMatch) sections.currentResponse = responseMatch[1].trim();
    if (actionMatch) sections.actionPrescription = actionMatch[1].trim();

    return sections;
  };

  const sections = parseReport(report);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* 八字信息卡片 */}
      <Card className="card-hover glow-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 gradient-text">
            <Sparkles className="w-5 h-5" />
            您的命理信息
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">年柱</p>
              <p className="text-lg font-semibold">{baziData.year}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">月柱</p>
              <p className="text-lg font-semibold">{baziData.month}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">日柱</p>
              <p className="text-lg font-semibold">{baziData.day}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">时柱</p>
              <p className="text-lg font-semibold">{baziData.hour}</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">五行分布</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(baziData.wuxing).map(([element, count]) => (
                <Badge key={element} variant={count === 0 ? 'outline' : 'secondary'}>
                  {element}: {count}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">日主</p>
              <p className="text-lg font-semibold gradient-gold">{baziData.rizhu}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">喜用神</p>
              <p className="text-lg font-semibold gradient-gold">{baziData.xiyongshen}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 能量原型 */}
      {sections.energyArchetype && (
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Zap className="w-5 h-5" />
              一、能量原型
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-64">
              <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                {sections.energyArchetype}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* 光与影 */}
      {sections.lightAndShadow && (
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <div className="flex items-center gap-1">
                <Sun className="w-5 h-5" />
                <Moon className="w-5 h-5" />
              </div>
              二、光与影
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-64">
              <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                {sections.lightAndShadow}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* 当下回应 */}
      {sections.currentResponse && (
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Heart className="w-5 h-5" />
              三、当下回应
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-64">
              <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                {sections.currentResponse}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* 行动处方 */}
      {sections.actionPrescription && (
        <Card className="card-hover border-accent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 gradient-gold">
              <Sparkles className="w-5 h-5" />
              四、行动处方
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-64">
              <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                {sections.actionPrescription}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
