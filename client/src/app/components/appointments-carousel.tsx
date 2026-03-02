import Slider from 'react-slick';
import { Clock, User, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Appointment } from './appointment-card';
import type { Consultant } from '@/app/types/consultant';

interface AppointmentsCarouselProps {
  appointments: Appointment[];
  consultants: Consultant[];
  onAppointmentClick: (appointment: Appointment) => void;
}

const statusColors = {
  Pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  Confirmed: 'bg-blue-100 text-blue-700 border-blue-300',
  Completed: 'bg-green-100 text-green-700 border-green-300',
};

function NextArrow(props: any) {
  const { onClick } = props;
  return (
    <button
      onClick={onClick}
      className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white rounded-full shadow-sm border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors"
    >
      <ChevronRight className="w-4 h-4 text-gray-700" />
    </button>
  );
}

function PrevArrow(props: any) {
  const { onClick } = props;
  return (
    <button
      onClick={onClick}
      className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white rounded-full shadow-sm border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors"
    >
      <ChevronLeft className="w-4 h-4 text-gray-700" />
    </button>
  );
}

export function AppointmentsCarousel({
  appointments,
  consultants,
  onAppointmentClick,
}: AppointmentsCarouselProps) {
  const today = new Date().toISOString().split('T')[0];
  
  // Get upcoming appointments (not completed, sorted by date/time)
  const upcomingAppointments = appointments
    .filter((apt) => apt.date >= today && apt.status !== 'Completed')
    .sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.startTime.localeCompare(b.startTime);
    })
    .slice(0, 5);

  const getConsultantName = (consultantId: string) => {
    return consultants.find((c) => c.id === consultantId)?.name || 'Unknown';
  };

  if (upcomingAppointments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p className="text-sm">No upcoming appointments</p>
      </div>
    );
  }

  const settings = {
    dots: false,
    infinite: upcomingAppointments.length > 3,
    speed: 500,
    slidesToShow: Math.min(3, upcomingAppointments.length),
    slidesToScroll: 1,
    nextArrow: upcomingAppointments.length > 3 ? <NextArrow /> : undefined,
    prevArrow: upcomingAppointments.length > 3 ? <PrevArrow /> : undefined,
    responsive: [
      {
        breakpoint: 1400,
        settings: {
          slidesToShow: Math.min(2, upcomingAppointments.length),
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  return (
    <div className="relative px-10">
      <Slider {...settings}>
        {upcomingAppointments.map((apt) => (
          <div key={apt.id} className="px-2">
            <button
              onClick={() => onAppointmentClick(apt)}
              className="w-full bg-white rounded-xl p-4 border border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all text-left"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm truncate text-gray-900">
                      {apt.customerName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {getConsultantName(apt.consultantId)}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium border flex-shrink-0 ${
                    statusColors[apt.status]
                  }`}
                >
                  {apt.status}
                </span>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Clock className="w-3 h-3" />
                  <span className="font-medium">
                    {apt.startTime} - {apt.endTime}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(apt.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
              </div>
            </button>
          </div>
        ))}
      </Slider>
    </div>
  );
}
