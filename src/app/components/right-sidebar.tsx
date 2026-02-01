import { Bell, Clock, User, Plus, Circle } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import type { Appointment } from './appointment-card';
import type { Consultant } from '@/app/types/consultant';

interface RightSidebarProps {
  appointments: Appointment[];
  consultants: Consultant[];
  selectedConsultant?: Consultant | null;
  onAppointmentClick: (appointment: Appointment) => void;
  onQuickAdd: () => void;
}

const statusColors = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Confirmed: 'bg-blue-100 text-blue-700',
  Completed: 'bg-green-100 text-green-700',
};

export function RightSidebar({ 
  appointments, 
  consultants,
  selectedConsultant,
  onAppointmentClick, 
  onQuickAdd 
}: RightSidebarProps) {
  // Get upcoming appointments (today and future, not completed)
  const today = new Date().toISOString().split('T')[0];
  const upcomingAppointments = appointments
    .filter((apt) => apt.date >= today && apt.status !== 'Completed')
    .sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.startTime.localeCompare(b.startTime);
    })
    .slice(0, 6);

  const getConsultantName = (consultantId: string) => {
    return consultants.find((c) => c.id === consultantId)?.name || 'Unknown';
  };

  return (
    <div className="w-80 bg-white border-l flex flex-col h-full overflow-y-auto">
      {/* Quick Add Button */}
      <div className="p-6 border-b bg-gradient-to-br from-blue-50 to-purple-50">
        <Button onClick={onQuickAdd} className="w-full gap-2 shadow-md">
          <Plus className="w-4 h-4" />
          Quick Add Appointment
        </Button>
      </div>

      {/* Selected Consultant Info */}
      {selectedConsultant && (
        <div className="p-6 border-b bg-gradient-to-br from-purple-50 to-pink-50">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Selected Consultant
          </h3>
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="flex items-center gap-3 mb-3">
              {selectedConsultant.avatar ? (
                <img
                  src={selectedConsultant.avatar}
                  alt={selectedConsultant.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                  {selectedConsultant.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{selectedConsultant.name}</p>
                <p className="text-xs text-gray-600 truncate">{selectedConsultant.specialization}</p>
              </div>
            </div>
            <div className="text-xs text-gray-600">
              <p>📧 {selectedConsultant.email}</p>
              <p className="mt-1">📞 {selectedConsultant.phone}</p>
            </div>
          </div>
        </div>
      )}

      {/* Availability Legend */}
      <div className="p-6 border-b bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Availability Legend
        </h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Circle className="w-4 h-4 fill-green-500 text-green-500" />
            <span className="text-sm text-gray-700">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <Circle className="w-4 h-4 fill-red-500 text-red-500" />
            <span className="text-sm text-gray-700">Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <Circle className="w-4 h-4 fill-gray-400 text-gray-400" />
            <span className="text-sm text-gray-700">Past / Unavailable</span>
          </div>
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Upcoming Appointments
          </h3>
          <div className="space-y-3">
            {upcomingAppointments.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No upcoming appointments</p>
              </div>
            ) : (
              upcomingAppointments.map((apt) => (
                <button
                  key={apt.id}
                  onClick={() => onAppointmentClick(apt)}
                  className="w-full bg-gray-50 rounded-lg p-4 text-left hover:shadow-md transition-all border border-gray-100 hover:border-blue-300"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <User className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <span className="font-medium text-sm truncate">
                        {apt.customerName}
                      </span>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        statusColors[apt.status]
                      }`}
                    >
                      {apt.status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 mb-1">
                    with {getConsultantName(apt.consultantId)}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>
                        {apt.startTime} - {apt.endTime}
                      </span>
                    </div>
                    <span>
                      {new Date(apt.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="p-6 border-t bg-gradient-to-br from-gray-50 to-gray-100">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Today's Summary
        </h3>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white rounded-lg p-3 text-center shadow-sm">
            <div className="text-2xl font-bold text-blue-600">
              {
                appointments.filter(
                  (apt) => apt.date === today && apt.status === 'Confirmed'
                ).length
              }
            </div>
            <div className="text-xs text-gray-500 mt-1">Confirmed</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center shadow-sm">
            <div className="text-2xl font-bold text-yellow-600">
              {
                appointments.filter(
                  (apt) => apt.date === today && apt.status === 'Pending'
                ).length
              }
            </div>
            <div className="text-xs text-gray-500 mt-1">Pending</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center shadow-sm">
            <div className="text-2xl font-bold text-green-600">
              {
                appointments.filter(
                  (apt) => apt.date === today && apt.status === 'Completed'
                ).length
              }
            </div>
            <div className="text-xs text-gray-500 mt-1">Done</div>
          </div>
        </div>
      </div>
    </div>
  );
}