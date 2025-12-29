import type { BaziData } from '@/types/types';
import { Solar } from 'lunar-typescript';

// 五行对应关系
const WUXING_MAP: Record<string, string> = {
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火',
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水',
  '寅': '木', '卯': '木',
  '巳': '火', '午': '火',
  '辰': '土', '丑': '土', '戌': '土', '未': '土',
  '申': '金', '酉': '金',
  '子': '水', '亥': '水'
};

/**
 * 计算八字（前端直接使用 lunar-typescript）
 */
export async function calculateBazi(
  year: number,
  month: number,
  day: number,
  hour: number,
  gender: string,
  timeUnknown: boolean
): Promise<BaziData> {
  return calculateBaziLocal(year, month, day, hour, gender, timeUnknown);
}

function calculateBaziLocal(
  year: number,
  month: number,
  day: number,
  hour: number,
  gender: string,
  timeUnknown: boolean
): BaziData {
  const normalizedHour = timeUnknown ? 12 : hour;
  const solar = Solar.fromYmdHms(year, month, day, normalizedHour, 0, 0);
  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();

  const yearPillar = String(eightChar.getYear());
  const monthPillar = String(eightChar.getMonth());
  const dayPillar = String(eightChar.getDay());
  const hourPillar = String(eightChar.getTime());

  const dayGan = dayPillar.substring(0, 1);

  // 计算五行分布
  const wuxing: Record<string, number> = {
    '木': 0,
    '火': 0,
    '土': 0,
    '金': 0,
    '水': 0
  };

  // 统计八字中的五行
  const bazi = [
    yearPillar.substring(0, 1),
    yearPillar.substring(1, 2),
    monthPillar.substring(0, 1),
    monthPillar.substring(1, 2),
    dayPillar.substring(0, 1),
    dayPillar.substring(1, 2),
    hourPillar.substring(0, 1),
    hourPillar.substring(1, 2)
  ];
  bazi.forEach(char => {
    const element = WUXING_MAP[char];
    if (element) {
      wuxing[element]++;
    }
  });

  // 日主
  const rizhu = dayGan;

  // 简化的喜用神判断
  const xiyongshen = calculateXiyongshen(wuxing, rizhu);

  // 获取农历信息
  const lunarYear = lunar.getYearInChinese();
  const lunarMonth = lunar.getMonthInChinese();
  const lunarDay = lunar.getDayInChinese();

  return {
    year: yearPillar,
    month: monthPillar,
    day: dayPillar,
    hour: hourPillar,
    gender,
    wuxing,
    rizhu,
    xiyongshen,
    // 出生信息
    solarYear: year,
    solarMonth: month,
    solarDay: day,
    solarHour: normalizedHour,
    lunarYear,
    lunarMonth,
    lunarDay,
    timeUnknown
  };
}

/**
 * 计算喜用神（简化版）
 */
function calculateXiyongshen(wuxing: Record<string, number>, rizhu: string): string {
  const rizhuElement = WUXING_MAP[rizhu];
  
  // 找出最弱的五行作为喜用神
  let minElement = '';
  let minCount = Infinity;
  
  for (const [element, count] of Object.entries(wuxing)) {
    if (count < minCount) {
      minCount = count;
      minElement = element;
    }
  }

  // 如果日主五行过弱，则喜用神为日主五行
  if (wuxing[rizhuElement] <= 2) {
    return rizhuElement;
  }

  // 否则返回最弱的五行
  return minElement;
}

/**
 * 获取五行描述
 */
export function getWuxingDescription(wuxing: Record<string, number>): string {
  const descriptions: string[] = [];
  
  for (const [element, count] of Object.entries(wuxing)) {
    if (count === 0) {
      descriptions.push(`${element}缺失`);
    } else if (count >= 3) {
      descriptions.push(`${element}旺盛`);
    }
  }

  return descriptions.length > 0 ? descriptions.join('，') : '五行平衡';
}
