-- Fix the circular reference bug in posts INSERT policy
-- The current policy checks existing_posts.client_id = existing_posts.client_id (always true)
-- This allows any authenticated user to create posts for ANY client with existing posts

-- Drop the broken policies
DROP POLICY IF EXISTS "Users can create posts for assigned clients" ON public.posts;

-- Create a proper INSERT policy for non-gestors:
-- They can only create posts for clients where they already have an assignment
CREATE POLICY "Users can create posts for assigned clients" 
ON public.posts 
FOR INSERT 
WITH CHECK (
  -- Gestors are handled by their own policy
  -- Non-gestors can only insert posts for clients where they have existing posts assigned to them
  EXISTS (
    SELECT 1
    FROM posts existing_posts
    WHERE existing_posts.client_id = posts.client_id
      AND (existing_posts.assigned_to = auth.uid() OR existing_posts.created_by = auth.uid())
  )
);