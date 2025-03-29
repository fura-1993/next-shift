'use client';

import { useState } from 'react';
import { addMonths, subMonths, format, getDate, getDay, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { ja } from 'date-fns/locale';
import holidays from '@holiday-jp/holiday_jp';
import { ShiftHeader } from './shift-header';
import { ShiftLegend } from './shift-legend';
import { ShiftCell } from './shift-cell';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { useShiftTypes } from '@/contexts/shift-types-context';
import { Trash2, UserCog, Loader2 } from 'lucide-react';
import { EmployeeCreator } from './employee-creator';
import { EmployeeEditor } from './employee-editor';
import { useShifts, useEmployees } from '@/utils/supabase/hooks';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

// Fallback employees for initial rendering
const initialEmployees = [
  { id: 1, name: '橋本' },
  { id: 2, name: '棟方' },
  { id: 3, name: '薄田' },
  { id: 4, name: '小林', givenName: '広睴' },
  { id: 5, name: '梶' },
  { id: 6, name: '寺田' },
  { id: 7, name: '山崎' },
  { id: 8, name: '小林', givenName: '利治' },
];

export function ShiftGrid() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 2)); // 2025年3月
  const [selectedEmployee, setSelectedEmployee] = useState<typeof initialEmployees[0] | null>(null);
  const [isCreatingEmployee, setIsCreatingEmployee] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  // Use custom hooks for Supabase integration
  const { shifts, loading: shiftsLoading, error: shiftsError, updateShift, deleteAllShifts } = useShifts();
  const { employees, loading: employeesLoading, error: employeesError, updateEmployee, addEmployee } = useEmployees();
  
  const { getUpdatedShiftCode } = useShiftTypes();

  const days = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const handleShiftChange = (employeeId: number, date: Date, newShift: string) => {
    updateShift(employeeId, date, newShift);
  };

  const getShiftValue = (employeeId: number, date: Date) => {
    const key = `${employeeId}-${format(date, 'yyyy-MM-dd')}`;
    const shift = shifts[key];
    return shift ? getUpdatedShiftCode(shift) : '−';
  };

  const isWeekend = (date: Date) => {
    const day = getDay(date);
    return day === 0;
  };

  const isSaturday = (date: Date) => getDay(date) === 6;

  const handleDeleteAllShifts = () => {
    deleteAllShifts();
  };

  const handleEmployeeUpdate = (updatedEmployee: typeof initialEmployees[0]) => {
    updateEmployee(updatedEmployee);
    setSelectedEmployee(null);
  };

  const handleAddEmployee = (newEmployee: { name: string; givenName?: string }) => {
    addEmployee(newEmployee)
      .then(() => {
        setIsCreatingEmployee(false);
      });
  };

  // Show loading state
  if (employeesLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-gray-400" />
        <p className="mt-4 text-gray-600">従業員データを読み込み中...</p>
      </div>
    );
  }

  // Show error state
  if (shiftsError || employeesError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h3 className="text-red-800 font-medium text-lg">エラーが発生しました</h3>
          <p className="text-red-600 mt-2">
            {shiftsError?.message || employeesError?.message || '不明なエラーが発生しました。'}
          </p>
          <button 
            className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-md transition-colors"
            onClick={() => window.location.reload()}
          >
            再読み込み
          </button>
        </div>
      </div>
    );
  }

  // Use data from Supabase if available, otherwise fall back to initial data
  const displayEmployees = employees.length > 0 ? employees : initialEmployees;

  return (
    <div className="min-h-screen pb-20">
      <ShiftHeader
        currentDate={currentDate}
        shifts={shifts}
        employees={displayEmployees}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
      />
      <ShiftLegend />
      <div className="overflow-x-auto">
        <table className="w-full border-collapse [&_td]:border-black/60 [&_th]:border-black/60 [&_td]:border-[1px] [&_th]:border-[1px] rounded-2xl overflow-hidden">
          <thead>
            <tr className="bg-gradient-to-b from-gray-50/95 to-gray-50/90">
              <th className="px-2 py-3 sticky left-0 bg-gradient-to-b from-gray-50/95 to-gray-50/90 z-10 w-[50px] min-w-[50px] first:rounded-tl-2xl">
                担当
              </th>
              {days.map((date, index) => (
                <th
                  key={date.toString()}
                  className={cn(
                    "p-2 min-w-[40px] relative",
                    index === days.length - 1 && "rounded-tr-2xl",
                    holidays.isHoliday(date) ? "text-red-500" : "",
                    isSaturday(date) ? "text-blue-500" : "",
                    isWeekend(date) ? "text-red-500" : "",
                  )}
                >
                  <div className="text-sm">{format(date, 'd')}</div>
                  <div className="text-xs">({format(date, 'E', { locale: ja })})</div>
                  {holidays.isHoliday(date) && (
                    <div className="text-[8px] text-red-500 leading-tight mt-0.5">
                      {holidays.between(date, date)[0]?.name}
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayEmployees.map((employee, index) => (
              <tr 
                key={employee.id}
                className={index % 2 === 0 ? 'bg-white' : 'bg-slate-100'}
              >
                <td 
                  className={cn(
                    "sticky left-0 z-10 font-medium text-sm whitespace-nowrap p-0",
                    index % 2 === 0 ? 'bg-white' : 'bg-slate-100'
                  )}
                >
                  <div 
                    className={cn(
                      "employee-icon group flex items-center justify-center h-[36px] mx-auto cursor-pointer rounded-2xl w-[62px] whitespace-nowrap overflow-hidden",
                      index % 2 === 0 && [
                        'bg-gradient-to-b from-white to-gray-50',
                        'border border-black/15',
                        'shadow-[0_2px_4px_rgba(0,0,0,0.05),0_4px_8px_-2px_rgba(0,0,0,0.1)]',
                        'hover:shadow-[0_4px_8px_rgba(0,0,0,0.1),0_8px_16px_-4px_rgba(0,0,0,0.15)]',
                        'hover:border-black/20',
                        'transform-gpu hover:translate-y-[-2px] hover:scale-[1.02]',
                        'transition-all duration-300 ease-out'
                      ],
                      index % 2 !== 0 && [
                        'bg-gradient-to-b from-gray-900 to-black',
                        'shadow-[0_2px_4px_rgba(0,0,0,0.2)]',
                        'hover:shadow-[0_4px_8px_rgba(0,0,0,0.25)]',
                        'transform-gpu hover:translate-y-[-2px] hover:scale-[1.02]',
                        'transition-all duration-300 ease-out'
                      ]
                    )}
                    onClick={() => setSelectedEmployee(employee)}
                  >
                    <div className="flex items-center justify-center gap-0.5">
                      <span 
                        className={cn(
                          "font-extrabold tracking-tight text-[15px] whitespace-nowrap",
                          index % 2 === 0 ? 'text-black' : 'text-white'
                        )}
                        data-text={employee.name}
                      >
                        {employee.name}
                      </span>
                      {employee.givenName && (
                        <span className={cn(
                          "text-[11px] font-extrabold tracking-wide whitespace-nowrap",
                          index % 2 === 0 ? 'text-black/70' : 'text-white/70'
                        )}>
                          {employee.givenName[0]}
                        </span>
                      )}
                      <UserCog 
                        className={cn(
                          "w-3.5 h-3.5 ml-0.5 opacity-0 transition-all duration-300 group-hover:opacity-100 transform group-hover:scale-110",
                          index % 2 === 0 ? 'text-black/60' : 'text-white/70'
                        )}
                      />
                    </div>
                  </div>
                </td>
                {days.map((date) => {
                  const shift = getShiftValue(employee.id, date);
                  return (
                    <td 
                      key={date.toString()} 
                      className={cn(
                        "p-0",
                        index === displayEmployees.length - 1 && date === days[0] && "rounded-bl-2xl",
                        index === displayEmployees.length - 1 && date === days[days.length - 1] && "rounded-br-2xl",
                        index % 2 === 0 ? 'bg-white' : 'bg-slate-100',
                        shiftsLoading && "animate-pulse"
                      )}
                    >
                      {shiftsLoading ? (
                        <div className="h-[40px] w-full bg-slate-200 opacity-40"></div>
                      ) : (
                        <ShiftCell
                          shift={shift}
                          employeeId={employee.id}
                          date={date}
                          rowType={index % 2 === 0 ? 'even' : 'odd'}
                          onShiftChange={handleShiftChange}
                        />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="my-8 flex justify-center space-x-4">
        <button
          onClick={() => setIsCreatingEmployee(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          新しい従業員を追加
        </button>
        
        <button
          onClick={() => setIsConfirmDeleteOpen(true)}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors flex items-center"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          すべてのシフトを削除
        </button>

        {isConfirmDeleteOpen && (
          <Dialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>シフトデータを削除</DialogTitle>
                <DialogDescription>
                  この操作はすべてのシフトデータを削除します。この操作は元に戻せません。
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex justify-end gap-2 mt-4">
                <Button
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800"
                  onClick={() => setIsConfirmDeleteOpen(false)}
                >
                  キャンセル
                </Button>
                <Button
                  className="bg-red-500 hover:bg-red-600 text-white"
                  onClick={() => {
                    handleDeleteAllShifts();
                    setIsConfirmDeleteOpen(false);
                  }}
                >
                  削除する
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {selectedEmployee && (
        <EmployeeEditor
          employee={selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
          onUpdate={handleEmployeeUpdate}
        />
      )}

      {isCreatingEmployee && (
        <EmployeeCreator
          onClose={() => setIsCreatingEmployee(false)}
          onAdd={handleAddEmployee}
        />
      )}
    </div>
  );
}