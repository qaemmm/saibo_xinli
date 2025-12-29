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
    const energyMatch = text.match(
      /##\s*(?:一、|01\.\s*\/\/\/\s*)(?:能量原型|源代码解码)[\s\S]*?\n([\s\S]*?)(?=##\s*(?:二、|02\.\s*\/\/\/\s*)|$)/
    );
    const lightMatch = text.match(
      /##\s*(?:二、|02\.\s*\/\/\/\s*)(?:光与影|系统Bug与天赋)[\s\S]*?\n([\s\S]*?)(?=##\s*(?:三、|03\.\s*\/\/\/\s*)|$)/
    );
    const responseMatch = text.match(
      /##\s*(?:三、|03\.\s*\/\/\/\s*)(?:当下回应|宇宙的回信)[\s\S]*?\n([\s\S]*?)(?=##\s*(?:四、|04\.\s*\/\/\/\s*)|$)/
    );
    const actionMatch = text.match(
      /##\s*(?:四、|04\.\s*\/\/\/\s*)(?:行动处方|能量补丁)[\s\S]*?\n([\s\S]*?)$/
    );

    if (energyMatch) sections.energyArchetype = energyMatch[1].trim();
    if (lightMatch) sections.lightAndShadow = lightMatch[1].trim();
    if (responseMatch) sections.currentResponse = responseMatch[1].trim();
    if (actionMatch) sections.actionPrescription = actionMatch[1].trim();

    return sections;
  };

  const sections = parseReport(report);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* 时间信息卡片 */}
      <Card className="card-hover glow-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 gradient-text">
            <Sparkles className="w-5 h-5" />
            您的时间信息
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">能量流向</p>
              <p className="text-lg font-semibold">
                {baziData.gender === 'male' ? '男' : '女'}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">时间坐标</p>
              <p className="text-lg font-semibold">已接收</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 源代码解码 */}
      {sections.energyArchetype && (
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Zap className="w-5 h-5" />
              01. 源代码解码
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

      {/* 系统Bug与天赋 */}
      {sections.lightAndShadow && (
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <div className="flex items-center gap-1">
                <Sun className="w-5 h-5" />
                <Moon className="w-5 h-5" />
              </div>
              02. 系统Bug与天赋
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

      {/* 宇宙的回信 */}
      {sections.currentResponse && (
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Heart className="w-5 h-5" />
              03. 宇宙的回信
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

      {/* 能量补丁 */}
      {sections.actionPrescription && (
        <Card className="card-hover border-accent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 gradient-gold">
              <Sparkles className="w-5 h-5" />
              04. 能量补丁
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
