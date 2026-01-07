ALTER TABLE public.pipeline_stages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "business_employees_can_view_pipeline_stages" ON public.pipeline_stages;
CREATE POLICY "business_employees_can_view_pipeline_stages"
ON public.pipeline_stages
FOR SELECT
TO authenticated
USING (is_business_member(business_id));

DROP POLICY IF EXISTS "owners_can_insert_pipeline_stages" ON public.pipeline_stages;
CREATE POLICY "owners_can_insert_pipeline_stages"
ON public.pipeline_stages
FOR INSERT
TO authenticated
WITH CHECK (is_business_owner(business_id));

DROP POLICY IF EXISTS "owners_can_update_pipeline_stages" ON public.pipeline_stages;
CREATE POLICY "owners_can_update_pipeline_stages"
ON public.pipeline_stages
FOR UPDATE
TO authenticated
USING (is_business_owner(business_id))
WITH CHECK (is_business_owner(business_id));

DROP POLICY IF EXISTS "owners_can_delete_pipeline_stages" ON public.pipeline_stages;
CREATE POLICY "owners_can_delete_pipeline_stages"
ON public.pipeline_stages
FOR DELETE
TO authenticated
USING (is_business_owner(business_id));