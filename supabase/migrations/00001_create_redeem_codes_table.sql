-- 创建兑换码表
CREATE TABLE IF NOT EXISTS redeem_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  max_uses INTEGER NOT NULL DEFAULT 1,
  used INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_redeem_codes_code ON redeem_codes(code);
CREATE INDEX IF NOT EXISTS idx_redeem_codes_active ON redeem_codes(active);

-- 插入测试兑换码
INSERT INTO redeem_codes (code, max_uses, expires_at) VALUES
  ('CYBER2025', 100, NOW() + INTERVAL '30 days'),
  ('HEALER888', 50, NOW() + INTERVAL '60 days'),
  ('TEST123', 10, NOW() + INTERVAL '7 days');

-- 创建验证兑换码的RPC函数
CREATE OR REPLACE FUNCTION validate_redeem_code(p_code TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_code_record RECORD;
  v_result JSON;
BEGIN
  -- 查询兑换码
  SELECT * INTO v_code_record
  FROM redeem_codes
  WHERE code = p_code
  AND active = true;

  -- 检查兑换码是否存在
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'message', '兑换码不存在或已失效'
    );
  END IF;

  -- 检查是否过期
  IF v_code_record.expires_at IS NOT NULL AND v_code_record.expires_at < NOW() THEN
    RETURN json_build_object(
      'success', false,
      'message', '兑换码已过期'
    );
  END IF;

  -- 检查使用次数
  IF v_code_record.used >= v_code_record.max_uses THEN
    RETURN json_build_object(
      'success', false,
      'message', '兑换码使用次数已达上限'
    );
  END IF;

  -- 增加使用次数
  UPDATE redeem_codes
  SET used = used + 1
  WHERE code = p_code;

  -- 返回成功
  RETURN json_build_object(
    'success', true,
    'message', '验证成功',
    'remaining', v_code_record.max_uses - v_code_record.used - 1
  );
END;
$$;

-- 设置公开访问权限（无需登录）
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON redeem_codes TO anon;
GRANT EXECUTE ON FUNCTION validate_redeem_code TO anon;