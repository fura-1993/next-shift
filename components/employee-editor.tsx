'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';

interface Employee {
  id: number;
  name: string;
  givenName?: string;
}

interface EmployeeEditorProps {
  employee: Employee;
  onClose: () => void;
  onUpdate: (updatedEmployee: Employee) => void;
}

export function EmployeeEditor({ employee, onClose, onUpdate }: EmployeeEditorProps) {
  const [editedEmployee, setEditedEmployee] = useState<Employee>(employee);
  const [open, setOpen] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(editedEmployee);
  };

  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[280px] shadow-[0_20px_70px_-15px_rgba(0,0,0,0.3)] border-white/20 bg-white/95 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="text-sm">担当者編集</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label htmlFor="name" className="text-xs">姓</Label>
            <Input
              id="name"
              value={editedEmployee.name}
              onChange={(e) => setEditedEmployee({ ...editedEmployee, name: e.target.value })}
              className="h-8 text-sm"
              required
            />
          </div>
          <div>
            <Label htmlFor="givenName" className="text-xs">名</Label>
            <Input
              id="givenName"
              value={editedEmployee.givenName || ''}
              onChange={(e) => setEditedEmployee({ ...editedEmployee, givenName: e.target.value || undefined })}
              className="h-8 text-sm"
            />
          </div>
          <div className="flex justify-end gap-1.5 pt-1">
            <Button 
              type="button"
              className="h-7 px-2.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-800"
              onClick={onClose}
            >
              キャンセル
            </Button>
            <Button 
              type="submit"
              className="h-7 px-2.5 text-xs bg-blue-500 hover:bg-blue-600 text-white"
            >
              保存
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}