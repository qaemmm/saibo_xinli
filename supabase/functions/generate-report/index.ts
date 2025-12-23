import { GoogleGenerativeAI } from "npm:@google/generative-ai@0.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  baziData: {
    year: string;
    month: string;
    day: string;
    hour: string;
    gender: string;
    wuxing: Record<string, number>;
    rizhu: string;
    xiyongshen: string;
  };
  emotionText: string;
}

Deno.serve(async (req) => {
  // 处理CORS预检请求
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { baziData, emotionText }: RequestBody = await req.json();

    // 获取Gemini API密钥
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    // 初始化Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    // 构建提示词
    const prompt = `你是一位融合了传统命理智慧与现代心理学的赛博疗愈师。请基于以下信息，生成一份深度疗愈报告：

【命理数据】
- 出生信息：${baziData.year}年${baziData.month}月${baziData.day}日${baziData.hour}时
- 性别：${baziData.gender}
- 日主：${baziData.rizhu}
- 五行分布：${JSON.stringify(baziData.wuxing)}
- 喜用神：${baziData.xiyongshen}

【当下情绪】
${emotionText}

请按照以下结构生成报告，每个部分都要深入、具体、有洞察力：

## 一、能量原型
基于日主和五行分布，描述此人的核心能量特质、天赋潜能和生命主题。用诗意而精准的语言，揭示其灵魂的本质。

## 二、光与影
分析五行的平衡与失衡，指出其性格中的"光明面"（优势、天赋）和"阴影面"（挑战、盲点）。要温柔而诚实，帮助其看见完整的自己。

## 三、当下回应
结合喜用神和当前情绪文本，分析当下的生命课题和内在需求。给予共情式的理解和支持，让对方感到被看见、被理解。

## 四、行动处方
提供3-5条具体可行的疗愈建议，包括：
- 情绪调节方法
- 生活方式调整
- 能量平衡练习
- 关系模式优化
每条建议都要结合命理特质，具有个性化和可操作性。

请用温暖、专业、富有诗意的语言撰写，让报告既有深度又易于理解，既有命理依据又贴近现代生活。`;

    // 调用Gemini生成报告
    const result = await model.generateContent(prompt);
    const response = result.response;
    const reportText = response.text();

    return new Response(
      JSON.stringify({
        success: true,
        report: reportText,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error generating report:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to generate report',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
