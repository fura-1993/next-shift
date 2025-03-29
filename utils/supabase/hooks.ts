import { useCallback, useEffect, useState } from 'react';
import { createClient } from './client';
import { format } from 'date-fns';
import { Database } from '@/lib/schema';

// Define types based on our schema
type ShiftRow = Database['public']['Tables']['shifts']['Row'];
type EmployeeRow = Database['public']['Tables']['employees']['Row'];

// Define a type for shift data
export type ShiftData = {
  [key: string]: string;
};

// Define a type for employee data
export type Employee = {
  id: number;
  name: string;
  givenName?: string;
};

// Map database employee to application employee
const mapDbEmployeeToEmployee = (dbEmployee: EmployeeRow): Employee => ({
  id: dbEmployee.id,
  name: dbEmployee.name,
  givenName: dbEmployee.given_name || undefined,
});

// Custom hook for shift operations
export function useShifts() {
  const [shifts, setShifts] = useState<ShiftData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createClient();

  // Fetch shifts from Supabase
  const fetchShifts = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('shifts')
        .select('*');
      
      if (error) throw error;
      
      // Convert array of shift objects to our key-value format
      const formattedShifts: ShiftData = {};
      data?.forEach(shift => {
        const key = `${shift.employee_id}-${shift.date}`;
        formattedShifts[key] = shift.shift_code;
      });
      
      setShifts(formattedShifts);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred while fetching shifts'));
      console.error('Error fetching shifts:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // Update a single shift
  const updateShift = useCallback(async (employeeId: number, date: Date, shiftCode: string) => {
    try {
      const dateString = format(date, 'yyyy-MM-dd');
      const key = `${employeeId}-${dateString}`;
      
      // Optimistically update the UI
      setShifts(prev => ({
        ...prev,
        [key]: shiftCode
      }));
      
      // Then update the database
      const { error } = await supabase
        .from('shifts')
        .upsert(
          { 
            employee_id: employeeId, 
            date: dateString, 
            shift_code: shiftCode 
          },
          { 
            onConflict: 'employee_id,date', 
            ignoreDuplicates: false
          }
        );
      
      if (error) throw error;
      
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update shift'));
      console.error('Error updating shift:', err);
      
      // Revert the optimistic update if there was an error
      await fetchShifts();
    }
  }, [supabase, fetchShifts]);

  // Delete all shifts
  const deleteAllShifts = useCallback(async () => {
    try {
      setLoading(true);
      
      // First, get all shift IDs
      const { data: shifts, error: fetchError } = await supabase
        .from('shifts')
        .select('id');
      
      if (fetchError) throw fetchError;
      
      if (shifts && shifts.length > 0) {
        // Then delete them
        const { error: deleteError } = await supabase
          .from('shifts')
          .delete()
          .in('id', shifts.map(s => s.id));
        
        if (deleteError) throw deleteError;
      }
      
      setShifts({});
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete all shifts'));
      console.error('Error deleting shifts:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // Initial fetch
  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);

  return {
    shifts,
    loading,
    error,
    updateShift,
    fetchShifts,
    deleteAllShifts
  };
}

// Custom hook for employee operations
export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createClient();

  // Fetch employees from Supabase
  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('id', { ascending: true });
      
      if (error) throw error;
      
      // Map database employees to application employees
      const mappedEmployees = (data || []).map(mapDbEmployeeToEmployee);
      setEmployees(mappedEmployees);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred while fetching employees'));
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // Add a new employee
  const addEmployee = useCallback(async (employee: Omit<Employee, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .insert({ name: employee.name, given_name: employee.givenName || null })
        .select()
        .single();
      
      if (error) throw error;
      
      const newEmployee = mapDbEmployeeToEmployee(data);
      setEmployees(prev => [...prev, newEmployee]);
      return newEmployee;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to add employee'));
      console.error('Error adding employee:', err);
      throw err;
    }
  }, [supabase]);

  // Update an employee
  const updateEmployee = useCallback(async (employee: Employee) => {
    try {
      const { error } = await supabase
        .from('employees')
        .update({ name: employee.name, given_name: employee.givenName || null })
        .eq('id', employee.id);
      
      if (error) throw error;
      
      setEmployees(prev => prev.map(emp => 
        emp.id === employee.id ? employee : emp
      ));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update employee'));
      console.error('Error updating employee:', err);
    }
  }, [supabase]);

  // Initial fetch
  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  return {
    employees,
    loading,
    error,
    fetchEmployees,
    addEmployee,
    updateEmployee
  };
} 