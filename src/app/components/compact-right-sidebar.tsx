import { Circle } from 'lucide-react';
import { NextAppointmentCard } from './next-appointment-card';
import type { Appointment } from './appointment-card';
import type { Consultant } from '@/app/types/consultant';

interface CompactRightSidebarProps {
  appointments: Appointment[];
  consultants: Consultant[];
  onViewAllAppointments: () => void;
}

export function CompactRightSidebar({
  appointments,
  consultants,
  onViewAllAppointments,
}: CompactRightSidebarProps) {
  const today = new Date().toISOString().split('T')[0];
  
  // Get next upcoming appointment
  const nextAppointment = appointments
    .filter((apt) => apt.date >= today && apt.status !== 'Completed')
    .sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.startTime.localeCompare(b.startTime);
    })[0];

  const nextConsultant = nextAppointment
    ? consultants.find((c) => c.id === nextAppointment.consultantId)
    : undefined;

  return (
    <div className="w-80 bg-gray-50 border-l flex flex-col h-screen sticky top-0 overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Next Appointment */}
        <NextAppointmentCard
          appointment={nextAppointment || null}
          consultant={nextConsultant}
          onViewAll={onViewAllAppointments}
        />

        {/* Availability Legend */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Availability Legend
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Circle className="w-5 h-5 fill-green-500 text-green-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-700">Available</p>
                <p className="text-xs text-gray-500">Completely free</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Circle className="w-5 h-5 fill-yellow-500 text-yellow-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-700">Partial</p>
                <p className="text-xs text-gray-500">Some slots booked</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Circle className="w-5 h-5 fill-red-500 text-red-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-700">Fully Booked</p>
                <p className="text-xs text-gray-500">No availability</p>
              </div>
            </div>
          </div>
        </div>

        {/* Today's Summary */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Today's Summary
          </h3>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">
                {appointments.filter((apt) => apt.date === today && apt.status === 'Confirmed').length}
              </div>
              <div className="text-xs text-gray-600 mt-1">Confirmed</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3 text-center border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-600">
                {appointments.filter((apt) => apt.date === today && apt.status === 'Pending').length}
              </div>
              <div className="text-xs text-gray-600 mt-1">Pending</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center border border-green-200">
              <div className="text-2xl font-bold text-green-600">
                {appointments.filter((apt) => apt.date === today && apt.status === 'Completed').length}
              </div>
              <div className="text-xs text-gray-600 mt-1">Done</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
