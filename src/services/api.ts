import { supabase } from '@/db/supabase';
import type { BaziData, RedeemCodeValidation } from '@/types/types';

/**
 * 验证兑换码
 */
export async function validateRedeemCode(code: string): Promise<RedeemCodeValidation> {
  try {
    const { data, error } = await supabase.rpc('validate_redeem_code', {
      p_code: code
    });

    if (error) {
      console.error('验证兑换码错误:', error);
      return {
        success: false,
        message: '验证失败，请稍后重试'
      };
    }

    return data as RedeemCodeValidation;
  } catch (error) {
    console.error('验证兑换码异常:', error);
    return {
      success: false,
      message: '网络错误，请检查连接'
    };
  }
}

/**
 * 生成疗愈报告
 */
export async function generateReport(
  baziData: BaziData,
  emotionText: string,
  options?: { nickname?: string; timeUnknown?: boolean }
): Promise<{ success: boolean; report?: string; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('generate-report', {
      body: {
        baziData,
        emotionText,
        nickname: options?.nickname,
        timeUnknown: options?.timeUnknown ?? false
      }
    });

    if (error) {
      const errorMsg = await error?.context?.text();
      console.error('生成报告错误:', errorMsg || error?.message);
      return {
        success: false,
        error: errorMsg || error?.message || '生成报告失败'
      };
    }

    if (!data.success) {
      return {
        success: false,
        error: data.error || '生成报告失败'
      };
    }

    return {
      success: true,
      report: data.report
    };
  } catch (error) {
    console.error('生成报告异常:', error);
    return {
      success: false,
      error: '网络错误，请检查连接'
    };
  }
}
