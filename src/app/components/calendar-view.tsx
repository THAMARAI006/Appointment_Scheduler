import { ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { AppointmentCard, type Appointment } from './appointment-card';
import type { Consultant } from '@/app/types/consultant';

interface CalendarViewProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  appointments: Appointment[];
  consultants: Consultant[];
  onAppointmentClick: (appointment: Appointment) => void;
  viewMode: 'day' | 'week' | 'month';
  onViewModeChange: (mode: 'day' | 'week' | 'month') => void;
  selectedConsultantId?: string | null;
  onConsultantFilter?: (consultantId: string | null) => void;
}

const timeSlots = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', 
  '16:00', '17:00', '18:00', '19:00', '20:00'
];

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function getWeekDates(date: Date): Date[] {
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

function getAppointmentsForTimeSlot(
  appointments: Appointment[],
  date: Date,
  timeSlot: string
): Appointment[] {
  return appointments.filter((apt) => {
    const aptHour = parseInt(apt.startTime.split(':')[0]);
    const slotHour = parseInt(timeSlot.split(':')[0]);
    return isSameDate(date, apt.date) && aptHour === slotHour;
  });
}

export function CalendarView({
  currentDate,
  onDateChange,
  appointments,
  consultants,
  onAppointmentClick,
  viewMode,
  onViewModeChange,
  selectedConsultantId,
  onConsultantFilter,
}: CalendarViewProps) {
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

  const weekDates = viewMode === 'week' ? getWeekDates(currentDate) : viewMode === 'day' ? [currentDate] : [];
  const today = new Date();

  const isToday = (date: Date) => {
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b bg-gray-50">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl">
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
          {/* Consultant Filter */}
          {onConsultantFilter && (
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <Select
                value={selectedConsultantId || 'all'}
                onValueChange={(value) => onConsultantFilter(value === 'all' ? null : value)}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All Consultants" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Consultants</SelectItem>
                  {consultants.map((consultant) => (
                    <SelectItem key={consultant.id} value={consultant.id}>
                      {consultant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {/* View Mode Tabs */}
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'day' ? 'default' : 'outline'}
              onClick={() => onViewModeChange('day')}
            >
              Day
            </Button>
            <Button
              variant={viewMode === 'week' ? 'default' : 'outline'}
              onClick={() => onViewModeChange('week')}
            >
              Week
            </Button>
            <Button
              variant={viewMode === 'month' ? 'default' : 'outline'}
              onClick={() => onViewModeChange('month')}
            >
              Month
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto">
        <div className="min-w-max">
          {/* Day headers */}
          <div className="flex sticky top-0 bg-white z-10 border-b">
            <div className="w-20 flex-shrink-0"></div>
            {weekDates.map((date, index) => {
              const todayColumn = isToday(date);
              return (
                <div
                  key={index}
                  className={`flex-1 min-w-[200px] p-3 text-center border-l ${
                    todayColumn
                      ? 'bg-blue-50 border-l-2 border-l-blue-500'
                      : ''
                  }`}
                >
                  <div className={`text-sm ${todayColumn ? 'text-blue-600 font-medium' : 'opacity-60'}`}>
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className={`text-lg ${todayColumn ? 'text-blue-600 font-semibold' : ''}`}>
                    {date.toLocaleDateString('en-US', { day: 'numeric' })}
                  </div>
                  {todayColumn && (
                    <div className="text-xs text-blue-600 font-medium mt-1">Today</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Time slots */}
          {timeSlots.map((timeSlot) => (
            <div key={timeSlot} className="flex border-b min-h-[80px]">
              <div className="w-20 flex-shrink-0 p-3 text-sm text-right opacity-60">
                {timeSlot}
              </div>
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
                    className={`flex-1 min-w-[200px] p-2 border-l ${
                      todayColumn
                        ? 'bg-blue-50/30 border-l-2 border-l-blue-500'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="space-y-2">
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
  );
}