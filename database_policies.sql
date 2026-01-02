-- PostgreSQL Schema Script - Row Level Security Policies
-- Generated from supabase.schema.ts
-- This script creates all RLS policies
-- Note: Tables must be created first (database_tables.sql) and RLS must be enabled

-- ============================================
-- RLS POLICIES
-- ============================================

-- ============================================
-- POLICIES FOR: user_api_keys
-- ============================================

-- Policy: select_own_api_keys
-- Users can only select their own API keys
DROP POLICY IF EXISTS select_own_api_keys ON user_api_keys;
CREATE POLICY select_own_api_keys
ON user_api_keys
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Policy: deny_insert_api_keys
-- Users cannot insert API keys directly (deny all insert operations)
-- Keys must be generated using generate_user_api_keys function
DROP POLICY IF EXISTS deny_insert_api_keys ON user_api_keys;
CREATE POLICY deny_insert_api_keys
ON user_api_keys
FOR INSERT
TO authenticated
WITH CHECK (false);

-- Policy: deny_update_api_keys
-- Users cannot update API keys directly (deny all update operations)
-- Keys must be rotated using rotate_user_api_key function
DROP POLICY IF EXISTS deny_update_api_keys ON user_api_keys;
CREATE POLICY deny_update_api_keys
ON user_api_keys
FOR UPDATE
TO authenticated
USING (false);

-- Policy: deny_delete_api_keys
-- Users cannot delete API keys (deny all delete operations)
-- Keys can only be rotated, not deleted
DROP POLICY IF EXISTS deny_delete_api_keys ON user_api_keys;
CREATE POLICY deny_delete_api_keys
ON user_api_keys
FOR DELETE
TO authenticated
USING (false);

-- ============================================
-- POLICIES FOR: businesses
-- ============================================

-- Policy: insert_business_requires_auth
-- Users can only insert businesses if they are authenticated
DROP POLICY IF EXISTS insert_business_requires_auth ON businesses;
CREATE POLICY insert_business_requires_auth
ON businesses
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- Policy: select_own_businesses
-- Users can only select their own businesses
DROP POLICY IF EXISTS select_own_businesses ON businesses;
CREATE POLICY select_own_businesses
ON businesses
FOR SELECT
TO authenticated
USING (owner_id = auth.uid());

-- Policy: update_own_businesses
-- Users can only update their own businesses
DROP POLICY IF EXISTS update_own_businesses ON businesses;
CREATE POLICY update_own_businesses
ON businesses
FOR UPDATE
TO authenticated
USING (owner_id = auth.uid());

-- Policy: deny_delete_businesses
-- Users cannot delete businesses (deny all delete operations)
DROP POLICY IF EXISTS deny_delete_businesses ON businesses;
CREATE POLICY deny_delete_businesses
ON businesses
FOR DELETE
TO authenticated
USING (false);

-- ============================================
-- POLICIES FOR: pipelines
-- ============================================

-- Policy: select_pipelines_from_own_businesses
-- Users can only select pipelines from businesses they own
DROP POLICY IF EXISTS select_pipelines_from_own_businesses ON pipelines;
CREATE POLICY select_pipelines_from_own_businesses
ON pipelines
FOR SELECT
TO authenticated
USING (
  business_id IN (
    SELECT id FROM businesses WHERE owner_id = auth.uid()
  )
);

-- Policy: insert_pipelines_in_own_businesses
-- Users can only insert pipelines in businesses they own
DROP POLICY IF EXISTS insert_pipelines_in_own_businesses ON pipelines;
CREATE POLICY insert_pipelines_in_own_businesses
ON pipelines
FOR INSERT
TO authenticated
WITH CHECK (
  business_id IN (
    SELECT id FROM businesses WHERE owner_id = auth.uid()
  )
);

