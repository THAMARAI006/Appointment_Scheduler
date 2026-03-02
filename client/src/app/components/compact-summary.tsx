import { CalendarDays, Clock, CheckCircle, UserCheck } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import type { Appointment } from './appointment-card';
import type { Consultant } from '@/app/types/consultant';

interface CompactSummaryProps {
  appointments: Appointment[];
  consultants: Consultant[];
  nextAppointment: Appointment | null;
  nextConsultant: Consultant | undefined;
  onViewAppointment: (appointment: Appointment) => void;
  kpis?: {
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
    upcoming: number;
  };
}

const statusColors = {
  Pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  Confirmed: 'bg-blue-100 text-blue-700 border-blue-300',
  Completed: 'bg-green-100 text-green-700 border-green-300',
};

export function CompactSummary({
  appointments,
  consultants,
  nextAppointment,
  nextConsultant,
  onViewAppointment,
  kpis,
}: CompactSummaryProps) {
  const today = new Date().toISOString().split('T')[0];

  const pendingCount = kpis?.pending ?? appointments.filter((a) => a.status === 'Pending').length;
  const confirmedCount = kpis?.confirmed ?? appointments.filter((a) => a.status === 'Confirmed').length;
  const completedCount = kpis?.completed ?? appointments.filter((a) => a.status === 'Completed').length;
  const todayCount = kpis?.upcoming ?? appointments.filter((a) => a.date === today).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
      {/* Today's Appointments */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl p-4 text-white shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-xs font-medium mb-1">Today</p>
            <p className="text-3xl font-bold">{todayCount}</p>
          </div>
          <CalendarDays className="w-8 h-8 opacity-80" />
        </div>
      </div>

      {/* Pending */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-yellow-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-600 text-xs font-medium mb-1">Pending</p>
            <p className="text-3xl font-bold text-yellow-500">{pendingCount}</p>
          </div>
          <Clock className="w-8 h-8 text-yellow-400 opacity-80" />
        </div>
      </div>

      {/* Confirmed */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-600 text-xs font-medium mb-1">Confirmed</p>
            <p className="text-3xl font-bold text-blue-500">{confirmedCount}</p>
          </div>
          <CheckCircle className="w-8 h-8 text-blue-400 opacity-80" />
        </div>
      </div>

      {/* Completed */}
      <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl p-4 text-white shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-orange-100 text-xs font-medium mb-1">Completed</p>
            <p className="text-3xl font-bold">{completedCount}</p>
          </div>
          <UserCheck className="w-8 h-8 opacity-80" />
        </div>
      </div>
    </div>
  );
}