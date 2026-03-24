import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import type { Consultant } from '@/app/types/consultant';

interface ConsultantModalProps {
  isOpen: boolean;
  onClose: () => void;
  consultant?: Consultant | null;
  onSave: (consultant: Omit<Consultant, 'id' | 'availability' | 'avatar'>) => void;
  onDelete?: () => void;
}

export function ConsultantModal({ isOpen, onClose, consultant, onSave, onDelete }: ConsultantModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    if (consultant && isOpen) {
      setFormData({
        name: consultant.name,
        specialization: consultant.specialization,
        email: consultant.email,
        phone: consultant.phone,
      });
      return;
    }

    if (!isOpen || !consultant) {
      setFormData({
        name: '',
        specialization: '',
        email: '',
        phone: '',
      });
    }
  }, [consultant, isOpen]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleDelete = () => {
    if (!onDelete) return;
    onDelete();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{consultant ? 'Edit Consultant' : 'Add Consultant'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="consultantName">Consultant Name</Label>
            <Input
              id="consultantName"
              value={formData.name}
              onChange={(event) => setFormData({ ...formData, name: event.target.value })}
              placeholder="Enter consultant name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialization">Specialization</Label>
            <Input
              id="specialization"
              value={formData.specialization}
              onChange={(event) => setFormData({ ...formData, specialization: event.target.value })}
              placeholder="Enter specialization"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(event) => setFormData({ ...formData, email: event.target.value })}
              placeholder="Enter email"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(event) => setFormData({ ...formData, phone: event.target.value })}
              placeholder="Enter phone number"
              required
            />
          </div>

          <div className="flex justify-between gap-2 pt-4">
            <div>
              {consultant && onDelete && (
                <Button type="button" variant="destructive" onClick={handleDelete}>
                  Delete
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
