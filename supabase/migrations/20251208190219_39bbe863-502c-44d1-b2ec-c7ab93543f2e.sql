-- Drop existing SELECT policies on profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Gestors can view all profiles" ON public.profiles;

-- Create new secure SELECT policies that explicitly require authentication
-- Users can only view their own profile (requires authenticated user)
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Gestors can view all profiles (requires authenticated user with gestor role)
CREATE POLICY "Gestors can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'gestor'::app_role));