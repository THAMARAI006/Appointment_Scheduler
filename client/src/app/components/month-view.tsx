import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import type { Appointment } from './appointment-card';

interface MonthViewProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  appointments: Appointment[];
  onDateClick: (date: Date) => void;
}

function getDaysInMonth(date: Date): Date[] {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days: Date[] = [];

  // Add days from previous month to fill the first week
  const firstDayOfWeek = firstDay.getDay();
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const prevDate = new Date(year, month, -i);
    days.push(prevDate);
  }

  // Add all days of current month
  for (let day = 1; day <= lastDay.getDate(); day++) {
    days.push(new Date(year, month, day));
  }

  // Add days from next month to complete the last week
  const remainingDays = 7 - (days.length % 7);
  if (remainingDays < 7) {
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(year, month + 1, i));
    }
  }

  return days;
}

function isSameDate(date1: Date, date2: string): boolean {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export function MonthView({
  currentDate,
  onDateChange,
  appointments,
  onDateClick,
}: MonthViewProps) {
  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    onDateChange(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    onDateChange(newDate);
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  const days = getDaysInMonth(currentDate);
  const today = new Date();

  const isToday = (date: Date) => {
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter((apt) =>
      isSameDate(date, apt.date)
    );
  };

  const monthName = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b bg-gray-50">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-semibold">{monthName}</h2>
          <div className="flex gap-1">
            <Button variant="outline" size="icon" onClick={handlePrevious}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleNext}>
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button variant="outline" onClick={handleToday}>
              Today
            </Button>
          </div>
        </div>
      </div>

      {/* Month Grid */}
      <div className="flex-1 p-4">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              className="text-center text-sm font-semibold text-gray-600 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((date, index) => {
            const dayAppointments = getAppointmentsForDate(date);
            const pending = dayAppointments.filter((a) => a.status === 'Pending').length;
            const confirmed = dayAppointments.filter((a) => a.status === 'Confirmed').length;
            const completed = dayAppointments.filter((a) => a.status === 'Completed').length;

            return (
              <button
                key={index}
                onClick={() => onDateClick(date)}
                className={`
                  aspect-square p-2 rounded-lg border text-left hover:bg-gray-50 transition-colors
                  ${isToday(date) ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-200' : ''}
                  ${!isCurrentMonth(date) ? 'opacity-40' : ''}
                `}
              >
                <div
                  className={`text-sm font-medium mb-1 ${
                    isToday(date) ? 'text-blue-600' : ''
                  }`}
                >
                  {date.getDate()}
                </div>
                {dayAppointments.length > 0 && (
                  <div className="space-y-1">
                    {pending > 0 && (
                      <div className="h-1.5 bg-yellow-400 rounded-full" title={`${pending} Pending`} />
                    )}
                    {confirmed > 0 && (
                      <div className="h-1.5 bg-blue-400 rounded-full" title={`${confirmed} Confirmed`} />
                    )}
                    {completed > 0 && (
                      <div className="h-1.5 bg-green-400 rounded-full" title={`${completed} Completed`} />
                    )}
                    <div className="text-xs text-gray-500 mt-1">
                      {dayAppointments.length} apt{dayAppointments.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
