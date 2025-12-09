-- Drop the overly permissive INSERT policy on posts
DROP POLICY IF EXISTS "Users can create posts" ON public.posts;

-- Create role-based INSERT policies for posts
-- Gestors can create posts for any client
CREATE POLICY "Gestors can create posts for any client" 
ON public.posts 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'gestor'::app_role));

-- Criadores/Designers can only create posts for clients they already have access to
CREATE POLICY "Users can create posts for assigned clients" 
ON public.posts 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.posts existing_posts
    WHERE existing_posts.client_id = client_id 
    AND (existing_posts.assigned_to = auth.uid() OR existing_posts.created_by = auth.uid())
  )
);