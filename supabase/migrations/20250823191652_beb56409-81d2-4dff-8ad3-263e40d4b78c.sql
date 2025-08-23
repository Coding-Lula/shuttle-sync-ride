-- Drop the overly permissive policy that allows viewing all users
DROP POLICY IF EXISTS "Users can view all users" ON public.users;

-- Create more secure policies
-- Users can view their own profile
CREATE POLICY "Users can view own profile" 
ON public.users 
FOR SELECT 
USING (auth.uid() = id);

-- Managers and seniors can view all users (for admin functions)
CREATE POLICY "Managers and seniors can view all users" 
ON public.users 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role IN ('manager', 'senior')
  )
);

-- Students can view basic info of other students (for trip reports and similar features)
CREATE POLICY "Students can view student names" 
ON public.users 
FOR SELECT 
USING (
  role = 'student' 
  AND EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'student'
  )
);

-- Drivers can view student info for their trips
CREATE POLICY "Drivers can view student info" 
ON public.users 
FOR SELECT 
USING (
  role = 'student' 
  AND EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'driver'
  )
);