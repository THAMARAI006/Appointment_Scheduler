import { Briefcase, Mail, Phone } from 'lucide-react';
import type { Consultant } from '@/app/types/consultant';

interface ConsultantDetailsPanelProps {
  consultant: Consultant | null;
  onClose?: () => void;
}

export function ConsultantDetailsPanel({ consultant }: ConsultantDetailsPanelProps) {
  if (!consultant) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-8 h-full flex items-center justify-center">
        <p className="text-gray-500">Select a consultant to view details</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-full">
      <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
        {consultant.avatar ? (
          <img
            src={consultant.avatar}
            alt={consultant.name}
            className="w-20 h-20 rounded-full object-cover border-4 border-gray-100"
          />
        ) : (
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-medium border-4 border-gray-100">
            {consultant.name
              .split(' ')
              .map((namePart) => namePart[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)}
          </div>
        )}

        <div className="min-w-0">
          <h3 className="text-4xl font-semibold text-gray-900 leading-tight tracking-tight">{consultant.name}</h3>
          <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
            <Briefcase className="w-4 h-4" />
            <span>{consultant.specialization}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <Mail className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Email</p>
            <p className="text-sm font-medium text-gray-900 break-all">{consultant.email}</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <Phone className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Phone</p>
            <p className="text-sm font-medium text-gray-900">{consultant.phone}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-slate-100">
        <h4 className="text-sm font-semibold text-gray-700 mb-4">Weekly Availability</h4>
        <div className="space-y-2.5 max-h-[320px] overflow-auto pr-1">
          {Object.entries(consultant.availability).map(([day, slots]) => (
            <div
              key={day}
              className="flex items-center justify-between text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5"
            >
              <span className="text-gray-700 capitalize font-medium w-28">{day}</span>
              <span className="text-gray-900 font-medium text-right">
                {slots.length > 0
                  ? slots.map((slot) => `${slot.start} - ${slot.end}`).join(', ')
                  : 'Not available'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
