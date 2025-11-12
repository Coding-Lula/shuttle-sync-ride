-- Create student_types table to store valid student types
CREATE TABLE IF NOT EXISTS public.student_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type_name text UNIQUE NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.student_types ENABLE ROW LEVEL SECURITY;

-- Anyone can view student types
CREATE POLICY "Anyone can view student types"
ON public.student_types
FOR SELECT
USING (true);

-- Only managers can insert student types
CREATE POLICY "Only managers can insert student types"
ON public.student_types
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'manager'
  )
);

-- Insert existing student types
INSERT INTO public.student_types (type_name) 
VALUES ('community'), ('yoyl')
ON CONFLICT (type_name) DO NOTHING;

-- Drop the old check constraint if it exists
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_student_type_check;

-- Add a foreign key-like validation using a trigger instead of CHECK constraint
CREATE OR REPLACE FUNCTION validate_student_type()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.student_type IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.student_types WHERE type_name = NEW.student_type
  ) THEN
    RAISE EXCEPTION 'Invalid student type: %', NEW.student_type;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_student_type_trigger
BEFORE INSERT OR UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION validate_student_type();

-- Create function to add new student type
CREATE OR REPLACE FUNCTION public.add_student_type(p_type_name text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_type_id uuid;
BEGIN
  -- Check if user is a manager
  IF NOT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'manager'
  ) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Only managers can add student types'
    );
  END IF;

  -- Insert the new student type
  INSERT INTO public.student_types (type_name, created_by)
  VALUES (LOWER(TRIM(p_type_name)), auth.uid())
  RETURNING id INTO new_type_id;

  RETURN json_build_object(
    'success', true,
    'id', new_type_id,
    'message', 'Student type added successfully'
  );

EXCEPTION 
  WHEN unique_violation THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Student type already exists'
    );
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;