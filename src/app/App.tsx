import { useState } from 'react';
import { ResponsiveSidebar } from '@/app/components/responsive-sidebar';
import { TopNav } from '@/app/components/top-nav';
import { CompactSummary } from '@/app/components/compact-summary';
import { AppointmentsCarousel } from '@/app/components/appointments-carousel';
import { ProfessionalCalendar } from '@/app/components/professional-calendar';
import { AvailabilityView } from '@/app/components/availability-view';
import { DashboardOverview } from '@/app/components/dashboard-overview';
import { AppointmentModal } from '@/app/components/appointment-modal';
import { EditProfileModal } from '@/app/components/edit-profile-modal';
import { ConsultantsGrid } from '@/app/components/consultants-grid';
import { ConsultantDetailsPanel } from '@/app/components/consultant-details-panel';
import { ConsultantAvailabilityHeatmap } from '@/app/components/consultant-availability-heatmap';
import type { Appointment } from '@/app/components/appointment-card';
import type { Consultant } from '@/app/types/consultant';

// Sample Consultants
const consultants: Consultant[] = [
  {
    id: '1',
    name: 'Dr. Sarah Williams',
    specialization: 'Cardiology',
    email: 'sarah.williams@clinic.com',
    phone: '+1 (555) 234-5678',
    availability: {
      monday: [{ start: '09:00', end: '17:00' }],
      tuesday: [{ start: '09:00', end: '17:00' }],
      wednesday: [{ start: '09:00', end: '17:00' }],
      thursday: [{ start: '09:00', end: '17:00' }],
      friday: [{ start: '09:00', end: '13:00' }],
      saturday: [],
      sunday: [],
    },
  },
  {
    id: '2',
    name: 'Dr. Michael Chen',
    specialization: 'Dermatology',
    email: 'michael.chen@clinic.com',
    phone: '+1 (555) 345-6789',
    availability: {
      monday: [{ start: '10:00', end: '18:00' }],
      tuesday: [{ start: '10:00', end: '18:00' }],
      wednesday: [{ start: '10:00', end: '18:00' }],
      thursday: [{ start: '10:00', end: '18:00' }],
      friday: [{ start: '10:00', end: '16:00' }],
      saturday: [{ start: '09:00', end: '13:00' }],
      sunday: [],
    },
  },
  {
    id: '3',
    name: 'Dr. Emily Rodriguez',
    specialization: 'Pediatrics',
    email: 'emily.rodriguez@clinic.com',
    phone: '+1 (555) 456-7890',
    availability: {
      monday: [{ start: '08:00', end: '16:00' }],
      tuesday: [{ start: '08:00', end: '16:00' }],
      wednesday: [{ start: '08:00', end: '16:00' }],
      thursday: [{ start: '08:00', end: '16:00' }],
      friday: [{ start: '08:00', end: '14:00' }],
      saturday: [],
      sunday: [],
    },
  },
  {
    id: '4',
    name: 'Dr. James Thompson',
    specialization: 'Orthopedics',
    email: 'james.thompson@clinic.com',
    phone: '+1 (555) 567-8901',
    availability: {
      monday: [{ start: '09:00', end: '17:00' }],
      tuesday: [{ start: '09:00', end: '17:00' }],
      wednesday: [],
      thursday: [{ start: '09:00', end: '17:00' }],
      friday: [{ start: '09:00', end: '17:00' }],
      saturday: [{ start: '09:00', end: '13:00' }],
      sunday: [],
    },
  },
];

