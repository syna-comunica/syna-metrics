-- Drop the overly permissive SELECT policy on posts
DROP POLICY IF EXISTS "Authenticated users can view posts" ON public.posts;

-- Create role-based SELECT policies for posts
-- Gestors can view all posts (they need full visibility for management and approvals)
CREATE POLICY "Gestors can view all posts" 
ON public.posts 
FOR SELECT 
USING (has_role(auth.uid(), 'gestor'::app_role));

-- Users can view posts they created or are assigned to
CREATE POLICY "Users can view their own posts" 
ON public.posts 
FOR SELECT 
USING (
  created_by = auth.uid() OR assigned_to = auth.uid()
);