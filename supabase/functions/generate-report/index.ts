import { GoogleGenerativeAI } from "npm:@google/generative-ai@0.21.0";
import { buildPrompt } from "./prompt-template.ts";
import { buildVisualPrompt } from "./prompt-visual.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const sanitizeReport = (text: string) => {
  const replacements: Array<[RegExp, string]> = [
    [/改运/g, '调整方向'],
    [/改命/g, '自我调整']
  ];

  return replacements.reduce((result, [pattern, replacement]) => {
    return result.replace(pattern, replacement);
  }, text);
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
  nickname?: string;
  timeUnknown?: boolean;
  redeemCode?: string;
  outputFormat?: 'text' | 'visual';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { baziData, emotionText, nickname, timeUnknown, redeemCode, outputFormat = 'text' }: RequestBody =
      await req.json();

    if (!redeemCode) {
      return new Response(
        JSON.stringify({
          success: false,
          error: '缺少兑换码'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not configured');
    }

    const redeemResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/consume_redeem_code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`
      },
      body: JSON.stringify({ p_code: redeemCode })
    });

    if (!redeemResponse.ok) {
      throw new Error('兑换码验证失败');
    }

    const redeemResult = await redeemResponse.json();
    if (!redeemResult.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: redeemResult.message || '兑换码无效'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

    const greeting = nickname ? `代号：${nickname}` : '代号：迷途旅人';
    const timeNote = timeUnknown
      ? '注意：时柱数据丢失，请忽略晚年运势分析，聚焦于灵魂底色与当下状态。'
      : '数据完整：四柱全息扫描完成。';

    const prompt = outputFormat === 'visual'
      ? buildVisualPrompt({ baziData, emotionText, greeting, timeNote })
      : buildPrompt({ baziData, emotionText, greeting, timeNote });

    const result = await model.generateContent(prompt);
    const response = result.response;
    const rawText = response.text();

    if (outputFormat === 'visual') {
      try {
        const jsonText = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const visualData = JSON.parse(jsonText);

        return new Response(
          JSON.stringify({
            success: true,
            visualReport: visualData,
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      } catch (parseError) {
        console.error('JSON解析失败:', parseError);
        return new Response(
          JSON.stringify({
            success: false,
            error: 'AI返回的数据格式不正确',
            rawText: rawText
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          }
        );
      }
    }

    const reportText = sanitizeReport(rawText);
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