-- Policy: update_pipelines_in_own_businesses
-- Users can only update pipelines in businesses they own
DROP POLICY IF EXISTS update_pipelines_in_own_businesses ON pipelines;
CREATE POLICY update_pipelines_in_own_businesses
ON pipelines
FOR UPDATE
TO authenticated
USING (
  business_id IN (
    SELECT id FROM businesses WHERE owner_id = auth.uid()
  )
)
WITH CHECK (
  business_id IN (
    SELECT id FROM businesses WHERE owner_id = auth.uid()
  )
);

-- Policy: delete_pipelines_in_own_businesses
-- Users can only delete pipelines in businesses they own
DROP POLICY IF EXISTS delete_pipelines_in_own_businesses ON pipelines;
CREATE POLICY delete_pipelines_in_own_businesses
ON pipelines
FOR DELETE
TO authenticated
USING (
  business_id IN (
    SELECT id FROM businesses WHERE owner_id = auth.uid()
  )
);

-- ============================================
-- POLICIES FOR: pipeline_stages
-- ============================================

-- Policy: select_pipeline_stages_from_own_businesses
-- Users can only select pipeline stages from businesses they own
DROP POLICY IF EXISTS select_pipeline_stages_from_own_businesses ON pipeline_stages;
CREATE POLICY select_pipeline_stages_from_own_businesses
ON pipeline_stages
FOR SELECT
TO authenticated
USING (
  business_id IN (
    SELECT id FROM businesses WHERE owner_id = auth.uid()
  )
);

-- Policy: insert_pipeline_stages_in_own_businesses
-- Users can only insert pipeline stages in businesses they own (validated by trigger)
DROP POLICY IF EXISTS insert_pipeline_stages_in_own_businesses ON pipeline_stages;
CREATE POLICY insert_pipeline_stages_in_own_businesses
ON pipeline_stages
FOR INSERT
TO authenticated
WITH CHECK (
  business_id IN (
    SELECT id FROM businesses WHERE owner_id = auth.uid()
  )
);

-- Policy: update_pipeline_stages_in_own_businesses
-- Users can only update pipeline stages in businesses they own
DROP POLICY IF EXISTS update_pipeline_stages_in_own_businesses ON pipeline_stages;
CREATE POLICY update_pipeline_stages_in_own_businesses
ON pipeline_stages
FOR UPDATE
TO authenticated
USING (
  business_id IN (
    SELECT id FROM businesses WHERE owner_id = auth.uid()
  )
)
WITH CHECK (
  business_id IN (
    SELECT id FROM businesses WHERE owner_id = auth.uid()
  )
);

-- Policy: delete_pipeline_stages_in_own_businesses
-- Users can only delete pipeline stages in businesses they own
DROP POLICY IF EXISTS delete_pipeline_stages_in_own_businesses ON pipeline_stages;
CREATE POLICY delete_pipeline_stages_in_own_businesses
ON pipeline_stages
FOR DELETE
TO authenticated
USING (
  business_id IN (
    SELECT id FROM businesses WHERE owner_id = auth.uid()
  )
);

-- ============================================
-- POLICIES FOR: pipeline_stage_deals
-- ============================================

-- Policy: select_pipeline_stage_deals_from_own_businesses
-- Users can only select pipeline stage deals from businesses they own
DROP POLICY IF EXISTS select_pipeline_stage_deals_from_own_businesses ON pipeline_stage_deals;
CREATE POLICY select_pipeline_stage_deals_from_own_businesses
ON pipeline_stage_deals
FOR SELECT
TO authenticated
USING (
  business_id IN (
    SELECT id FROM businesses WHERE owner_id = auth.uid()
  )
);

-- Policy: insert_pipeline_stage_deals_in_own_businesses
-- Users can only insert pipeline stage deals in businesses they own (validated by trigger)
DROP POLICY IF EXISTS insert_pipeline_stage_deals_in_own_businesses ON pipeline_stage_deals;
CREATE POLICY insert_pipeline_stage_deals_in_own_businesses
ON pipeline_stage_deals
FOR INSERT
TO authenticated
WITH CHECK (
  business_id IN (
    SELECT id FROM businesses WHERE owner_id = auth.uid()
  )
);

