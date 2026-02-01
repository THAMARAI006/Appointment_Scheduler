import { Mail, Phone, Briefcase, User } from 'lucide-react';
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
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex flex-col items-center text-center mb-6">
        {consultant.avatar ? (
          <img
            src={consultant.avatar}
            alt={consultant.name}
            className="w-24 h-24 rounded-full object-cover border-4 border-gray-100 mb-4"
          />
        ) : (
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-medium mb-4 border-4 border-gray-100">
            {consultant.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)}
          </div>
        )}
        <h3 className="text-xl font-semibold text-gray-900 mb-1">{consultant.name}</h3>
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <Briefcase className="w-4 h-4" />
          <span>{consultant.specialization}</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
          <Mail className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 mb-1">Email</p>
            <p className="text-sm font-medium text-gray-900 break-all">{consultant.email}</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
          <Phone className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 mb-1">Phone</p>
            <p className="text-sm font-medium text-gray-900">{consultant.phone}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Weekly Availability</h4>
        <div className="space-y-2">
          {Object.entries(consultant.availability).map(([day, slots]) => (
            <div key={day} className="flex justify-between items-center text-sm">
              <span className="text-gray-600 capitalize">{day}</span>
              <span className="text-gray-900 font-medium">
                {slots.length > 0
                  ? slots.map((s) => `${s.start}-${s.end}`).join(', ')
                  : 'Not Available'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
