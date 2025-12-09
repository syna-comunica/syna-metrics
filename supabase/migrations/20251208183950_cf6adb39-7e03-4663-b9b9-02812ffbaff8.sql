-- The profiles table has RESTRICTIVE policies but needs a base PERMISSIVE policy
-- Drop existing SELECT policies and recreate as PERMISSIVE with proper authentication

DROP POLICY IF EXISTS "Gestors can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Recreate as PERMISSIVE policies (default) with authentication required
-- Users can view their own profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Gestors can view all profiles
CREATE POLICY "Gestors can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'gestor'::app_role));