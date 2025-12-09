-- Drop the overly permissive SELECT policy on clients
DROP POLICY IF EXISTS "Authenticated users can view clients" ON public.clients;

-- Create role-based SELECT policies for clients
-- Gestors can view all clients (they need full visibility for management)
CREATE POLICY "Gestors can view all clients" 
ON public.clients 
FOR SELECT 
USING (has_role(auth.uid(), 'gestor'::app_role));

-- Criadores and designers can view clients they have posts assigned to
CREATE POLICY "Users can view assigned clients" 
ON public.clients 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.posts 
    WHERE posts.client_id = clients.id 
    AND (posts.assigned_to = auth.uid() OR posts.created_by = auth.uid())
  )
);