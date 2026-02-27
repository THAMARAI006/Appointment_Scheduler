import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { User, Circle } from 'lucide-react';
import type { Consultant } from '@/app/types/consultant';
import type { Appointment } from './appointment-card';

interface AvailabilityViewProps {
  consultants: Consultant[];
  appointments: Appointment[];
  onConsultantClick: (consultant: Consultant) => void;
}

type ViewMode = 'day' | 'week' | 'month';

export function AvailabilityView({
  consultants,
  appointments,
  onConsultantClick,
}: AvailabilityViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [currentDate] = useState(new Date());

  const getConsultantOccupancy = (
    consultantId: string,
    date: Date
  ): 'free' | 'partial' | 'full' => {
    const dateStr = date.toISOString().split('T')[0];
    const dayAppointments = appointments.filter(
      (apt) => apt.date === dateStr && apt.consultantId === consultantId
    );

    if (dayAppointments.length === 0) return 'free';
    if (dayAppointments.length >= 6) return 'full';
    return 'partial';
  };

  const getWeekOccupancy = (consultantId: string): 'free' | 'partial' | 'full' => {
    const today = new Date();
    const weekDates = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - today.getDay() + i);
      return date;
    });

    const occupancies = weekDates.map((date) => getConsultantOccupancy(consultantId, date));
    const freeCount = occupancies.filter((o) => o === 'free').length;
    const fullCount = occupancies.filter((o) => o === 'full').length;

    if (freeCount === 7) return 'free';
    if (fullCount >= 4) return 'full';
    return 'partial';
  };

  const getMonthOccupancy = (consultantId: string): 'free' | 'partial' | 'full' => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const monthDates = Array.from({ length: daysInMonth }, (_, i) => {
      return new Date(year, month, i + 1);
    });

    const occupancies = monthDates.map((date) => getConsultantOccupancy(consultantId, date));
    const freeCount = occupancies.filter((o) => o === 'free').length;
    const fullCount = occupancies.filter((o) => o === 'full').length;

    if (freeCount > daysInMonth * 0.7) return 'free';
    if (fullCount > daysInMonth * 0.5) return 'full';
    return 'partial';
  };

  const getOccupancyColor = (occupancy: 'free' | 'partial' | 'full') => {
    switch (occupancy) {
      case 'free':
        return 'bg-green-500';
      case 'partial':
        return 'bg-yellow-500';
      case 'full':
        return 'bg-red-500';
    }
  };

  const getOccupancyText = (occupancy: 'free' | 'partial' | 'full') => {
    switch (occupancy) {
      case 'free':
        return 'Fully Available';
      case 'partial':
        return 'Partially Booked';
      case 'full':
        return 'Fully Booked';
    }
  };

  const getConsultantOccupancyForView = (consultantId: string): 'free' | 'partial' | 'full' => {
    if (viewMode === 'day') return getConsultantOccupancy(consultantId, currentDate);
    if (viewMode === 'week') return getWeekOccupancy(consultantId);
    return getMonthOccupancy(consultantId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Consultant Availability</h2>
          <p className="text-sm text-gray-600 mt-1">
            {viewMode === 'day' && 'Today'}
            {viewMode === 'week' && 'This Week'}
            {viewMode === 'month' && 'This Month'}
          </p>
        </div>

        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          <Button
            variant={viewMode === 'day' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('day')}
          >
            Day
          </Button>
          <Button
            variant={viewMode === 'week' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('week')}
          >
            Week
          </Button>
          <Button
            variant={viewMode === 'month' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('month')}
          >
            Month
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-lg border">
        <span className="text-sm font-medium text-gray-700">Legend:</span>
        <div className="flex items-center gap-2">
          <Circle className="w-4 h-4 fill-green-500 text-green-500" />
          <span className="text-sm text-gray-600">Fully Available</span>
        </div>
        <div className="flex items-center gap-2">
          <Circle className="w-4 h-4 fill-yellow-500 text-yellow-500" />
          <span className="text-sm text-gray-600">Partially Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <Circle className="w-4 h-4 fill-red-500 text-red-500" />
          <span className="text-sm text-gray-600">Fully Booked</span>
        </div>
      </div>

      {/* Consultants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {consultants.map((consultant) => {
          const occupancy = getConsultantOccupancyForView(consultant.id);

          return (
            <button
              key={consultant.id}
              onClick={() => onConsultantClick(consultant)}
              className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-all text-left hover:border-blue-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
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
                    <p className="font-semibold text-sm truncate">{consultant.name}</p>
                    <p className="text-xs text-gray-500 truncate">{consultant.specialization}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${getOccupancyColor(occupancy)}`} />
                <span className="text-sm font-medium text-gray-700">
                  {getOccupancyText(occupancy)}
                </span>
              </div>

              <div className="mt-4 pt-4 border-t text-xs text-gray-500">
                Click to view detailed schedule
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
