-- Function to process a new sale in a single transaction with stock validation
DROP FUNCTION IF EXISTS process_new_sale(
  p_business_id BIGINT,
  p_business_employee_id BIGINT,
  p_lead_id BIGINT,
  p_subtotal NUMERIC,
  p_applied_tax NUMERIC,
  p_total NUMERIC,
  p_items JSONB
) CASCADE;

CREATE OR REPLACE FUNCTION process_new_sale(
  p_business_id BIGINT,
  p_business_employee_id BIGINT,
  p_lead_id BIGINT,
  p_subtotal NUMERIC,
  p_applied_tax NUMERIC,
  p_total NUMERIC,
  p_items JSONB
)
RETURNS BIGINT AS $$
DECLARE
  v_sale_id BIGINT;
  v_next_order_number INT;
  v_item JSONB;
  v_current_stock INT;
BEGIN
  -- 1. Get next order number for this business automatically
  SELECT COALESCE(MAX(order_number), 0) + 1 
  INTO v_next_order_number 
  FROM sales 
  WHERE business_id = p_business_id;

  -- 2. Create the sale record
  INSERT INTO sales (
    business_id, 
    business_employee_id, 
    lead_id,
    order_number, 
    subtotal, 
    applied_tax, 
    total, 
    is_open, 
    is_active
  )
  VALUES (
    p_business_id, 
    p_business_employee_id, 
    p_lead_id,
    v_next_order_number, 
    p_subtotal, 
    p_applied_tax, 
    p_total, 
    false, 
    true
  )
  RETURNING id INTO v_sale_id;

  -- 3. Process each item from the JSONB array
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    -- 3a. Validate stock availability before proceeding
    SELECT stock INTO v_current_stock 
    FROM products 
    WHERE id = (v_item->>'product_id')::BIGINT;

    IF v_current_stock < (v_item->>'quantity')::INT THEN
      RAISE EXCEPTION 'Insufficient stock for product % (SKU: %). Available: %, Requested: %', 
        v_item->>'name', 
        v_item->>'sku', 
        v_current_stock, 
        (v_item->>'quantity')::INT;
    END IF;

    -- 3b. Create product snapshot for the sale
    INSERT INTO sale_items (
      business_id,
      sale_id,
      product_id,
      name,
      sku,
      price,
      quantity,
      is_active
    )
    VALUES (
      p_business_id,
      v_sale_id,
      (v_item->>'product_id')::BIGINT,
      v_item->>'name',
      v_item->>'sku',
      v_item->>'price'::NUMERIC,
      (v_item->>'quantity')::INT,
      true
    );

    -- 3c. Update current product stock levels
    UPDATE products 
    SET stock = stock - (v_item->>'quantity')::INT 
    WHERE id = (v_item->>'product_id')::BIGINT;
  END LOOP;

  -- 4. If lead_id is provided, mark the lead as revenue
  IF p_lead_id IS NOT NULL THEN
    UPDATE pipeline_stage_leads
    SET is_revenue = true, closed_at = NOW(), "value" = p_total
    WHERE id = p_lead_id AND business_id = p_business_id;
  END IF;

  -- Return the ID of the created sale
  RETURN v_sale_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;