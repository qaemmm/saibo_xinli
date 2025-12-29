export interface BaziData {
  year: string;  // 年柱，如"甲子"
  month: string; // 月柱，如"丙寅"
  day: string;   // 日柱，如"戊辰"
  hour: string;  // 时柱，如"壬戌"
  gender: string; // 性别
  wuxing: Record<string, number>; // 五行统计
  rizhu: string; // 日主
  xiyongshen: string; // 喜用神

  // 出生信息（用于展示）
  solarYear?: number;
  solarMonth?: number;
  solarDay?: number;
  solarHour?: number;
  lunarYear?: string;
  lunarMonth?: string;
  lunarDay?: string;
  timeUnknown?: boolean;
}

export interface ReportData {
  energyArchetype: string;
  lightAndShadow: string;
  currentResponse: string;
  actionPrescription: string;
}

export interface RedeemCodeValidation {
  success: boolean;
  message: string;
  remaining?: number;
}

// 可视化报告卡片数据
export interface VisualReportCard {
  key: string;
  title: string;
  content: string;
  score: number; // 1-10
  color: 'purple' | 'blue' | 'green' | 'yellow' | 'cyan' | 'red' | 'orange' | 'pink';
}

// 可视化报告数据
export interface VisualReportData {
  summary: string; // 总体评价
  summary_score: number; // 总体评分 1-10
  cards: VisualReportCard[]; // 8个维度的卡片
}
