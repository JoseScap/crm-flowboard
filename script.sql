DROP FUNCTION IF EXISTS add_business_employee(BIGINT,TEXT,TEXT,TEXT) CASCADE;
CREATE OR REPLACE FUNCTION add_business_employee(p_business_id BIGINT, p_user_email TEXT, p_first_name TEXT, p_last_name TEXT)
RETURNS VOID AS $$
DECLARE
  v_user_email TEXT;
  v_user_id UUID;
BEGIN
  IF NOT is_business_owner(p_business_id) THEN
    RAISE EXCEPTION 'You are not the owner of business %', p_business_id;
  END IF;

  IF p_first_name IS NULL OR p_last_name IS NULL THEN
    RAISE EXCEPTION 'First name and last name are required';
  END IF;

  SELECT id, email INTO v_user_id, v_user_email
  FROM auth.users
  WHERE email = p_user_email
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User email % was not found', p_user_email;
  END IF;

  IF EXISTS (
    SELECT 1 FROM business_employees 
    WHERE business_id = p_business_id AND user_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'User email % is already an employee of this business', p_user_email;
  END IF;

  INSERT INTO business_employees (business_id, user_id, email, employee_type, first_name, last_name)
  VALUES (p_business_id, v_user_id, v_user_email, 'salesperson'::business_employee_type, p_first_name, p_last_name);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP FUNCTION IF EXISTS deactivate_business_employee(BIGINT, UUID) CASCADE;
CREATE OR REPLACE FUNCTION deactivate_business_employee(p_business_id BIGINT, p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  IF NOT is_business_owner(p_business_id) THEN
    RAISE EXCEPTION 'You are not the owner of business %', p_business_id;
  END IF;

  UPDATE business_employees
  SET is_active = false
  WHERE business_id = p_business_id AND user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP FUNCTION IF EXISTS activate_business_employee(BIGINT, UUID) CASCADE;
CREATE OR REPLACE FUNCTION activate_business_employee(p_business_id BIGINT, p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  IF NOT is_business_owner(p_business_id) THEN
    RAISE EXCEPTION 'You are not the owner of business %', p_business_id;
  END IF;

  UPDATE business_employees
  SET is_active = true
  WHERE business_id = p_business_id AND user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;