ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_can_view_businesses_they_are_members_of" ON public.businesses;
CREATE POLICY "users_can_view_businesses_they_are_members_of"
ON public.businesses
FOR SELECT
TO authenticated
USING (is_business_member(id) OR is_business_owner(id));

DROP POLICY IF EXISTS "deny_insert_for_any_business" ON public.businesses;
CREATE POLICY "deny_insert_for_any_business"
ON public.businesses
FOR INSERT
TO authenticated
WITH CHECK (false);

DROP POLICY IF EXISTS "owners_can_update_its_own_business" ON public.businesses;
CREATE POLICY "owners_can_update_its_own_business"
ON public.businesses
FOR UPDATE
TO authenticated
USING (is_business_owner(id))
WITH CHECK (is_business_owner(id));

DROP POLICY IF EXISTS "deny_delete_for_any_business" ON public.businesses;
CREATE POLICY "deny_delete_for_any_business"
ON public.businesses
FOR DELETE
TO authenticated
USING (false);