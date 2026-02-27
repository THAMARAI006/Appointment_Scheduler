import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { AppointmentCard, type Appointment } from './appointment-card';
import type { Consultant } from '@/app/types/consultant';

interface CompactCalendarProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  appointments: Appointment[];
  consultants: Consultant[];
  onAppointmentClick: (appointment: Appointment) => void;
  viewMode: 'day' | 'week' | 'month';
  onViewModeChange: (mode: 'day' | 'week' | 'month') => void;
  onAddAppointment: () => void;
}

export function CompactCalendar({
  currentDate,
  onDateChange,
  appointments,
  consultants,
  onAppointmentClick,
  viewMode,
  onViewModeChange,
  onAddAppointment,
}: CompactCalendarProps) {
  // 8-hour window: 9 AM to 5 PM
  const timeSlots = Array.from({ length: 8 }, (_, i) => {
    const hour = i + 9;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  const getWeekDates = (date: Date): Date[] => {
    const week: Date[] = [];
    const current = new Date(date);
    const day = current.getDay();
    const diff = current.getDate() - day;

    for (let i = 0; i < 7; i++) {
      const weekDate = new Date(current);
      weekDate.setDate(diff + i);
      week.push(weekDate);
    }

    return week;
  };

  const weekDates = viewMode === 'week' ? getWeekDates(currentDate) : [currentDate];

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getAppointmentsForTimeSlot = (
    appointments: Appointment[],
    date: Date,
    timeSlot: string
  ) => {
    const dateStr = date.toISOString().split('T')[0];
    return appointments.filter((apt) => apt.date === dateStr && apt.startTime === timeSlot);
  };

  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() - 1);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    onDateChange(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + 1);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    onDateChange(newDate);
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold">
            {viewMode === 'day'
              ? formatDate(currentDate)
              : `Week of ${formatDate(weekDates[0])}`}
          </h2>
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

        <div className="flex items-center gap-3">
          {/* View Mode Tabs */}
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            <Button
              variant={viewMode === 'day' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('day')}
            >
              Day
            </Button>
            <Button
              variant={viewMode === 'week' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('week')}
            >
              Week
            </Button>
          </div>

          {/* Add Appointment Button */}
          <Button onClick={onAddAppointment} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Appointment
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Day headers */}
        <div className="flex border-b sticky top-0 bg-white z-10">
          <div className="w-16 flex-shrink-0 border-r" />
          {weekDates.map((date, index) => {
            const todayColumn = isToday(date);
            return (
              <div
                key={index}
                className={`flex-1 min-w-[120px] p-3 border-r text-center ${
                  todayColumn ? 'bg-blue-50 border-l-2 border-l-blue-500' : ''
                }`}
              >
                <div className={`text-sm font-medium ${todayColumn ? 'text-blue-600' : 'text-gray-600'}`}>
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className={`text-lg font-semibold ${todayColumn ? 'text-blue-600' : 'text-gray-900'}`}>
                  {date.getDate()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Time slots grid */}
        <div className="flex-1 overflow-auto">
          <div className="min-w-[800px]">
            {timeSlots.map((timeSlot) => (
              <div key={timeSlot} className="flex border-b h-20">
                {/* Time label */}
                <div className="w-16 flex-shrink-0 p-2 border-r bg-gray-50 sticky left-0 z-10">
                  <span className="text-xs font-medium text-gray-600">{timeSlot}</span>
                </div>

                {/* Day columns */}
                {weekDates.map((date, index) => {
                  const slotAppointments = getAppointmentsForTimeSlot(
                    appointments,
                    date,
                    timeSlot
                  );
                  const todayColumn = isToday(date);
                  return (
                    <div
                      key={index}
                      className={`flex-1 min-w-[120px] p-2 border-r ${
                        todayColumn
                          ? 'bg-blue-50/30 border-l-2 border-l-blue-500'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="space-y-1">
                        {slotAppointments.map((apt) => {
                          const consultant = consultants.find((c) => c.id === apt.consultantId);
                          return (
                            <AppointmentCard
                              key={apt.id}
                              appointment={apt}
                              consultantName={consultant?.name}
                              onClick={() => onAppointmentClick(apt)}
                            />
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
