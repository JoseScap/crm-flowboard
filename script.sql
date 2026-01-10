DROP FUNCTION IF EXISTS get_businesses_with_leads_count_where_user_is_member() CASCADE;

CREATE OR REPLACE FUNCTION get_businesses_with_leads_count_where_user_is_member()
RETURNS TABLE(
  business_id BIGINT,
  leads_count BIGINT
) AS $$
BEGIN
  -- Security check
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  RETURN QUERY 
  SELECT 
    be.business_id, 
    COUNT(psl.id)::BIGINT AS leads_count
  FROM business_employees be
  LEFT JOIN pipeline_stage_leads psl ON 
    psl.business_id = be.business_id AND 
    psl.is_active = TRUE AND 
    psl.closed_at IS NULL
  WHERE be.user_id = auth.uid()
  GROUP BY be.business_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;