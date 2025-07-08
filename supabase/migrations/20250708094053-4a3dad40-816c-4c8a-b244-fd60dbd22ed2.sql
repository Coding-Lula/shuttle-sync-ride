
-- Add a rates table for trip rate management
CREATE TABLE public.rates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rate_per_km NUMERIC NOT NULL DEFAULT 6.00,
  currency TEXT NOT NULL DEFAULT 'ZAR',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Insert the default rate
INSERT INTO public.rates (rate_per_km, currency, is_active) 
VALUES (6.00, 'ZAR', true);

-- Enable RLS on rates table
ALTER TABLE public.rates ENABLE ROW LEVEL SECURITY;

-- Create policy for viewing rates (everyone can view)
CREATE POLICY "Anyone can view rates" 
  ON public.rates 
  FOR SELECT 
  USING (true);

-- Create policy for modifying rates (only managers)
CREATE POLICY "Only managers can modify rates" 
  ON public.rates 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'manager'
  ));

-- Create a function to handle new user creation with proper user_id
CREATE OR REPLACE FUNCTION public.create_user_account(
  p_email TEXT,
  p_password TEXT,
  p_name TEXT,
  p_role TEXT,
  p_student_type TEXT DEFAULT NULL,
  p_start_location TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id UUID;
  auth_user_data JSON;
BEGIN
  -- Create auth user
  SELECT auth.create_user(
    p_email,
    p_password,
    JSON_BUILD_OBJECT(
      'name', p_name,
      'role', p_role,
      'student_type', p_student_type,
      'start_location', p_start_location
    )
  ) INTO auth_user_data;
  
  -- Extract user ID from auth response
  new_user_id := (auth_user_data->>'id')::UUID;
  
  -- Insert into users table
  INSERT INTO public.users (
    id, email, name, role, student_type, start_location
  ) VALUES (
    new_user_id, p_email, p_name, p_role, p_student_type, p_start_location
  );
  
  -- Create initial credits record for students
  IF p_role = 'student' THEN
    INSERT INTO public.credits (user_id, balance)
    VALUES (new_user_id, 0.00);
  END IF;
  
  RETURN JSON_BUILD_OBJECT(
    'success', true,
    'user_id', new_user_id,
    'message', 'User created successfully'
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN JSON_BUILD_OBJECT(
    'success', false,
    'error', SQLERRM,
    'message', 'Failed to create user'
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_user_account TO authenticated;
