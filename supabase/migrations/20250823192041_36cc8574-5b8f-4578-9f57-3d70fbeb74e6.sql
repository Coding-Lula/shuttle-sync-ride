-- Drop the problematic policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Managers and seniors can view all users" ON public.users;
DROP POLICY IF EXISTS "Students can view student names" ON public.users;
DROP POLICY IF EXISTS "Drivers can view student info" ON public.users;

-- Create security definer function to get user role safely
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create new policies using the security definer function
-- Users can view their own profile
CREATE POLICY "Users can view own profile" 
ON public.users 
FOR SELECT 
USING (auth.uid() = id);

-- Managers and seniors can view all users
CREATE POLICY "Managers and seniors can view all users" 
ON public.users 
FOR SELECT 
USING (public.get_current_user_role() IN ('manager', 'senior'));

-- Students can view basic info of other students (for trip reports)
CREATE POLICY "Students can view student names" 
ON public.users 
FOR SELECT 
USING (
  role = 'student' 
  AND public.get_current_user_role() = 'student'
);

-- Drivers can view student info for their trips
CREATE POLICY "Drivers can view student info" 
ON public.users 
FOR SELECT 
USING (
  role = 'student' 
  AND public.get_current_user_role() = 'driver'
);