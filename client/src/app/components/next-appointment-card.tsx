import { Clock, User, Calendar, ChevronRight } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import type { Appointment } from './appointment-card';
import type { Consultant } from '@/app/types/consultant';

interface NextAppointmentCardProps {
  appointment: Appointment | null;
  consultant: Consultant | undefined;
  onViewAll: () => void;
}

const statusColors = {
  Pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  Confirmed: 'bg-blue-100 text-blue-700 border-blue-300',
  Completed: 'bg-green-100 text-green-700 border-green-300',
};

export function NextAppointmentCard({ appointment, consultant, onViewAll }: NextAppointmentCardProps) {
  if (!appointment) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Next Appointment
        </h3>
        <div className="text-center py-8 text-gray-400">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">No upcoming appointments</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-sm border border-blue-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
          Next Appointment
        </h3>
        <span
          className={`text-xs px-3 py-1 rounded-full font-medium border ${
            statusColors[appointment.status]
          }`}
        >
          {appointment.status}
        </span>
      </div>
      
      <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white">
            <User className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-lg text-gray-900 truncate">
              {appointment.customerName}
            </p>
            {consultant && (
              <p className="text-sm text-gray-600 truncate">
                with {consultant.name}
              </p>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-gray-700">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium">
              {appointment.startTime} - {appointment.endTime}
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium">
              {new Date(appointment.date).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>
      </div>
      
      <Button
        variant="outline"
        onClick={onViewAll}
        className="w-full gap-2 group"
      >
        View All Appointments
        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </Button>
    </div>
  );
}