-- Policy: update_pipeline_stage_deals_in_own_businesses
-- Users can only update pipeline stage deals in businesses they own
DROP POLICY IF EXISTS update_pipeline_stage_deals_in_own_businesses ON pipeline_stage_deals;
CREATE POLICY update_pipeline_stage_deals_in_own_businesses
ON pipeline_stage_deals
FOR UPDATE
TO authenticated
USING (
  business_id IN (
    SELECT id FROM businesses WHERE owner_id = auth.uid()
  )
)
WITH CHECK (
  business_id IN (
    SELECT id FROM businesses WHERE owner_id = auth.uid()
  )
);

-- Policy: delete_pipeline_stage_deals_in_own_businesses
-- Users can only delete pipeline stage deals in businesses they own
DROP POLICY IF EXISTS delete_pipeline_stage_deals_in_own_businesses ON pipeline_stage_deals;
CREATE POLICY delete_pipeline_stage_deals_in_own_businesses
ON pipeline_stage_deals
FOR DELETE
TO authenticated
USING (
  business_id IN (
    SELECT id FROM businesses WHERE owner_id = auth.uid()
  )
);

-- ============================================
-- POLICIES FOR: product_categories
-- ============================================

-- Policy: select_product_categories_from_own_businesses
-- Users can only select product categories from businesses they own
DROP POLICY IF EXISTS select_product_categories_from_own_businesses ON product_categories;
CREATE POLICY select_product_categories_from_own_businesses
ON product_categories
FOR SELECT
TO authenticated
USING (
  business_id IN (
    SELECT id FROM businesses WHERE owner_id = auth.uid()
  )
);

-- Policy: insert_product_categories_in_own_businesses
-- Users can only insert product categories in businesses they own (validated by trigger)
DROP POLICY IF EXISTS insert_product_categories_in_own_businesses ON product_categories;
CREATE POLICY insert_product_categories_in_own_businesses
ON product_categories
FOR INSERT
TO authenticated
WITH CHECK (
  business_id IN (
    SELECT id FROM businesses WHERE owner_id = auth.uid()
  )
);

-- Policy: update_product_categories_in_own_businesses
-- Users can only update product categories in businesses they own
DROP POLICY IF EXISTS update_product_categories_in_own_businesses ON product_categories;
CREATE POLICY update_product_categories_in_own_businesses
ON product_categories
FOR UPDATE
TO authenticated
USING (
  business_id IN (
    SELECT id FROM businesses WHERE owner_id = auth.uid()
  )
)
WITH CHECK (
  business_id IN (
    SELECT id FROM businesses WHERE owner_id = auth.uid()
  )
);

-- Policy: deny_delete_product_categories
-- Users cannot delete product categories (deny all delete operations)
DROP POLICY IF EXISTS deny_delete_product_categories ON product_categories;
CREATE POLICY deny_delete_product_categories
ON product_categories
FOR DELETE
TO authenticated
USING (false);

-- ============================================
-- POLICIES FOR: products
-- ============================================

-- Policy: select_products_from_own_businesses
-- Users can only select products from businesses they own
DROP POLICY IF EXISTS select_products_from_own_businesses ON products;
CREATE POLICY select_products_from_own_businesses
ON products
FOR SELECT
TO authenticated
USING (
  business_id IN (
    SELECT id FROM businesses WHERE owner_id = auth.uid()
  )
);

-- Policy: insert_products_in_own_businesses
-- Users can only insert products in businesses they own (validated by trigger)
DROP POLICY IF EXISTS insert_products_in_own_businesses ON products;
CREATE POLICY insert_products_in_own_businesses
ON products
FOR INSERT
TO authenticated
WITH CHECK (
  business_id IN (
    SELECT id FROM businesses WHERE owner_id = auth.uid()
  )
);

-- Policy: update_products_in_own_businesses
-- Users can only update products in businesses they own
DROP POLICY IF EXISTS update_products_in_own_businesses ON products;
CREATE POLICY update_products_in_own_businesses
ON products
FOR UPDATE
TO authenticated
USING (
  business_id IN (
    SELECT id FROM businesses WHERE owner_id = auth.uid()
  )
)
WITH CHECK (
  business_id IN (
    SELECT id FROM businesses WHERE owner_id = auth.uid()
  )
);

