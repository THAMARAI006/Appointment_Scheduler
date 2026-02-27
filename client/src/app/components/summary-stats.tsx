import { Calendar, Clock, Users, CheckCircle } from 'lucide-react';
import type { Appointment } from './appointment-card';
import type { Consultant } from '@/app/types/consultant';

interface SummaryStatsProps {
  appointments: Appointment[];
  consultants: Consultant[];
}

export function SummaryStats({ appointments, consultants }: SummaryStatsProps) {
  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter((apt) => apt.date === today);
  
  const stats = {
    todayTotal: todayAppointments.length,
    completed: todayAppointments.filter((apt) => apt.status === 'Completed').length,
    activeConsultants: consultants.length,
    availableSlots: 40 - todayAppointments.length, // Assuming 40 slots per day
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {/* Total Appointments Today */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
            <Calendar className="w-6 h-6" />
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{stats.todayTotal}</div>
            <div className="text-sm text-blue-100 mt-1">Total Today</div>
          </div>
        </div>
        <div className="text-sm text-blue-100">Appointments scheduled</div>
      </div>

      {/* Available Slots */}
      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-sm p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
            <Clock className="w-6 h-6" />
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{stats.availableSlots}</div>
            <div className="text-sm text-green-100 mt-1">Available</div>
          </div>
        </div>
        <div className="text-sm text-green-100">Open time slots</div>
      </div>

      {/* Active Consultants */}
      <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-sm p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
            <Users className="w-6 h-6" />
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{stats.activeConsultants}</div>
            <div className="text-sm text-purple-100 mt-1">Active</div>
          </div>
        </div>
        <div className="text-sm text-purple-100">Consultants available</div>
      </div>

      {/* Completed Appointments */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-sm p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{stats.completed}</div>
            <div className="text-sm text-orange-100 mt-1">Completed</div>
          </div>
        </div>
        <div className="text-sm text-orange-100">Finished today</div>
      </div>
    </div>
  );
}
