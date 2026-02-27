import { UserCog, Mail, Phone, Briefcase } from 'lucide-react';
import type { Consultant } from '@/app/types/consultant';

interface ConsultantListProps {
  consultants: Consultant[];
  selectedConsultantId: string | null;
  onSelectConsultant: (consultant: Consultant | null) => void;
}

export function ConsultantList({
  consultants,
  selectedConsultantId,
  onSelectConsultant,
}: ConsultantListProps) {
  return (
    <div className="space-y-3">
      {/* All Consultants Option */}
      <button
        onClick={() => onSelectConsultant(null)}
        className={`w-full p-4 rounded-lg border text-left transition-all ${
          selectedConsultantId === null
            ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-200'
            : 'bg-white hover:bg-gray-50'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-white">
            <UserCog className="w-6 h-6" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">All Consultants</p>
            <p className="text-sm text-gray-500">View all appointments</p>
          </div>
        </div>
      </button>

      {/* Individual Consultants */}
      {consultants.map((consultant) => (
        <button
          key={consultant.id}
          onClick={() => onSelectConsultant(consultant)}
          className={`w-full p-4 rounded-lg border text-left transition-all ${
            selectedConsultantId === consultant.id
              ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-200'
              : 'bg-white hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            {consultant.avatar ? (
              <img
                src={consultant.avatar}
                alt={consultant.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                {consultant.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">{consultant.name}</p>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Briefcase className="w-3 h-3" />
                <span className="truncate">{consultant.specialization}</span>
              </div>
            </div>
          </div>
          <div className="space-y-1 text-xs text-gray-500">
            <div className="flex items-center gap-2 truncate">
              <Mail className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{consultant.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3 h-3 flex-shrink-0" />
              <span>{consultant.phone}</span>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
