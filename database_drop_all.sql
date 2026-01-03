-- PostgreSQL Schema Script - Drop All Objects
-- This script drops all policies, triggers, functions, views, and tables
-- Use this script to quickly clean the database during schema development
-- WARNING: This will delete all data and schema objects!

-- ============================================
-- DROP POLICIES
-- ============================================

-- Policies for: user_api_keys
DROP POLICY IF EXISTS select_own_api_keys ON user_api_keys;
DROP POLICY IF EXISTS deny_insert_api_keys ON user_api_keys;
DROP POLICY IF EXISTS deny_update_api_keys ON user_api_keys;
DROP POLICY IF EXISTS deny_delete_api_keys ON user_api_keys;

-- Policies for: businesses
DROP POLICY IF EXISTS insert_business_requires_auth ON businesses;
DROP POLICY IF EXISTS select_own_businesses ON businesses;
DROP POLICY IF EXISTS update_own_businesses ON businesses;
DROP POLICY IF EXISTS deny_delete_businesses ON businesses;

-- Policies for: pipelines
DROP POLICY IF EXISTS select_pipelines_from_own_businesses ON pipelines;
DROP POLICY IF EXISTS insert_pipelines_in_own_businesses ON pipelines;
DROP POLICY IF EXISTS update_pipelines_in_own_businesses ON pipelines;
DROP POLICY IF EXISTS delete_pipelines_in_own_businesses ON pipelines;

-- Policies for: pipeline_stages
DROP POLICY IF EXISTS select_pipeline_stages_from_own_businesses ON pipeline_stages;
DROP POLICY IF EXISTS insert_pipeline_stages_in_own_businesses ON pipeline_stages;
DROP POLICY IF EXISTS update_pipeline_stages_in_own_businesses ON pipeline_stages;
DROP POLICY IF EXISTS delete_pipeline_stages_in_own_businesses ON pipeline_stages;

-- Policies for: pipeline_stage_deals
DROP POLICY IF EXISTS select_pipeline_stage_deals_from_own_businesses ON pipeline_stage_deals;
DROP POLICY IF EXISTS insert_pipeline_stage_deals_in_own_businesses ON pipeline_stage_deals;
DROP POLICY IF EXISTS update_pipeline_stage_deals_in_own_businesses ON pipeline_stage_deals;
DROP POLICY IF EXISTS delete_pipeline_stage_deals_in_own_businesses ON pipeline_stage_deals;

-- Policies for: product_categories
DROP POLICY IF EXISTS select_product_categories_from_own_businesses ON product_categories;
DROP POLICY IF EXISTS insert_product_categories_in_own_businesses ON product_categories;
DROP POLICY IF EXISTS update_product_categories_in_own_businesses ON product_categories;
DROP POLICY IF EXISTS deny_delete_product_categories ON product_categories;

-- Policies for: products
DROP POLICY IF EXISTS select_products_from_own_businesses ON products;
DROP POLICY IF EXISTS insert_products_in_own_businesses ON products;
DROP POLICY IF EXISTS update_products_in_own_businesses ON products;
DROP POLICY IF EXISTS deny_delete_products ON products;

-- Policies for: sales
DROP POLICY IF EXISTS select_sales_from_own_businesses ON sales;
DROP POLICY IF EXISTS insert_sales_in_own_businesses ON sales;
DROP POLICY IF EXISTS update_sales_in_own_businesses ON sales;
DROP POLICY IF EXISTS deny_delete_sales ON sales;

-- Policies for: product_snapshots
DROP POLICY IF EXISTS select_product_snapshots_from_own_businesses ON product_snapshots;
DROP POLICY IF EXISTS insert_product_snapshots_for_own_sales ON product_snapshots;
DROP POLICY IF EXISTS update_product_snapshots_in_own_businesses ON product_snapshots;
DROP POLICY IF EXISTS deny_delete_product_snapshots ON product_snapshots;

-- ============================================
-- DROP TRIGGERS
-- ============================================

