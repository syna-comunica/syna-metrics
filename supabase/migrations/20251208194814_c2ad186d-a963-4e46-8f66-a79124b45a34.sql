-- Block anonymous access on all sensitive tables
-- This ensures that even if RLS is somehow bypassed, anonymous users cannot access data

-- Block anonymous access on clients table
CREATE POLICY "Block anonymous access to clients" 
ON public.clients 
FOR ALL 
TO anon 
USING (false);

-- Block anonymous access on posts table
CREATE POLICY "Block anonymous access to posts" 
ON public.posts 
FOR ALL 
TO anon 
USING (false);

-- Block anonymous access on profiles table
CREATE POLICY "Block anonymous access to profiles" 
ON public.profiles 
FOR ALL 
TO anon 
USING (false);

-- Block anonymous access on user_roles table
CREATE POLICY "Block anonymous access to user_roles" 
ON public.user_roles 
FOR ALL 
TO anon 
USING (false);