
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Users, Loader2, Plus } from 'lucide-react';
import { useStudents } from '@/hooks/useStudents';

export default function StudentManagement() {
  const { students, studentTypes, isLoading, addStudent, addStudentType, updateStudentType } = useStudents();
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showAddType, setShowAddType] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    student_type: '',
    password: ''
  });

  const handleAddStudent = async () => {
    if (newStudent.name && newStudent.email && newStudent.password && newStudent.student_type) {
      setIsSubmitting(true);
      const success = await addStudent(newStudent);
      if (success) {
        setNewStudent({ name: '', email: '', student_type: '', password: '' });
        setShowAddStudent(false);
      }
      setIsSubmitting(false);
    }
  };

  const handleAddStudentType = async () => {
    if (newTypeName.trim()) {
      setIsSubmitting(true);
      const success = await addStudentType(newTypeName.trim());
      if (success) {
        setNewTypeName('');
        setShowAddType(false);
      }
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="ml-2">Loading students...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Student Management</span>
            </CardTitle>
            <CardDescription>Add, remove, and manage student accounts</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowAddType(!showAddType)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Type
            </Button>
            <Button onClick={() => setShowAddStudent(!showAddStudent)}>
              <UserPlus className="w-4 h-4 mr-2" />
              Add Student
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {showAddType && (
          <div className="mb-6 p-4 border rounded-lg bg-muted">
            <h4 className="font-medium mb-3">Add New Student Type</h4>
            <div className="flex gap-2">
              <Input
                placeholder="Type name (e.g., honors, sports)"
                value={newTypeName}
                onChange={(e) => setNewTypeName(e.target.value)}
              />
              <Button onClick={handleAddStudentType} disabled={isSubmitting || !newTypeName.trim()}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Type'
                )}
              </Button>
              <Button variant="outline" onClick={() => setShowAddType(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {showAddStudent && (
          <div className="mb-6 p-4 border rounded-lg bg-muted">
            <h4 className="font-medium mb-3">Add New Student</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Student Name"
                value={newStudent.name}
                onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
              />
              <Input
                placeholder="Email Address"
                type="email"
                value={newStudent.email}
                onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
              />
              <Input
                placeholder="Password"
                type="password"
                value={newStudent.password}
                onChange={(e) => setNewStudent({...newStudent, password: e.target.value})}
              />
              <Select value={newStudent.student_type} onValueChange={(value) => setNewStudent({...newStudent, student_type: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select student type" />
                </SelectTrigger>
                <SelectContent>
                  {studentTypes.map((type) => (
                    <SelectItem key={type.id} value={type.type_name}>
                      {type.type_name.charAt(0).toUpperCase() + type.type_name.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex space-x-2 mt-4">
              <Button onClick={handleAddStudent} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Student'
                )}
              </Button>
              <Button variant="outline" onClick={() => setShowAddStudent(false)}>Cancel</Button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {students.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No students found. Add your first student above.</p>
          ) : (
            students.map((student) => (
              <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {student.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{student.name}</p>
                    <p className="text-sm text-gray-600">{student.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Select
                    value={student.student_type || ''}
                    onValueChange={(value) => updateStudentType(student.id, value)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {studentTypes.map((type) => (
                        <SelectItem key={type.id} value={type.type_name}>
                          {type.type_name.charAt(0).toUpperCase() + type.type_name.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
