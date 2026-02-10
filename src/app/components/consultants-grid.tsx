import { Mail, Phone, Calendar, Star } from 'lucide-react';
import type { Consultant } from '@/app/types/consultant';
import type { Appointment } from './appointment-card';

interface ConsultantsGridProps {
  consultants: Consultant[];
  appointments: Appointment[];
  onConsultantClick: (consultant: Consultant) => void;
}

export function ConsultantsGrid({
  consultants,
  appointments,
  onConsultantClick,
}: ConsultantsGridProps) {
  const getConsultantAppointments = (consultantId: string) => {
    const today = new Date().toISOString().split('T')[0];
    return {
      total: appointments.filter((a) => a.consultantId === consultantId).length,
      today: appointments.filter(
        (a) => a.consultantId === consultantId && a.date === today
      ).length,
      upcoming: appointments.filter(
        (a) => a.consultantId === consultantId && a.date >= today && a.status !== 'Completed'
      ).length,
    };
  };

  const specialtyColors = [
    'from-blue-400 to-blue-500',
    'from-orange-400 to-orange-500',
    'from-purple-400 to-purple-500',
    'from-teal-400 to-teal-500',
    'from-pink-400 to-pink-500',
    'from-indigo-400 to-indigo-500',
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {consultants.map((consultant, index) => {
        const stats = getConsultantAppointments(consultant.id);
        const gradientColor = specialtyColors[index % specialtyColors.length];

        return (
          <button
            key={consultant.id}
            onClick={() => onConsultantClick(consultant)}
            className="bg-white rounded-xl shadow-md border-2 border-blue-100 hover:shadow-xl hover:border-blue-300 transition-all text-left overflow-hidden group"
          >
            {/* Header with gradient */}
            <div className={`bg-gradient-to-br ${gradientColor} p-6 relative`}>
              <div className="flex items-start justify-between">
                {/* Profile Image/Avatar */}
                {consultant.avatar ? (
                  <img
                    src={consultant.avatar}
                    alt={consultant.name}
                    className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-16 h-16 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                    <span className="text-white font-bold text-xl">
                      {consultant.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)}
                    </span>
                  </div>
                )}

                {/* Today's count badge */}
                {stats.today > 0 && (
                  <div className="bg-white/30 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold border border-white/40 shadow-sm">
                    {stats.today} Today
                  </div>
                )}
              </div>

              {/* Name & Specialty */}
              <div className="mt-4">
                <h3 className="text-white font-bold text-lg leading-tight">
                  {consultant.name}
                </h3>
                <p className="text-white/95 text-sm mt-1">{consultant.specialization}</p>
              </div>
            </div>

            {/* Content */}
            <div className="p-5">
              {/* Contact Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Mail className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <span className="truncate">{consultant.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Phone className="w-4 h-4 text-orange-400 flex-shrink-0" />
                  <span>{consultant.phone}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-blue-100">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-500">{stats.upcoming}</div>
                  <div className="text-xs text-slate-500 mt-1">Upcoming</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-500">{stats.total}</div>
                  <div className="text-xs text-slate-500 mt-1">Total</div>
                </div>
              </div>

              {/* View Details Link */}
              <div className="mt-4 pt-4 border-t border-blue-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-blue-500 font-medium group-hover:underline">
                    View Details
                  </span>
                  <Calendar className="w-4 h-4 text-blue-500 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}