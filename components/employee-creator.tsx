'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { useState } from 'react';

interface EmployeeCreatorProps {
  onClose: () => void;
  onAdd: (employee: { name: string; givenName?: string }) => void;
}

export function EmployeeCreator({ onClose, onAdd }: EmployeeCreatorProps) {
  const [newEmployee, setNewEmployee] = useState({ name: '', givenName: '' });
  const [open, setOpen] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      name: newEmployee.name,
      givenName: newEmployee.givenName || undefined
    });
    setNewEmployee({ name: '', givenName: '' });
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
          <DialogTitle className="text-sm">新規担当者追加</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label htmlFor="name" className="text-xs">姓</Label>
            <Input
              id="name"
              value={newEmployee.name}
              onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
              className="h-8 text-sm"
              required
              maxLength={10}
              placeholder="例: 山田"
            />
          </div>
          <div>
            <Label htmlFor="givenName" className="text-xs">名 (省略可)</Label>
            <Input
              id="givenName"
              value={newEmployee.givenName}
              onChange={(e) => setNewEmployee({ ...newEmployee, givenName: e.target.value })}
              className="h-8 text-sm"
              maxLength={10}
              placeholder="例: 太郎"
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
              追加
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}