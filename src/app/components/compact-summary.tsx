import { Calendar, Clock, Users, CheckCircle, User, ArrowRight } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import type { Appointment } from './appointment-card';
import type { Consultant } from '@/app/types/consultant';

interface CompactSummaryProps {
  appointments: Appointment[];
  consultants: Consultant[];
  nextAppointment: Appointment | null;
  nextConsultant: Consultant | undefined;
  onViewAppointment: (appointment: Appointment) => void;
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
}: CompactSummaryProps) {
  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter((apt) => apt.date === today);

  const stats = {
    todayTotal: todayAppointments.length,
    availableSlots: 40 - todayAppointments.length,
    activeConsultants: consultants.length,
    completed: todayAppointments.filter((apt) => apt.status === 'Completed').length,
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      {/* Next Appointment - Featured Card */}
      <div className="lg:col-span-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-sm p-6 text-white">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5" />
          <h3 className="font-semibold text-sm uppercase tracking-wider">Next Appointment</h3>
        </div>
        
        {nextAppointment ? (
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <User className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-lg font-bold truncate">{nextAppointment.customerName}</p>
                {nextConsultant && (
                  <p className="text-sm text-blue-100 truncate">with {nextConsultant.name}</p>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">
                    {nextAppointment.startTime} - {nextAppointment.endTime}
                  </span>
                </div>
                <div className="text-xs text-blue-100">
                  {new Date(nextAppointment.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onViewAppointment(nextAppointment)}
                className="gap-2 group"
              >
                View
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-blue-100">No upcoming appointments</p>
          </div>
        )}
      </div>

      {/* Today's Appointments */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-1">{stats.todayTotal}</div>
        <div className="text-sm text-gray-600">Today's Appointments</div>
        <div className="mt-3 text-xs text-gray-500">
          {stats.completed} completed
        </div>
      </div>

      {/* Available Slots */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Clock className="w-5 h-5 text-green-600" />
          </div>
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-1">{stats.availableSlots}</div>
        <div className="text-sm text-gray-600">Available Slots</div>
        <div className="mt-3 text-xs text-gray-500">
          Open today
        </div>
      </div>
    </div>
  );
}