// Sample Appointments
const initialAppointments: Appointment[] = [
  {
    id: '1',
    customerName: 'Sarah Johnson',
    consultantId: '1',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    status: 'Confirmed',
  },
  {
    id: '2',
    customerName: 'Michael Brown',
    consultantId: '2',
    date: new Date().toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '11:00',
    status: 'Pending',
  },
  {
    id: '3',
    customerName: 'Emma Wilson',
    consultantId: '3',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    status: 'Confirmed',
  },
  {
    id: '4',
    customerName: 'David Martinez',
    consultantId: '1',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    startTime: '11:00',
    endTime: '12:00',
    status: 'Completed',
  },
  {
    id: '5',
    customerName: 'Lisa Anderson',
    consultantId: '4',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    status: 'Pending',
  },
  {
    id: '6',
    customerName: 'James Taylor',
    consultantId: '2',
    date: new Date().toISOString().split('T')[0],
    startTime: '14:00',
    endTime: '15:00',
    status: 'Confirmed',
  },
  {
    id: '7',
    customerName: 'Maria Garcia',
    consultantId: '3',
    date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '11:00',
    status: 'Pending',
  },
  {
    id: '8',
    customerName: 'Robert White',
    consultantId: '1',
    date: new Date().toISOString().split('T')[0],
    startTime: '13:00',
    endTime: '14:00',
    status: 'Completed',
  },
  {
    id: '9',
    customerName: 'Jennifer Lee',
    consultantId: '4',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    startTime: '15:00',
    endTime: '16:00',
    status: 'Completed',
  },
  {
    id: '10',
    customerName: 'Christopher Wang',
    consultantId: '2',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    startTime: '11:00',
    endTime: '12:00',
    status: 'Confirmed',
  },
  {
    id: '11',
    customerName: 'Amanda Rodriguez',
    consultantId: '3',
    date: new Date().toISOString().split('T')[0],
    startTime: '14:00',
    endTime: '15:00',
    status: 'Pending',
  },
  {
    id: '12',
    customerName: 'Daniel Kim',
    consultantId: '4',
    date: new Date(Date.now() + 259200000).toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '11:00',
    status: 'Confirmed',
  },
  {
    id: '13',
    customerName: 'Patricia Moore',
    consultantId: '1',
    date: new Date().toISOString().split('T')[0],
    startTime: '15:00',
    endTime: '16:00',
    status: 'Confirmed',
  },
  {
    id: '14',
    customerName: 'Kevin Zhang',
    consultantId: '2',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    startTime: '15:00',
    endTime: '16:00',
    status: 'Pending',
  },
  {
    id: '15',
    customerName: 'Sophie Turner',
    consultantId: '3',
    date: new Date().toISOString().split('T')[0],
    startTime: '11:00',
    endTime: '12:00',
    status: 'Confirmed',
  },
];

interface ProfileData {
  name: string;
  email: string;
  role: string;
  avatar: string;
  phone: string;
  department: string;
}

