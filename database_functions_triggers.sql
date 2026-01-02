-- PostgreSQL Schema Script - Functions and Triggers
-- Generated from supabase.schema.ts
-- This script creates all functions and triggers

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- ============================================
-- USER API KEYS FUNCTIONS
-- ============================================

-- Function: generate_secure_key
-- Generates a secure random key using crypto functions
DROP FUNCTION IF EXISTS generate_secure_key() CASCADE;
CREATE OR REPLACE FUNCTION generate_secure_key()
RETURNS TEXT AS $$
BEGIN
  -- Generate a secure random key using encode and gen_random_bytes
  -- This creates a base64-encoded string from 32 random bytes (256 bits)
  RETURN encode(gen_random_bytes(32), 'base64');
END;
$$ LANGUAGE plpgsql;

-- Function: generate_user_api_keys
-- Generates two API keys for a user if they don't exist
-- This function can be called from the frontend after user registration
-- or automatically via Supabase Database Webhooks
DROP FUNCTION IF EXISTS generate_user_api_keys(UUID) CASCADE;
CREATE OR REPLACE FUNCTION generate_user_api_keys(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  key_count INTEGER;
  new_key TEXT;
BEGIN
  -- Check if user already has keys
  SELECT COUNT(*) INTO key_count
  FROM user_api_keys
  WHERE user_id = p_user_id;
  
  -- Raise exception if user already has keys
  IF key_count > 0 THEN
    RAISE EXCEPTION 'User already has API keys. Cannot generate new keys. Use rotate_user_api_key to rotate an existing key.';
  END IF;
  
  -- Generate first key
  new_key := generate_secure_key();
  INSERT INTO user_api_keys (user_id, key, key_index, is_active)
  VALUES (p_user_id, new_key, 1, true);
  
  -- Generate second key
  new_key := generate_secure_key();
  INSERT INTO user_api_keys (user_id, key, key_index, is_active)
  VALUES (p_user_id, new_key, 2, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: initialize_api_keys
-- Public function that initializes API keys for the current authenticated user
-- This must be called by the user after registration to enable the security layer
-- Returns true if keys were generated, raises exception if user already has keys
DROP FUNCTION IF EXISTS initialize_api_keys() CASCADE;
CREATE OR REPLACE FUNCTION initialize_api_keys()
RETURNS BOOLEAN AS $$
BEGIN
  -- Generate keys for the current authenticated user
  -- This will raise an exception if user already has keys
  PERFORM generate_user_api_keys(auth.uid());
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: prevent_more_than_two_keys
-- Trigger function that prevents inserting more than 2 keys per user
DROP FUNCTION IF EXISTS prevent_more_than_two_keys() CASCADE;
CREATE OR REPLACE FUNCTION prevent_more_than_two_keys()
RETURNS TRIGGER AS $$
DECLARE
  key_count INTEGER;
BEGIN
  -- Count existing keys for this user (before the current insert)
  SELECT COUNT(*) INTO key_count
  FROM user_api_keys
  WHERE user_id = NEW.user_id;
  
  -- Prevent inserting more than 2 keys
  IF key_count >= 2 THEN
    RAISE EXCEPTION 'User already has two API keys. Cannot insert more. Use rotate_user_api_key to rotate an existing key.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: prevent_more_than_two_keys_before_insert
-- Prevents inserting more than 2 keys per user
DROP TRIGGER IF EXISTS prevent_more_than_two_keys_before_insert ON user_api_keys CASCADE;
CREATE TRIGGER prevent_more_than_two_keys_before_insert
BEFORE INSERT ON user_api_keys
FOR EACH ROW
EXECUTE FUNCTION prevent_more_than_two_keys();

-- Function: rotate_user_api_key
-- Rotates one of the user's API keys (key_index 1 or 2)
DROP FUNCTION IF EXISTS rotate_user_api_key(UUID, INTEGER) CASCADE;
CREATE OR REPLACE FUNCTION rotate_user_api_key(p_user_id UUID, p_key_index INTEGER)
RETURNS TEXT AS $$
DECLARE
  new_key TEXT;
  rotated_key_id BIGINT;
BEGIN
  -- Validate key_index
  IF p_key_index NOT IN (1, 2) THEN
    RAISE EXCEPTION 'key_index must be 1 or 2';
  END IF;
  
  -- Validate that the user owns this key
  IF NOT EXISTS (
    SELECT 1 FROM user_api_keys
    WHERE user_id = p_user_id AND key_index = p_key_index
  ) THEN
    RAISE EXCEPTION 'User does not have a key with index %', p_key_index;
  END IF;
  
  -- Generate new key
  new_key := generate_secure_key();
  
  -- Update the key
  UPDATE user_api_keys
  SET 
    key = new_key,
    last_rotated_at = NOW()
  WHERE user_id = p_user_id AND key_index = p_key_index
  RETURNING id INTO rotated_key_id;
  
  IF rotated_key_id IS NULL THEN
    RAISE EXCEPTION 'Failed to rotate key';
  END IF;
  
  RETURN new_key;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: set_business_owner
-- Automatically sets the owner_id to the current authenticated user
DROP FUNCTION IF EXISTS set_business_owner() CASCADE;
CREATE OR REPLACE FUNCTION set_business_owner()
RETURNS trigger AS $$
BEGIN
  NEW.owner_id := auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: business_owner_before_insert
-- Executes before insert to set owner_id automatically
DROP TRIGGER IF EXISTS business_owner_before_insert ON businesses CASCADE;
CREATE OR REPLACE TRIGGER business_owner_before_insert
BEFORE INSERT ON businesses
FOR EACH ROW
EXECUTE FUNCTION set_business_owner();

-- Function: validate_user_business_access
-- Validates that the user has access to a business (is the owner)
DROP FUNCTION IF EXISTS validate_user_business_access(BIGINT) CASCADE;
CREATE OR REPLACE FUNCTION validate_user_business_access(p_business_id BIGINT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM businesses
    WHERE id = p_business_id
      AND owner_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: validate_pipeline_stage_business_access
-- Validates that business_id is provided and user has access to it
DROP FUNCTION IF EXISTS validate_pipeline_stage_business_access() CASCADE;
CREATE OR REPLACE FUNCTION validate_pipeline_stage_business_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Verify that business_id is provided
  IF NEW.business_id IS NULL THEN
    RAISE EXCEPTION 'business_id is required';
  END IF;
  
  -- Verify that the user has access to this business
  IF NOT validate_user_business_access(NEW.business_id) THEN
    RAISE EXCEPTION 'User does not have access to business with ID %', NEW.business_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: validate_pipeline_stage_business_before_insert
-- Validates business_id before inserting a pipeline stage
DROP TRIGGER IF EXISTS validate_pipeline_stage_business_before_insert ON pipeline_stages CASCADE;
CREATE TRIGGER validate_pipeline_stage_business_before_insert
BEFORE INSERT ON pipeline_stages
FOR EACH ROW
EXECUTE FUNCTION validate_pipeline_stage_business_access();

-- Function: validate_pipeline_stage_deal_business_access
-- Validates that business_id is provided and user has access to it
DROP FUNCTION IF EXISTS validate_pipeline_stage_deal_business_access() CASCADE;
CREATE OR REPLACE FUNCTION validate_pipeline_stage_deal_business_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Verify that business_id is provided
  IF NEW.business_id IS NULL THEN
    RAISE EXCEPTION 'business_id is required';
  END IF;
  
  -- Verify that the user has access to this business
  IF AUTH.UID() IS NOT NULL THEN
    IF NOT validate_user_business_access(NEW.business_id) THEN
        RAISE EXCEPTION 'User does not have access to business with ID %', NEW.business_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: validate_pipeline_stage_deal_business_before_insert
-- Validates business_id before inserting a pipeline stage deal
DROP TRIGGER IF EXISTS validate_pipeline_stage_deal_business_before_insert ON pipeline_stage_deals CASCADE;
CREATE TRIGGER validate_pipeline_stage_deal_business_before_insert
BEFORE INSERT ON pipeline_stage_deals
FOR EACH ROW
EXECUTE FUNCTION validate_pipeline_stage_deal_business_access();

-- Function: validate_product_category_business_access
-- Validates that business_id is provided and user has access to it
DROP FUNCTION IF EXISTS validate_product_category_business_access() CASCADE;
CREATE OR REPLACE FUNCTION validate_product_category_business_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Verify that business_id is provided
  IF NEW.business_id IS NULL THEN
    RAISE EXCEPTION 'business_id is required';
  END IF;
  
  -- Verify that the user has access to this business
  IF NOT validate_user_business_access(NEW.business_id) THEN
    RAISE EXCEPTION 'User does not have access to business with ID %', NEW.business_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: validate_product_category_business_before_insert
-- Validates business_id before inserting a product category
DROP TRIGGER IF EXISTS validate_product_category_business_before_insert ON product_categories CASCADE;
CREATE TRIGGER validate_product_category_business_before_insert
BEFORE INSERT ON product_categories
FOR EACH ROW
EXECUTE FUNCTION validate_product_category_business_access();

-- Function: validate_product_business_access
-- Validates that business_id is provided and user has access to it
DROP FUNCTION IF EXISTS validate_product_business_access() CASCADE;
CREATE OR REPLACE FUNCTION validate_product_business_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Verify that business_id is provided
  IF NEW.business_id IS NULL THEN
    RAISE EXCEPTION 'business_id is required';
  END IF;
  
  -- Verify that the user has access to this business
  IF NOT validate_user_business_access(NEW.business_id) THEN
    RAISE EXCEPTION 'User does not have access to business with ID %', NEW.business_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: validate_product_business_before_insert
-- Validates business_id before inserting a product
DROP TRIGGER IF EXISTS validate_product_business_before_insert ON products CASCADE;
CREATE TRIGGER validate_product_business_before_insert
BEFORE INSERT ON products
FOR EACH ROW
EXECUTE FUNCTION validate_product_business_access();

-- Function: validate_sale_business_access
-- Validates that business_id is provided and user has access to it
DROP FUNCTION IF EXISTS validate_sale_business_access() CASCADE;
CREATE OR REPLACE FUNCTION validate_sale_business_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Verify that business_id is provided
  IF NEW.business_id IS NULL THEN
    RAISE EXCEPTION 'business_id is required';
  END IF;
  
  -- Verify that the user has access to this business
  IF NOT validate_user_business_access(NEW.business_id) THEN
    RAISE EXCEPTION 'User does not have access to business with ID %', NEW.business_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: validate_sale_business_before_insert
-- Validates business_id before inserting a sale
DROP TRIGGER IF EXISTS validate_sale_business_before_insert ON sales CASCADE;
CREATE TRIGGER validate_sale_business_before_insert
BEFORE INSERT ON sales
FOR EACH ROW
EXECUTE FUNCTION validate_sale_business_access();

-- ============================================
-- PRODUCT STOCK FUNCTIONS
-- ============================================

-- Drop old views if they exist (replaced by functions)
DROP VIEW IF EXISTS products_low_stock CASCADE;
DROP VIEW IF EXISTS products_low_stock_total CASCADE;
DROP VIEW IF EXISTS products_out_of_stock CASCADE;
DROP VIEW IF EXISTS products_out_of_stock_total CASCADE;

-- Function: get_products_low_stock
-- Returns products with low stock for a specific business (validates user access)
DROP FUNCTION IF EXISTS get_products_low_stock(BIGINT) CASCADE;
CREATE OR REPLACE FUNCTION get_products_low_stock(p_business_id BIGINT)
RETURNS TABLE (
  id BIGINT,
  business_id BIGINT,
  name TEXT,
  sku TEXT,
  price NUMERIC,
  stock INTEGER,
  minimum_stock INTEGER,
  is_active BOOLEAN,
  product_category_id BIGINT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  -- Validate that the user has access to this business
  IF NOT validate_user_business_access(p_business_id) THEN
    RAISE EXCEPTION 'User does not have access to business with ID %', p_business_id;
  END IF;
  
  RETURN QUERY
  SELECT
    p.id,
    p.business_id,
    p.name,
    p.sku,
    p.price,
    p.stock,
    p.minimum_stock,
    p.is_active,
    p.product_category_id,
    p.created_at
  FROM products p
  WHERE p.business_id = p_business_id
    AND p.minimum_stock IS NOT NULL
    AND p.minimum_stock > 0
    AND p.stock > 1
    AND p.stock < p.minimum_stock;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: get_products_low_stock_total
-- Returns count of products with low stock for a specific business (validates user access)
DROP FUNCTION IF EXISTS get_products_low_stock_total(BIGINT) CASCADE;
CREATE OR REPLACE FUNCTION get_products_low_stock_total(p_business_id BIGINT)
RETURNS BIGINT AS $$
DECLARE
  v_count BIGINT;
BEGIN
  -- Validate that the user has access to this business
  IF NOT validate_user_business_access(p_business_id) THEN
    RAISE EXCEPTION 'User does not have access to business with ID %', p_business_id;
  END IF;
  
  SELECT COUNT(*) INTO v_count
  FROM products
  WHERE business_id = p_business_id
    AND minimum_stock IS NOT NULL
    AND minimum_stock > 0
    AND stock > 1
    AND stock < minimum_stock;
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: get_products_out_of_stock
-- Returns products out of stock for a specific business (validates user access)
DROP FUNCTION IF EXISTS get_products_out_of_stock(BIGINT) CASCADE;
CREATE OR REPLACE FUNCTION get_products_out_of_stock(p_business_id BIGINT)
RETURNS TABLE (
  id BIGINT,
  business_id BIGINT,
  name TEXT,
  sku TEXT,
  price NUMERIC,
  stock INTEGER,
  minimum_stock INTEGER,
  is_active BOOLEAN,
  product_category_id BIGINT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  -- Validate that the user has access to this business
  IF NOT validate_user_business_access(p_business_id) THEN
    RAISE EXCEPTION 'User does not have access to business with ID %', p_business_id;
  END IF;
  
  RETURN QUERY
  SELECT
    p.id,
    p.business_id,
    p.name,
    p.sku,
    p.price,
    p.stock,
    p.minimum_stock,
    p.is_active,
    p.product_category_id,
    p.created_at
  FROM products p
  WHERE p.business_id = p_business_id
    AND p.stock = 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: get_products_out_of_stock_total
-- Returns count of products out of stock for a specific business (validates user access)
DROP FUNCTION IF EXISTS get_products_out_of_stock_total(BIGINT) CASCADE;
CREATE OR REPLACE FUNCTION get_products_out_of_stock_total(p_business_id BIGINT)
RETURNS BIGINT AS $$
DECLARE
  v_count BIGINT;
BEGIN
  -- Validate that the user has access to this business
  IF NOT validate_user_business_access(p_business_id) THEN
    RAISE EXCEPTION 'User does not have access to business with ID %', p_business_id;
  END IF;
  
  SELECT COUNT(*) INTO v_count
  FROM products
  WHERE business_id = p_business_id
    AND stock = 0;
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- BUSINESS LOGIC FUNCTIONS
-- ============================================

-- Function: process_sale
DROP FUNCTION IF EXISTS process_sale(BIGINT, jsonb, NUMERIC) CASCADE;
CREATE OR REPLACE FUNCTION process_sale(p_business_id BIGINT, cart_items jsonb, applied_tax NUMERIC)
RETURNS TABLE (
  order_number BIGINT,
  subtotal NUMERIC,
  applied_tax_result NUMERIC,
  total NUMERIC
) AS $$
DECLARE
  calculated_subtotal NUMERIC;
  calculated_total NUMERIC;
  new_order_number BIGINT;
  new_sale_id BIGINT;
  cart_item jsonb;
  current_stock INTEGER;
  requested_quantity INTEGER;
BEGIN
  -- VALIDAR DISPONIBILIDAD DE STOCK ANTES DE PROCESAR
  FOR cart_item IN SELECT * FROM jsonb_array_elements(cart_items)
  LOOP
    requested_quantity := (cart_item->>'quantity')::integer;
    
    -- Obtener el stock actual del producto
    SELECT stock INTO current_stock
    FROM products
    WHERE id = (cart_item->>'product_id')::bigint;
    
    -- Validar que hay suficiente stock
    IF current_stock IS NULL THEN
      RAISE EXCEPTION 'Product with ID % not found', cart_item->>'product_id';
    END IF;
    
    IF requested_quantity > current_stock THEN
      RAISE EXCEPTION 'Insufficient stock for product %. Available: %, Requested: %', 
        cart_item->>'name', current_stock, requested_quantity;
    END IF;
  END LOOP;
  
  -- Calcular el subtotal
  SELECT 
    SUM((item->>'price')::numeric * (item->>'quantity')::numeric)
  INTO calculated_subtotal
  FROM jsonb_array_elements(cart_items) AS item;
  
  -- Calcular el total con impuesto
  calculated_subtotal := ROUND(calculated_subtotal, 2);
  calculated_total := ROUND(calculated_subtotal * (1 + applied_tax / 100), 2);
  
  -- Obtener el siguiente order_number para este business
  SELECT COALESCE(MAX(sales.order_number), 0) + 1
  INTO new_order_number
  FROM sales
  WHERE sales.business_id = p_business_id;
  
  -- Insertar en la tabla sales y obtener el id
  INSERT INTO sales (business_id, order_number, subtotal, applied_tax, total)
  VALUES (p_business_id, new_order_number, calculated_subtotal, applied_tax, calculated_total)
  RETURNING id INTO new_sale_id;
  
  -- Recorrer cada item del carrito e insertar en product_snapshots
  FOR cart_item IN SELECT * FROM jsonb_array_elements(cart_items)
  LOOP
    INSERT INTO product_snapshots (name, price, sku, quantity, sale_id, product_id, business_id)
    VALUES (
      (cart_item->>'name')::text,
      (cart_item->>'price')::text,
      (cart_item->>'sku')::text,
      (cart_item->>'quantity')::integer,
      (new_sale_id)::bigint,
      (cart_item->>'product_id')::bigint,
      (p_business_id)::bigint
    );
  END LOOP;
  
  -- ACTUALIZAR STOCK: Restar las cantidades vendidas
  FOR cart_item IN SELECT * FROM jsonb_array_elements(cart_items)
  LOOP
    UPDATE products
    SET stock = stock - (cart_item->>'quantity')::integer
    WHERE id = (cart_item->>'product_id')::bigint;
  END LOOP;
  
  -- Retornar los valores
  RETURN QUERY
  SELECT 
    new_order_number,
    calculated_subtotal,
    applied_tax,
    calculated_total;
END;
$$ LANGUAGE plpgsql;