-- Policy: deny_delete_products
-- Users cannot delete products (deny all delete operations)
DROP POLICY IF EXISTS deny_delete_products ON products;
CREATE POLICY deny_delete_products
ON products
FOR DELETE
TO authenticated
USING (false);

-- ============================================
-- POLICIES FOR: sales
-- ============================================

-- Policy: select_sales_from_own_businesses
-- Users can only select sales from businesses they own
DROP POLICY IF EXISTS select_sales_from_own_businesses ON sales;
CREATE POLICY select_sales_from_own_businesses
ON sales
FOR SELECT
TO authenticated
USING (
  business_id IN (
    SELECT id FROM businesses WHERE owner_id = auth.uid()
  )
);

-- Policy: insert_sales_in_own_businesses
-- Users can only insert sales in businesses they own (validated by trigger)
DROP POLICY IF EXISTS insert_sales_in_own_businesses ON sales;
CREATE POLICY insert_sales_in_own_businesses
ON sales
FOR INSERT
TO authenticated
WITH CHECK (
  business_id IN (
    SELECT id FROM businesses WHERE owner_id = auth.uid()
  )
);

-- Policy: update_sales_in_own_businesses
-- Users can only update sales in businesses they own
DROP POLICY IF EXISTS update_sales_in_own_businesses ON sales;
CREATE POLICY update_sales_in_own_businesses
ON sales
FOR UPDATE
TO authenticated
USING (
  business_id IN (
    SELECT id FROM businesses WHERE owner_id = auth.uid()
  )
)
WITH CHECK (
  business_id IN (
    SELECT id FROM businesses WHERE owner_id = auth.uid()
  )
);

-- Policy: deny_delete_sales
-- Users cannot delete sales (deny all delete operations)
DROP POLICY IF EXISTS deny_delete_sales ON sales;
CREATE POLICY deny_delete_sales
ON sales
FOR DELETE
TO authenticated
USING (false);

-- ============================================
-- POLICIES FOR: product_snapshots
-- ============================================

-- Policy: select_product_snapshots_from_own_businesses
-- Users can only select product snapshots from businesses they own
DROP POLICY IF EXISTS select_product_snapshots_from_own_businesses ON product_snapshots;
CREATE POLICY select_product_snapshots_from_own_businesses
ON product_snapshots
FOR SELECT
TO authenticated
USING (
  business_id IN (
    SELECT id FROM businesses WHERE owner_id = auth.uid()
  )
);

-- Policy: insert_product_snapshots_for_own_sales
-- Users can only insert product snapshots in businesses they own
-- This is typically done through the process_sale function which validates business access
DROP POLICY IF EXISTS insert_product_snapshots_for_own_sales ON product_snapshots;
CREATE POLICY insert_product_snapshots_for_own_sales
ON product_snapshots
FOR INSERT
TO authenticated
WITH CHECK (
  business_id IN (
    SELECT id FROM businesses WHERE owner_id = auth.uid()
  )
);

-- Policy: update_product_snapshots_in_own_businesses
-- Users can only update product snapshots in businesses they own
DROP POLICY IF EXISTS update_product_snapshots_in_own_businesses ON product_snapshots;
CREATE POLICY update_product_snapshots_in_own_businesses
ON product_snapshots
FOR UPDATE
TO authenticated
USING (
  business_id IN (
    SELECT id FROM businesses WHERE owner_id = auth.uid()
  )
)
WITH CHECK (
  business_id IN (
    SELECT id FROM businesses WHERE owner_id = auth.uid()
  )
);

-- Policy: deny_delete_product_snapshots
-- Users cannot delete product snapshots (deny all delete operations)
DROP POLICY IF EXISTS deny_delete_product_snapshots ON product_snapshots;
CREATE POLICY deny_delete_product_snapshots
ON product_snapshots
FOR DELETE
TO authenticated
USING (false);

