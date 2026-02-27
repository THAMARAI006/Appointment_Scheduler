import { ArrowRight, Briefcase, Calendar, Mail, Phone } from 'lucide-react';
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

  const specialtyColors = ['from-blue-500 to-blue-600', 'from-indigo-500 to-indigo-600'];

  return (
    <div className="space-y-4">
      {consultants.map((consultant, index) => {
        const stats = getConsultantAppointments(consultant.id);
        const gradientColor = specialtyColors[index % specialtyColors.length];

        return (
          <button
            key={consultant.id}
            onClick={() => onConsultantClick(consultant)}
            className="w-full bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-blue-300 transition-all text-left overflow-hidden group"
          >
            <div className="flex flex-col lg:flex-row lg:items-stretch">
              <div className={`bg-gradient-to-br ${gradientColor} p-6 lg:w-80 flex items-center gap-4`}>
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

                <div className="min-w-0">
                  <h3 className="text-white font-bold text-lg leading-tight truncate">{consultant.name}</h3>
                  <div className="flex items-center gap-2 text-white/95 text-sm mt-1">
                    <Briefcase className="w-4 h-4" />
                    <span className="truncate">{consultant.specialization}</span>
                  </div>
                  {stats.today > 0 && (
                    <div className="inline-flex mt-3 bg-white/25 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold border border-white/40">
                      {stats.today} scheduled today
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Mail className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <span className="truncate">{consultant.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Phone className="w-4 h-4 text-orange-500 flex-shrink-0" />
                      <span>{consultant.phone}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 md:justify-self-end w-full md:max-w-[240px]">
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-blue-600">{stats.upcoming}</div>
                      <div className="text-xs text-slate-500 mt-1">Upcoming</div>
                    </div>
                    <div className="bg-orange-50 border border-orange-100 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-orange-600">{stats.total}</div>
                      <div className="text-xs text-slate-500 mt-1">Total</div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-sm text-slate-500">View full profile and availability</span>
                  <span className="inline-flex items-center gap-2 text-blue-600 font-medium text-sm group-hover:translate-x-0.5 transition-transform">
                    View Details
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}