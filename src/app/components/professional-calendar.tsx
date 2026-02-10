import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import type { Appointment } from './appointment-card';
import type { Consultant } from '@/app/types/consultant';

interface ProfessionalCalendarProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  appointments: Appointment[];
  consultants: Consultant[];
  onAppointmentClick: (appointment: Appointment) => void;
  viewMode: 'day' | 'week' | 'month';
  onViewModeChange: (mode: 'day' | 'week' | 'month') => void;
  onAddAppointment: () => void;
}

const statusColors = {
  Pending: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-400',
    text: 'text-yellow-700',
    hover: 'hover:bg-yellow-100',
  },
  Confirmed: {
    bg: 'bg-blue-50',
    border: 'border-blue-400',
    text: 'text-blue-700',
    hover: 'hover:bg-blue-100',
  },
  Completed: {
    bg: 'bg-orange-50',
    border: 'border-orange-400',
    text: 'text-orange-700',
    hover: 'hover:bg-orange-100',
  },
};

export function ProfessionalCalendar({
  currentDate,
  onDateChange,
  appointments,
  consultants,
  onAppointmentClick,
  viewMode,
  onViewModeChange,
  onAddAppointment,
}: ProfessionalCalendarProps) {
  // 8 AM to 6 PM (10 hours)
  const startHour = 8;
  const endHour = 18;
  const totalHours = endHour - startHour;
  const pixelsPerHour = 80; // Height per hour

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

  const getCurrentTimePosition = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    if (currentHour < startHour || currentHour >= endHour) return null;
    
    const hourOffset = currentHour - startHour;
    const minuteOffset = currentMinute / 60;
    const position = (hourOffset + minuteOffset) * pixelsPerHour;
    
    return position;
  };

  const getAppointmentPosition = (appointment: Appointment) => {
    const [startHourStr, startMinuteStr] = appointment.startTime.split(':');
    const [endHourStr, endMinuteStr] = appointment.endTime.split(':');
    
    const startHourNum = parseInt(startHourStr);
    const startMinuteNum = parseInt(startMinuteStr);
    const endHourNum = parseInt(endHourStr);
    const endMinuteNum = parseInt(endMinuteStr);
    
    const startOffset = (startHourNum - startHour) + (startMinuteNum / 60);
    const endOffset = (endHourNum - startHour) + (endMinuteNum / 60);
    
    const top = startOffset * pixelsPerHour;
    const height = (endOffset - startOffset) * pixelsPerHour;
    
    return { top, height };
  };

  const getAppointmentsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return appointments.filter((apt) => apt.date === dateStr);
  };

  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() - 1);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    }
    onDateChange(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + 1);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    }
    onDateChange(newDate);
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  const currentTimePos = getCurrentTimePosition();

  return (
    <div className="bg-white rounded-xl shadow-sm border flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50 flex-shrink-0">
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
        <div className="flex border-b bg-white z-10 flex-shrink-0">
          <div className="w-20 flex-shrink-0 border-r bg-gray-50" />
          {weekDates.map((date, index) => {
            const todayColumn = isToday(date);
            return (
              <div
                key={index}
                className={`flex-1 min-w-[140px] p-4 border-r text-center ${
                  todayColumn ? 'bg-blue-50' : ''
                }`}
              >
                <div className="text-xs font-medium text-gray-500 uppercase mb-1">
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div
                  className={`text-2xl font-semibold ${
                    todayColumn ? 'text-blue-600' : 'text-gray-900'
                  }`}
                >
                  {date.getDate()}
                </div>
                <div className="text-xs text-gray-500">
                  {date.toLocaleDateString('en-US', { month: 'short' })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Time grid with appointments */}
        <div className="flex-1 overflow-auto relative">
          <div className="flex min-w-max">
            {/* Time labels */}
            <div className="w-20 flex-shrink-0 border-r bg-gray-50 sticky left-0 z-10">
              {Array.from({ length: totalHours }, (_, i) => {
                const hour = startHour + i;
                const displayHour = hour > 12 ? hour - 12 : hour;
                const period = hour >= 12 ? 'PM' : 'AM';
                return (
                  <div
                    key={i}
                    className="border-b text-right pr-3 py-1 text-xs font-medium text-gray-600"
                    style={{ height: `${pixelsPerHour}px` }}
                  >
                    {displayHour}:00 {period}
                  </div>
                );
              })}
            </div>

            {/* Day columns with appointments */}
            {weekDates.map((date, dateIndex) => {
              const todayColumn = isToday(date);
              const dayAppointments = getAppointmentsForDate(date);

              return (
                <div
                  key={dateIndex}
                  className={`flex-1 min-w-[140px] border-r relative ${
                    todayColumn ? 'bg-blue-50/30' : ''
                  }`}
                >
                  {/* Hour lines */}
                  {Array.from({ length: totalHours }, (_, i) => (
                    <div
                      key={i}
                      className="border-b hover:bg-gray-50/50"
                      style={{ height: `${pixelsPerHour}px` }}
                    />
                  ))}

                  {/* Current time indicator */}
                  {todayColumn && currentTimePos !== null && (
                    <div
                      className="absolute left-0 right-0 z-20 pointer-events-none"
                      style={{ top: `${currentTimePos}px` }}
                    >
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-red-500 rounded-full -ml-1.5 border-2 border-white" />
                        <div className="flex-1 h-0.5 bg-red-500" />
                      </div>
                    </div>
                  )}

                  {/* Appointments */}
                  {dayAppointments.map((apt) => {
                    const { top, height } = getAppointmentPosition(apt);
                    const consultant = consultants.find((c) => c.id === apt.consultantId);
                    const colors = statusColors[apt.status];

                    return (
                      <button
                        key={apt.id}
                        onClick={() => onAppointmentClick(apt)}
                        className={`absolute left-1 right-1 rounded-lg border-l-4 ${colors.bg} ${colors.border} ${colors.text} ${colors.hover} transition-all p-2 text-left overflow-hidden shadow-sm z-10`}
                        style={{
                          top: `${top}px`,
                          height: `${Math.max(height - 4, 40)}px`,
                        }}
                      >
                        <div className="flex flex-col h-full">
                          <div className="font-semibold text-sm truncate">
                            {apt.customerName}
                          </div>
                          <div className="text-xs opacity-90 truncate">
                            {apt.startTime} - {apt.endTime}
                          </div>
                          {consultant && height > 60 && (
                            <div className="text-xs opacity-80 truncate mt-1">
                              {consultant.name}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}