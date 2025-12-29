-- Harden redeem code access and split check vs consume.

REVOKE SELECT ON redeem_codes FROM anon;
REVOKE SELECT ON redeem_codes FROM authenticated;

-- Replace validation to be non-consuming (check only).
CREATE OR REPLACE FUNCTION validate_redeem_code(p_code TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_code_record RECORD;
BEGIN
  SELECT * INTO v_code_record
  FROM redeem_codes
  WHERE code = p_code
  AND active = true;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'message', '兑换码不存在或已失效'
    );
  END IF;

  IF v_code_record.expires_at IS NOT NULL AND v_code_record.expires_at < NOW() THEN
    RETURN json_build_object(
      'success', false,
      'message', '兑换码已过期'
    );
  END IF;

  IF v_code_record.used >= v_code_record.max_uses THEN
    RETURN json_build_object(
      'success', false,
      'message', '兑换码使用次数已达上限'
    );
  END IF;

  RETURN json_build_object(
    'success', true,
    'message', '验证成功',
    'remaining', v_code_record.max_uses - v_code_record.used
  );
END;
$$;

-- Consume a redeem code when generating a report.
CREATE OR REPLACE FUNCTION consume_redeem_code(p_code TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_code_record RECORD;
BEGIN
  SELECT * INTO v_code_record
  FROM redeem_codes
  WHERE code = p_code
  AND active = true;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'message', '兑换码不存在或已失效'
    );
  END IF;

  IF v_code_record.expires_at IS NOT NULL AND v_code_record.expires_at < NOW() THEN
    RETURN json_build_object(
      'success', false,
      'message', '兑换码已过期'
    );
  END IF;

  IF v_code_record.used >= v_code_record.max_uses THEN
    RETURN json_build_object(
      'success', false,
      'message', '兑换码使用次数已达上限'
    );
  END IF;

  UPDATE redeem_codes
  SET used = used + 1
  WHERE code = p_code;

  RETURN json_build_object(
    'success', true,
    'message', '兑换码核销成功',
    'remaining', v_code_record.max_uses - v_code_record.used - 1
  );
END;
$$;

GRANT EXECUTE ON FUNCTION validate_redeem_code TO anon;
REVOKE EXECUTE ON FUNCTION consume_redeem_code FROM anon;
GRANT EXECUTE ON FUNCTION consume_redeem_code TO service_role;