export default function App() {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [activeSection, setActiveSection] = useState('appointments');
  const [selectedConsultant, setSelectedConsultant] = useState<Consultant | null>(null);

  const [profile, setProfile] = useState<ProfileData>({
    name: 'Lotus',
    email: 'lotus@appointme.com',
    role: 'Administrator',
    avatar: '',
    phone: '+1 (555) 123-4567',
    department: 'General Medicine',
  });

  const handleAddAppointment = () => {
    setSelectedAppointment(null);
    setIsModalOpen(true);
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  const handleSaveAppointment = (
    appointmentData: Omit<Appointment, 'id'> & { id?: string }
  ) => {
    if (appointmentData.id) {
      setAppointments(
        appointments.map((apt) =>
          apt.id === appointmentData.id ? (appointmentData as Appointment) : apt
        )
      );
    } else {
      const newAppointment: Appointment = {
        ...appointmentData,
        id: Date.now().toString(),
      } as Appointment;
      setAppointments([...appointments, newAppointment]);
    }
  };

  const handleDeleteAppointment = () => {
    if (selectedAppointment) {
      setAppointments(appointments.filter((apt) => apt.id !== selectedAppointment.id));
    }
  };

  const handleSaveProfile = (profileData: ProfileData) => {
    setProfile(profileData);
  };

  // Get next appointment
  const today = new Date().toISOString().split('T')[0];
  const nextAppointment = appointments
    .filter((apt) => apt.date >= today && apt.status !== 'Completed')
    .sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.startTime.localeCompare(b.startTime);
    })[0];

  const nextConsultant = nextAppointment
    ? consultants.find((c) => c.id === nextAppointment.consultantId)
    : undefined;

  const getSectionConfig = () => {
    const configs = {
      dashboard: {
        title: 'Dashboard',
        subtitle: 'Overview of your appointments and activity',
        showAddButton: false,
      },
      appointments: {
        title: 'Appointment Scheduler',
        subtitle: 'Manage your calendar and bookings',
        showAddButton: false,
      },
      consultants: {
        title: 'Consultants',
        subtitle: 'View and manage consultant profiles',
        showAddButton: false,
      },
      availability: {
        title: 'Availability Overview',
        subtitle: 'Check consultant availability at a glance',
        showAddButton: false,
      },
      settings: {
        title: 'Settings',
        subtitle: 'Configure your preferences',
        showAddButton: false,
      },
    };
    return configs[activeSection as keyof typeof configs];
  };

  const sectionConfig = getSectionConfig();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-orange-50/20 to-blue-50 flex">
      {/* Left Sidebar */}
      <ResponsiveSidebar
        activeSection={activeSection}
        onSectionChange={(section) => {
          setActiveSection(section);
          setSelectedConsultant(null);
        }}
        profile={profile}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0 h-screen">
        {/* Top Navigation - Sticky */}
        <div className="flex-shrink-0 sticky top-0 z-20 bg-white border-b border-blue-100">
          <TopNav
            title={sectionConfig.title}
            subtitle={sectionConfig.subtitle}
            showAddButton={sectionConfig.showAddButton}
            onAddClick={handleAddAppointment}
            profile={profile}
            onEditProfile={() => setIsProfileModalOpen(true)}
          />
        </div>

        {/* Main Content Area - Single Scroll Container */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Dashboard */}
            {activeSection === 'dashboard' && (
              <div className="space-y-6 max-w-7xl mx-auto">
                <DashboardOverview appointments={appointments} profileName={profile.name} />
              </div>
            )}

            {/* Appointments */}
            {activeSection === 'appointments' && (
              <div className="space-y-6 max-w-[1600px] mx-auto">
                {/* Summary - Above the fold */}
                <CompactSummary
                  appointments={appointments}
                  consultants={consultants}
                  nextAppointment={nextAppointment || null}
                  nextConsultant={nextConsultant}
                  onViewAppointment={handleAppointmentClick}
                />

                {/* Upcoming Appointments Carousel */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h3 className="text-lg font-semibold mb-4">Upcoming Appointments</h3>
                  <AppointmentsCarousel
                    appointments={appointments}
                    consultants={consultants}
                    onAppointmentClick={handleAppointmentClick}
                  />
                </div>

                {/* Compact Calendar */}
                <div className="h-[600px]">
                  <ProfessionalCalendar
                    currentDate={currentDate}
                    onDateChange={setCurrentDate}
                    appointments={appointments}
                    consultants={consultants}
                    onAppointmentClick={handleAppointmentClick}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    onAddAppointment={handleAddAppointment}
                  />
                </div>
              </div>
            )}

            {/* Consultants */}
            {activeSection === 'consultants' && (
              <div className="max-w-7xl mx-auto">
                {!selectedConsultant ? (
                  <ConsultantsGrid
                    consultants={consultants}
                    appointments={appointments}
                    onConsultantClick={setSelectedConsultant}
                  />
                ) : (
                  <div className="space-y-6">
                    <button
                      onClick={() => setSelectedConsultant(null)}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      ← Back to all consultants
                    </button>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <ConsultantDetailsPanel consultant={selectedConsultant} />
                      <ConsultantAvailabilityHeatmap
                        consultant={selectedConsultant}
                        appointments={appointments}
                        onDayClick={(date) => {
                          setCurrentDate(date);
                          setActiveSection('appointments');
                          setViewMode('day');
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Availability */}
            {activeSection === 'availability' && (
              <div className="max-w-7xl mx-auto">
                <AvailabilityView
                  consultants={consultants}
                  appointments={appointments}
                  onConsultantClick={(consultant) => {
                    setSelectedConsultant(consultant);
                    setActiveSection('consultants');
                  }}
                />
              </div>
            )}

            {/* Settings */}
            {activeSection === 'settings' && (
              <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-xl shadow-sm border p-8">
                  <h2 className="text-xl font-semibold mb-6">Settings</h2>
                  <p className="text-gray-600">Configure your application preferences here.</p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Appointment Modal */}
      <AppointmentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedAppointment(null);
        }}
        onSave={handleSaveAppointment}
        onDelete={selectedAppointment ? handleDeleteAppointment : undefined}
        appointment={selectedAppointment}
        selectedDate={currentDate.toISOString().split('T')[0]}
        consultants={consultants}
      />

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onSave={handleSaveProfile}
        currentProfile={profile}
      />
    </div>
  );
}