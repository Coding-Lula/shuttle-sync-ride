
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Student {
  id: string;
  name: string;
  email: string;
  student_type: string;
  created_at?: string;
}

export interface StudentType {
  id: string;
  type_name: string;
  created_at?: string;
}

export function useStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [studentTypes, setStudentTypes] = useState<StudentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchStudentTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('student_types')
        .select('*')
        .order('type_name', { ascending: true });

      if (error) throw error;
      setStudentTypes(data || []);
    } catch (error) {
      console.error('Error fetching student types:', error);
      toast({
        title: "Error",
        description: "Failed to fetch student types",
        variant: "destructive",
      });
    }
  };

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, student_type, created_at')
        .eq('role', 'student')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStudents((data || []) as Student[]);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: "Error",
        description: "Failed to fetch students",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addStudent = async (studentData: { name: string; email: string; student_type: string; password: string }) => {
    try {
      console.log('Creating student with data:', studentData);
      
      // Check if student with this email already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('email')
        .eq('email', studentData.email)
        .single();

      if (existingUser) {
        toast({
          title: "Error",
          description: "A user with this email address already exists.",
          variant: "destructive",
        });
        return false;
      }
      
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: {
          email: studentData.email,
          password: studentData.password,
          metadata: {
            full_name: studentData.name,
            role: 'student',
            student_type: studentData.student_type
          }
        }
      });

      // Handle edge function errors
      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to create student');
      }

      // Check if the response contains an error
      if (data && data.error) {
        console.error('Response error:', data.error);
        throw new Error(data.error);
      }

      toast({
        title: "Success",
        description: `${studentData.name} has been added successfully.`,
      });

      await fetchStudents();
      return true;
    } catch (error: any) {
      console.error('Error adding student:', error);
      
      // Extract meaningful error message
      let errorMessage = "Failed to add student";
      if (error.message) {
        if (error.message.includes('already been registered')) {
          errorMessage = "A user with this email address already exists.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  };

  const addStudentType = async (typeName: string) => {
    try {
      const { data, error } = await supabase.rpc('add_student_type', {
        p_type_name: typeName
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; message: string };
      
      if (!result.success) {
        throw new Error(result.error || result.message);
      }

      toast({
        title: "Success",
        description: `Student type "${typeName}" has been added successfully.`,
      });

      await fetchStudentTypes();
      return true;
    } catch (error: any) {
      console.error('Error adding student type:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add student type",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateStudentType = async (studentId: string, newType: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ student_type: newType })
        .eq('id', studentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Student type updated successfully.",
      });

      await fetchStudents();
    } catch (error) {
      console.error('Error updating student type:', error);
      toast({
        title: "Error",
        description: "Failed to update student type",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchStudentTypes();
  }, []);

  return {
    students,
    studentTypes,
    isLoading,
    addStudent,
    addStudentType,
    updateStudentType,
    refetch: fetchStudents
  };
}
