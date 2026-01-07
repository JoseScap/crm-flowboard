DROP FUNCTION IF EXISTS get_my_business_employee_id_by_business(BIGINT) CASCADE;
CREATE OR REPLACE FUNCTION get_my_business_employee_id_by_business(p_business_id BIGINT)
RETURNS BIGINT AS $$
BEGIN
  RETURN (
    SELECT id
    FROM business_employees
    WHERE business_id = p_business_id AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;