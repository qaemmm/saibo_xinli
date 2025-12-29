import { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Button } from '@/components/ui/button';
import { Download, FileDown, Image as ImageIcon } from 'lucide-react';
import type { BaziData } from '@/types/types';

interface ReportLongImageProps {
  report: string;
  baziData: BaziData;
}

const parseReport = (text: string) => {
  const titleMatch = text.match(/^\s*#\s*[^:：]*[:：]\s*(.+)$/m);
  const oneLinerMatch = text.match(/^\s*>\s*\*?(.+?)\*?\s*$/m);

  const sections = {
    title: titleMatch?.[1]?.replace(/[【】]/g, '').trim() ?? '',
    oneLiner: oneLinerMatch?.[1]?.trim() ?? '',
    energyArchetype: '',
    lightAndShadow: '',
    currentResponse: '',
    actionPrescription: ''
  };

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

const buildWaveSeries = (seed: number) => {
  const base = (seed % 7) / 10;
  return Array.from({ length: 28 }, (_, index) => {
    const t = index / 27;
    const wave = Math.sin(t * Math.PI * 2) * 0.28 + Math.sin(t * Math.PI * 4 + base) * 0.12;
    const trend = (0.55 - t) * 0.12;
    return 0.55 + wave + trend;
  });
};

const buildWavePath = (values: number[], width: number, height: number, padding: number) => {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const scaleX = (index: number) =>
    padding + (index / (values.length - 1)) * (width - padding * 2);
  const scaleY = (value: number) => {
    if (max === min) return height / 2;
    const normalized = (value - min) / (max - min);
    return height - padding - normalized * (height - padding * 2);
  };

  return values
    .map((value, index) => `${index === 0 ? 'M' : 'L'}${scaleX(index)},${scaleY(value)}`)
    .join(' ');
};

const buildRadarPoints = (scores: number[], size: number) => {
  const center = size / 2;
  const radius = size * 0.36;
  return scores
    .map((score, index) => {
      const angle = (Math.PI * 2 * index) / scores.length - Math.PI / 2;
      const r = radius * (score / 100);
      const x = center + Math.cos(angle) * r;
      const y = center + Math.sin(angle) * r;
      return `${x},${y}`;
    })
    .join(' ');
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export default function ReportLongImage({ report, baziData }: ReportLongImageProps) {
  const reportRef = useRef<HTMLDivElement | null>(null);
  const sections = parseReport(report);
  const title = sections.title || '灵魂代号';
  const oneLiner = sections.oneLiner || '你不是迷路，只是在等风。';

  const wuxing = baziData.wuxing || {};
  const wood = wuxing['木'] ?? 0;
  const fire = wuxing['火'] ?? 0;
  const earth = wuxing['土'] ?? 0;
  const metal = wuxing['金'] ?? 0;
  const water = wuxing['水'] ?? 0;

  const scale = (value: number) => clamp(Math.round((value / 8) * 100), 20, 100);
  const radarScores = [
    scale(metal + earth),
    scale(water + wood),
    scale(wood + fire),
    scale(metal + water),
    scale(earth + wood),
    scale(fire + water)
  ];

  const waveSeed = baziData.day?.charCodeAt(0) ?? 7;
  const waveSeries = buildWaveSeries(waveSeed);
  const wavePath = buildWavePath(waveSeries, 900, 420, 40);
  const maxIndex = waveSeries.indexOf(Math.max(...waveSeries));
  const minIndex = waveSeries.indexOf(Math.min(...waveSeries));
  const currentYear = new Date().getFullYear();

  const capsuleTags = ['破茧', '复原', '拂晓', '回温', '重塑', '蓄力'];
  const capsules = Array.from({ length: 6 }, (_, index) => ({
    year: currentYear + index,
    tag: capsuleTags[index % capsuleTags.length]
  }));

  const exportImage = async () => {
    if (!reportRef.current) return;
    const canvas = await html2canvas(reportRef.current, {
      scale: 2,
      backgroundColor: '#ffffff'
    });
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `report-${Date.now()}.png`;
    link.click();
  };

  const exportPdf = async () => {
    if (!reportRef.current) return;
    const canvas = await html2canvas(reportRef.current, {
      scale: 2,
      backgroundColor: '#ffffff'
    });
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF('p', 'pt', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * pageWidth) / canvas.width;
    let position = 0;

    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    while (imgHeight + position > pageHeight) {
      position -= pageHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    }
    pdf.save(`report-${Date.now()}.pdf`);
  };

  const exportPage = () => {
    const html = document.documentElement.outerHTML;
    const blob = new Blob([html], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `report-${Date.now()}.html`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="w-full max-w-3xl mx-auto report-shell space-y-6 pb-16">
      <div className="report-toolbar">
        <Button variant="outline" size="sm" onClick={exportImage}>
          <ImageIcon className="w-4 h-4 mr-2" />
          保存图片
        </Button>
        <Button size="sm" onClick={exportPdf}>
          <FileDown className="w-4 h-4 mr-2" />
          保存PDF
        </Button>
        <Button variant="secondary" size="sm" onClick={exportPage}>
          <Download className="w-4 h-4 mr-2" />
          保存网页
        </Button>
      </div>
      <div ref={reportRef} className="space-y-6">
      <section className="report-cover">
        <div className="report-cover-inner">
          <div className="report-badge">AI 驱动</div>
          <p className="report-kicker">赛博疗愈师 V3.0</p>
          <h1 className="report-title">{title}</h1>
          <p className="report-oneliner">{oneLiner}</p>
          <div className="report-meta">
            <span>性别：{baziData.gender === 'male' ? '男' : '女'}</span>
            <span>元素偏好：{baziData.xiyongshen || '未知'}</span>
          </div>
        </div>
      </section>

      <section className="report-card">
        <div className="report-card-header">
          <h2>流年人生能量波形（100年）</h2>
          <p>绿线代表上升，红线代表回落，星标为高峰点。</p>
        </div>
        <div className="report-chart-shell">
          <svg viewBox="0 0 900 420" className="report-wave">
            <defs>
              <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8e2de2" />
                <stop offset="100%" stopColor="#4bc0c8" />
              </linearGradient>
              <linearGradient id="gridFade" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
              </linearGradient>
            </defs>
            {Array.from({ length: 9 }, (_, index) => {
              const x = 40 + index * 100;
              return (
                <line
                  key={`grid-${x}`}
                  x1={x}
                  y1={40}
                  x2={x}
                  y2={380}
                  stroke="url(#gridFade)"
                  strokeDasharray="6 10"
                />
              );
            })}
            <path d={wavePath} fill="none" stroke="url(#waveGradient)" strokeWidth="4" />
            <circle
              cx={40 + (maxIndex / (waveSeries.length - 1)) * 820}
              cy={120}
              r="8"
              fill="#f7d774"
            />
            <circle
              cx={40 + (minIndex / (waveSeries.length - 1)) * 820}
              cy={320}
              r="8"
              fill="#6fd1ff"
            />
          </svg>
          <div className="report-wave-labels">
            <span>巅峰</span>
            <span>重塑</span>
          </div>
          <div className="report-wave-years">
            <span>{currentYear}</span>
            <span>{currentYear + 50}</span>
            <span>{currentYear + 100}</span>
          </div>
        </div>
      </section>

      <section className="report-card report-card-paper">
        <div className="report-card-header">
          <h2>命理总评</h2>
          <p>基于能量结构与情绪信号的综合解读。</p>
        </div>
        <div className="report-text">
          {sections.energyArchetype || '你的内在能量具有清晰的轮廓，正处于重新聚焦的阶段。'}
        </div>
      </section>

      <section className="report-card report-card-paper">
        <div className="report-card-header">
          <h2>六边形战士雷达</h2>
          <p>搞钱/桃花/智识/贵人/健康/心态的当前权重。</p>
        </div>
        <div className="report-radar">
          <svg viewBox="0 0 320 320" className="report-radar-chart">
            <defs>
              <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(142,45,226,0.55)" />
                <stop offset="100%" stopColor="rgba(75,192,200,0.45)" />
              </linearGradient>
            </defs>
            <polygon
              points="160,32 270,96 270,224 160,288 50,224 50,96"
              fill="none"
              stroke="rgba(20,30,40,0.25)"
              strokeWidth="2"
            />
            <polygon
              points="160,64 238,112 238,208 160,256 82,208 82,112"
              fill="none"
              stroke="rgba(20,30,40,0.15)"
              strokeWidth="2"
            />
            <polygon points={buildRadarPoints(radarScores, 320)} fill="url(#radarGradient)" stroke="#4bc0c8" />
          </svg>
          <div className="report-radar-labels">
            <span>搞钱</span>
            <span>桃花</span>
            <span>智识</span>
            <span>贵人</span>
            <span>健康</span>
            <span>心态</span>
          </div>
        </div>
        <div className="report-text">
          {sections.lightAndShadow || '你的能量结构呈现出稳定的波动，优点与课题并存。'}
        </div>
      </section>

      <section className="report-card report-card-paper">
        <div className="report-card-header">
          <h2>年度运势胶囊</h2>
          <p>用短句记录每一年的关键词。</p>
        </div>
        <div className="report-capsules">
          {capsules.map((item) => (
            <div key={item.year} className="report-capsule">
              <div className="report-capsule-year">{item.year}</div>
              <div className="report-capsule-tag">{item.tag}</div>
              <p>把握节奏，愿你的努力有回声。</p>
            </div>
          ))}
        </div>
      </section>

      <section className="report-card report-card-paper">
        <div className="report-card-header">
          <h2>当下回应</h2>
          <p>与你的情绪信号对话。</p>
        </div>
        <div className="report-text">
          {sections.currentResponse || '你正在寻找方向感，而这份信号会慢慢浮现。'}
        </div>
      </section>

      <section className="report-card report-card-paper">
        <div className="report-card-header">
          <h2>行动处方</h2>
          <p>三条轻量建议，帮助你稳住节奏。</p>
        </div>
        <div className="report-text">
          {sections.actionPrescription || '从微小的仪式开始，让自己先被看见。'}
        </div>
      </section>

      <section className="report-footnote">
        仅供文化交流与心理参考，不具预测功能。
      </section>
      </div>
    </div>
  );
}
