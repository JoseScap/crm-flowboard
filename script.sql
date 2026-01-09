DO $$
DECLARE
  v_business_id int := 9;
  v_category_one_id int := 7;
  v_category_two_id int := 8;
  v_category_three_id int := 9;
  v_category_four_id int := 10;
BEGIN
  FOR i IN 1..20 LOOP
    -- Category One
    INSERT INTO products("name", sku, price, stock, minimum_stock, product_category_id, business_id) 
    VALUES('ELEC-' || i, 'ELEC-' || i, 10000, 50, 10, v_category_one_id, v_business_id);
    
    -- Category Two
    INSERT INTO products("name", sku, price, stock, minimum_stock, product_category_id, business_id) 
    VALUES('CERA-' || i, 'CERA-' || i, 10000, 50, 10, v_category_two_id, v_business_id);
    
    -- Category Three
    INSERT INTO products("name", sku, price, stock, minimum_stock, product_category_id, business_id) 
    VALUES('PINT-' || i, 'PINT-' || i, 10000, 50, 10, v_category_three_id, v_business_id);
    
    -- Category Four
    INSERT INTO products("name", sku, price, stock, minimum_stock, product_category_id, business_id) 
    VALUES('HERR-' || i, 'HERR-' || i, 10000, 50, 10, v_category_four_id, v_business_id);
  END LOOP;
END $$;