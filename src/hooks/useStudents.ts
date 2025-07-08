
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Student {
  id: string;
  name: string;
  email: string;
  student_type: 'community' | 'yoyl';
  created_at?: string;
}

export function useStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, student_type, created_at')
        .eq('role', 'student')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStudents(data || []);
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
      
      const { data, error } = await supabase.rpc('create_user_account', {
        p_email: studentData.email,
        p_password: studentData.password,
        p_name: studentData.name,
        p_role: 'student',
        p_student_type: studentData.student_type
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; message: string };
      
      if (!result.success) {
        throw new Error(result.error || result.message);
      }

      toast({
        title: "Success",
        description: `${studentData.name} has been added successfully.`,
      });

      await fetchStudents();
      return true;
    } catch (error: any) {
      console.error('Error adding student:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add student",
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
  }, []);

  return {
    students,
    isLoading,
    addStudent,
    updateStudentType,
    refetch: fetchStudents
  };
}
