import solarlunar from 'solarlunar';
import type { BaziData } from '@/types/types';

// 天干
const TIANGAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
// 地支
const DIZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

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

const BAZI_API_URL = import.meta.env.VITE_BAZI_API_URL as string | undefined;

/**
 * 计算八字（优先使用后端 Python lunar_python 服务）
 */
export async function calculateBazi(
  year: number,
  month: number,
  day: number,
  hour: number,
  gender: string,
  timeUnknown: boolean
): Promise<BaziData> {
  const normalizedHour = timeUnknown ? 12 : hour;

  if (BAZI_API_URL) {
    const response = await fetch(`${BAZI_API_URL}/bazi`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        year,
        month,
        day,
        hour: normalizedHour,
        gender,
        time_unknown: timeUnknown
      })
    });

    if (!response.ok) {
      throw new Error('Bazi API request failed');
    }

    const data = (await response.json()) as BaziData;
    return data;
  }

  return calculateBaziLocal(year, month, day, normalizedHour, gender, timeUnknown);
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
  // 使用solarlunar库获取农历信息
  const lunar = solarlunar.solar2lunar(year, month, day);
  
  // 获取年柱
  const yearGan = TIANGAN[(year - 4) % 10];
  const yearZhi = DIZHI[(year - 4) % 12];
  const yearPillar = yearGan + yearZhi;

  // 获取月柱（简化计算）
  const monthGanIndex = ((year - 4) % 10) * 2 + month - 2;
  const monthGan = TIANGAN[monthGanIndex % 10];
  const monthZhi = DIZHI[(month + 1) % 12];
  const monthPillar = monthGan + monthZhi;

  // 获取日柱
  const dayGan = lunar.gzDay.substring(0, 1);
  const dayZhi = lunar.gzDay.substring(1, 2);
  const dayPillar = dayGan + dayZhi;

  // 获取时柱
  const hourZhiIndex = Math.floor((normalizedHour + 1) / 2) % 12;
  const hourZhi = DIZHI[hourZhiIndex];
  const hourGanIndex = (TIANGAN.indexOf(dayGan) * 2 + hourZhiIndex) % 10;
  const hourGan = TIANGAN[hourGanIndex];
  const hourPillar = hourGan + hourZhi;

  // 计算五行分布
  const wuxing: Record<string, number> = {
    '木': 0,
    '火': 0,
    '土': 0,
    '金': 0,
    '水': 0
  };

  // 统计八字中的五行
  const bazi = [yearGan, yearZhi, monthGan, monthZhi, dayGan, dayZhi, hourGan, hourZhi];
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

  return {
    year: yearPillar,
    month: monthPillar,
    day: dayPillar,
    hour: hourPillar,
    gender,
    wuxing,
    rizhu,
    xiyongshen
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
