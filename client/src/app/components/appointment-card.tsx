import { Clock, User } from 'lucide-react';

export interface Appointment {
  id: string;
  customerName: string;
  consultantId: string;
  date: string; // ISO date string
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  status: 'Pending' | 'Confirmed' | 'Completed';
}

interface AppointmentCardProps {
  appointment: Appointment;
  consultantName?: string;
  onClick: () => void;
}

const statusColors = {
  Pending: 'bg-yellow-50 border-yellow-400 text-yellow-900 hover:bg-yellow-100',
  Confirmed: 'bg-blue-50 border-blue-400 text-blue-900 hover:bg-blue-100',
  Completed: 'bg-green-50 border-green-400 text-green-900 hover:bg-green-100',
};

export function AppointmentCard({ appointment, consultantName, onClick }: AppointmentCardProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full p-3 rounded-lg border-l-4 text-left transition-all shadow-sm ${
        statusColors[appointment.status]
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <User className="w-4 h-4 flex-shrink-0" />
            <span className="font-medium truncate">{appointment.customerName}</span>
          </div>
          {consultantName && (
            <div className="text-xs opacity-70 mb-1 truncate">
              with {consultantName}
            </div>
          )}
          <div className="flex items-center gap-2 text-sm opacity-80">
            <Clock className="w-3 h-3 flex-shrink-0" />
            <span>
              {appointment.startTime} - {appointment.endTime}
            </span>
          </div>
        </div>
        <div className="text-xs font-semibold px-2 py-1 rounded bg-white/50">
          {appointment.status}
        </div>
      </div>
    </button>
  );
}