import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { BaziData } from '@/types/types';

interface BaziDisplayProps {
  baziData: BaziData;
}

export default function BaziDisplay({ baziData }: BaziDisplayProps) {
  // 解析四柱数据
  const yearGan = baziData.year?.substring(0, 1) || '';
  const yearZhi = baziData.year?.substring(1, 2) || '';
  const monthGan = baziData.month?.substring(0, 1) || '';
  const monthZhi = baziData.month?.substring(1, 2) || '';
  const dayGan = baziData.day?.substring(0, 1) || '';
  const dayZhi = baziData.day?.substring(1, 2) || '';
  const hourGan = baziData.hour?.substring(0, 1) || '';
  const hourZhi = baziData.hour?.substring(1, 2) || '';

  // 天干地支映射
  const ganMap: Record<string, string> = {
    '甲': '木', '乙': '木', '丙': '火', '丁': '火',
    '戊': '土', '己': '土', '庚': '金', '辛': '金',
    '壬': '水', '癸': '水'
  };

  const zhiMap: Record<string, string> = {
    '子': '水', '丑': '土', '寅': '木', '卯': '木',
    '辰': '土', '巳': '火', '午': '火', '未': '土',
    '申': '金', '酉': '金', '戌': '土', '亥': '水'
  };

  // 获取五行颜色
  const getWuxingColor = (wuxing: string) => {
    const colorMap: Record<string, string> = {
      '木': 'text-green-500',
      '火': 'text-red-500',
      '土': 'text-yellow-600',
      '金': 'text-amber-400',
      '水': 'text-blue-500'
    };
    return colorMap[wuxing] || 'text-foreground';
  };

  // 渲染单个柱
  const renderPillar = (label: string, gan: string, zhi: string) => {
    const ganWuxing = ganMap[gan] || '';
    const zhiWuxing = zhiMap[zhi] || '';

    return (
      <div className="flex flex-col items-center space-y-2">
        <div className="text-xs text-muted-foreground font-medium">{label}</div>
        <div className="flex flex-col items-center bg-primary/5 border border-primary/20 rounded-lg p-3 min-w-[70px]">
          <div className={`text-2xl font-bold ${getWuxingColor(ganWuxing)}`}>
            {gan}
          </div>
          <div className="h-px w-8 bg-border my-1"></div>
          <div className={`text-2xl font-bold ${getWuxingColor(zhiWuxing)}`}>
            {zhi}
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          {ganWuxing} / {zhiWuxing}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 出生信息卡片 */}
      <Card className="bg-card/70 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            📅 出生信息
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">公历：</span>
              <span className="font-medium ml-2">
                {baziData.solarYear}年{baziData.solarMonth}月{baziData.solarDay}日 {baziData.solarHour}时
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">农历：</span>
              <span className="font-medium ml-2">
                {baziData.lunarYear}{baziData.lunarMonth}{baziData.lunarDay}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">性别：</span>
              <span className="font-medium ml-2">
                {baziData.gender === 'male' ? '男' : '女'}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">时辰：</span>
              <span className="font-medium ml-2">
                {baziData.timeUnknown ? '时间不详（默认午时）' : `${baziData.solarHour}时`}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 四柱八字 */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/30">
        <CardHeader>
          <CardTitle className="text-xl gradient-text flex items-center gap-2">
            ✨ 四柱八字
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-around items-center py-4">
            {renderPillar('年柱', yearGan, yearZhi)}
            {renderPillar('月柱', monthGan, monthZhi)}
            {renderPillar('日柱', dayGan, dayZhi)}
            {renderPillar('时柱', hourGan, hourZhi)}
          </div>

          <div className="mt-6 pt-4 border-t border-border/50">
            <div className="text-center text-sm text-muted-foreground">
              <p className="mb-2">完整八字：</p>
              <p className="text-lg font-bold gradient-text">
                {baziData.year} {baziData.month} {baziData.day} {baziData.hour}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 五行分析 */}
      {baziData.wuxing && (
        <Card className="bg-card/70 backdrop-blur border-border/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              🌟 五行分析
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-3">
              {Object.entries(baziData.wuxing).map(([element, count]) => (
                <div key={element} className="text-center">
                  <div className={`text-2xl font-bold ${getWuxingColor(element)}`}>
                    {element}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {count} 个
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

