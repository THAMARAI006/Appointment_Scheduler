import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import type { Consultant } from '@/app/types/consultant';
import type { Appointment } from './appointment-card';

interface ConsultantAvailabilityHeatmapProps {
  consultant: Consultant;
  appointments: Appointment[];
  onDayClick?: (date: Date) => void;
}

type ViewMode = 'day' | 'week' | 'month';

export function ConsultantAvailabilityHeatmap({
  consultant,
  appointments,
  onDayClick,
}: ConsultantAvailabilityHeatmapProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [currentDate, setCurrentDate] = useState(new Date());

  // Calculate occupancy for a specific date
  const getOccupancy = (date: Date): 'free' | 'partial' | 'full' => {
    const dateStr = date.toISOString().split('T')[0];
    const dayAppointments = appointments.filter(
      (apt) => apt.date === dateStr && apt.consultantId === consultant.id
    );

    if (dayAppointments.length === 0) return 'free';
    if (dayAppointments.length >= 8) return 'full'; // Assuming 8 slots per day
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

  const getWeekDates = (startDate: Date): Date[] => {
    const week: Date[] = [];
    const current = new Date(startDate);
    const day = current.getDay();
    const diff = current.getDate() - day;

    for (let i = 0; i < 7; i++) {
      const weekDate = new Date(current);
      weekDate.setDate(diff + i);
      week.push(weekDate);
    }

    return week;
  };

  const getMonthDates = (date: Date): Date[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Date[] = [];

    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const renderDayView = () => {
    const hours = Array.from({ length: 13 }, (_, i) => i + 8); // 8 AM to 8 PM
    const dateStr = currentDate.toISOString().split('T')[0];
    const dayAppointments = appointments.filter(
      (apt) => apt.date === dateStr && apt.consultantId === consultant.id
    );

    return (
      <div className="grid grid-cols-13 gap-2">
        {hours.map((hour) => {
          const timeStr = `${hour.toString().padStart(2, '0')}:00`;
          const hasAppointment = dayAppointments.some((apt) => apt.startTime === timeStr);
          return (
            <div
              key={hour}
              className={`h-12 rounded-lg flex items-center justify-center text-xs font-medium ${
                hasAppointment ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
              }`}
            >
              {hour > 12 ? `${hour - 12}PM` : `${hour}AM`}
            </div>
          );
        })}
      </div>
    );
  };

  const renderWeekView = () => {
    const weekDates = getWeekDates(currentDate);
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className="grid grid-cols-7 gap-3">
        {weekDates.map((date, index) => {
          const occupancy = getOccupancy(date);
          const isToday =
            date.toDateString() === new Date().toDateString();

          return (
            <button
              key={index}
              onClick={() => onDayClick?.(date)}
              className={`p-4 rounded-lg transition-all hover:shadow-md ${
                isToday ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <div className="text-center mb-2">
                <div className="text-xs font-medium text-gray-600 mb-1">
                  {weekdays[index]}
                </div>
                <div className="text-lg font-semibold text-gray-900">
                  {date.getDate()}
                </div>
              </div>
              <div
                className={`h-3 rounded-full ${getOccupancyColor(occupancy)}`}
              />
              <div className="text-xs text-gray-500 mt-2 capitalize">
                {occupancy}
              </div>
            </button>
          );
        })}
      </div>
    );
  };

  const renderMonthView = () => {
    const monthDates = getMonthDates(currentDate);
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Pad the beginning to start on the correct day
    const firstDayOfWeek = monthDates[0].getDay();
    const paddedDates = Array(firstDayOfWeek).fill(null).concat(monthDates);

    return (
      <div>
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {weekdays.map((day) => (
            <div key={day} className="text-center text-xs font-semibold text-gray-600 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Month grid */}
        <div className="grid grid-cols-7 gap-2">
          {paddedDates.map((date, index) => {
            if (!date) {
              return <div key={index} />;
            }

            const occupancy = getOccupancy(date);
            const isToday = date.toDateString() === new Date().toDateString();

            return (
              <button
                key={index}
                onClick={() => onDayClick?.(date)}
                className={`aspect-square p-2 rounded-lg transition-all hover:shadow-md ${
                  isToday ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <div className="text-sm font-semibold text-gray-900 mb-1">
                  {date.getDate()}
                </div>
                <div
                  className={`h-2 rounded-full ${getOccupancyColor(occupancy)}`}
                />
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Availability</h3>
          <p className="text-sm text-gray-500">
            {currentDate.toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant={viewMode === 'day' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('day')}
          >
            Day
          </Button>
          <Button
            variant={viewMode === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('week')}
          >
            Week
          </Button>
          <Button
            variant={viewMode === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('month')}
          >
            Month
          </Button>
        </div>
      </div>

      <div className="mb-6">
        {viewMode === 'day' && renderDayView()}
        {viewMode === 'week' && renderWeekView()}
        {viewMode === 'month' && renderMonthView()}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 pt-4 border-t">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded-full" />
          <span className="text-sm text-gray-600">Free</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500 rounded-full" />
          <span className="text-sm text-gray-600">Partial</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded-full" />
          <span className="text-sm text-gray-600">Full</span>
        </div>
      </div>
    </div>
  );
}