-- Triggers for: user_api_keys
DROP TRIGGER IF EXISTS prevent_more_than_two_keys_before_insert ON user_api_keys CASCADE;

-- Triggers for: businesses
DROP TRIGGER IF EXISTS business_owner_before_insert ON businesses CASCADE;

-- Triggers for: pipeline_stages
DROP TRIGGER IF EXISTS validate_pipeline_stage_business_before_insert ON pipeline_stages CASCADE;

-- Triggers for: pipeline_stage_deals
DROP TRIGGER IF EXISTS validate_pipeline_stage_deal_business_before_insert ON pipeline_stage_deals CASCADE;

-- Triggers for: product_categories
DROP TRIGGER IF EXISTS validate_product_category_business_before_insert ON product_categories CASCADE;

-- Triggers for: products
DROP TRIGGER IF EXISTS validate_product_business_before_insert ON products CASCADE;

-- Triggers for: sales
DROP TRIGGER IF EXISTS validate_sale_business_before_insert ON sales CASCADE;
DROP TRIGGER IF EXISTS set_sale_order_number_before_insert ON sales CASCADE;

-- ============================================
-- DROP FUNCTIONS
-- ============================================

-- User API Keys Functions
DROP FUNCTION IF EXISTS generate_secure_key() CASCADE;
DROP FUNCTION IF EXISTS generate_user_api_keys(UUID) CASCADE;
DROP FUNCTION IF EXISTS initialize_api_keys() CASCADE;
DROP FUNCTION IF EXISTS prevent_more_than_two_keys() CASCADE;
DROP FUNCTION IF EXISTS rotate_user_api_key(UUID, INTEGER) CASCADE;

-- Business Functions
DROP FUNCTION IF EXISTS set_business_owner() CASCADE;
DROP FUNCTION IF EXISTS validate_user_business_access(BIGINT) CASCADE;

-- Validation Functions
DROP FUNCTION IF EXISTS validate_pipeline_stage_business_access() CASCADE;
DROP FUNCTION IF EXISTS validate_pipeline_stage_deal_business_access() CASCADE;
DROP FUNCTION IF EXISTS validate_product_category_business_access() CASCADE;
DROP FUNCTION IF EXISTS validate_product_business_access() CASCADE;
DROP FUNCTION IF EXISTS validate_sale_business_access() CASCADE;

-- Sales Functions
DROP FUNCTION IF EXISTS set_sale_order_number() CASCADE;

-- Product Stock Functions
DROP FUNCTION IF EXISTS get_products_low_stock(BIGINT) CASCADE;
DROP FUNCTION IF EXISTS get_products_low_stock_total(BIGINT) CASCADE;
DROP FUNCTION IF EXISTS get_products_out_of_stock(BIGINT) CASCADE;
DROP FUNCTION IF EXISTS get_products_out_of_stock_total(BIGINT) CASCADE;

-- Business Logic Functions
DROP FUNCTION IF EXISTS process_sale(BIGINT, jsonb, NUMERIC) CASCADE;

-- ============================================
-- DROP VIEWS
-- ============================================

DROP VIEW IF EXISTS products_low_stock CASCADE;
DROP VIEW IF EXISTS products_low_stock_total CASCADE;
DROP VIEW IF EXISTS products_out_of_stock CASCADE;
DROP VIEW IF EXISTS products_out_of_stock_total CASCADE;

-- ============================================
-- DROP TABLES (in reverse dependency order)
-- ============================================

-- Drop tables that have foreign key dependencies first
DROP TABLE IF EXISTS product_snapshots CASCADE;
DROP TABLE IF EXISTS sales CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS product_categories CASCADE;
DROP TABLE IF EXISTS pipeline_stage_deals CASCADE;
DROP TABLE IF EXISTS pipeline_stages CASCADE;
DROP TABLE IF EXISTS pipelines CASCADE;
DROP TABLE IF EXISTS businesses CASCADE;
DROP TABLE IF EXISTS user_api_keys CASCADE;

