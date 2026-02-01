import { useState } from 'react';
import { Sidebar } from '@/app/components/sidebar';
import { TopNav } from '@/app/components/top-nav';
import { RightSidebar } from '@/app/components/right-sidebar';
import { CalendarView } from '@/app/components/calendar-view';
import { MonthView } from '@/app/components/month-view';
import { DashboardOverview } from '@/app/components/dashboard-overview';
import { SummaryStats } from '@/app/components/summary-stats';
import { AppointmentModal } from '@/app/components/appointment-modal';
import { EditProfileModal } from '@/app/components/edit-profile-modal';
import { ConsultantList } from '@/app/components/consultant-list';
import { ConsultantDetailsPanel } from '@/app/components/consultant-details-panel';
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
  const [filterConsultantId, setFilterConsultantId] = useState<string | null>(null);

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

  const handleMonthDateClick = (date: Date) => {
    setCurrentDate(date);
    setViewMode('day');
  };

  const getSectionConfig = () => {
    const configs = {
      dashboard: {
        title: 'Dashboard Overview',
        subtitle: 'Monitor your appointments and activity',
        showAddButton: false,
      },
      appointments: {
        title: 'Appointment Calendar',
        subtitle: 'Manage and schedule appointments',
        showAddButton: true,
      },
      consultants: {
        title: 'Consultants',
        subtitle: 'Manage consultant profiles and schedules',
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

  // Filter appointments by selected consultant
  const filteredAppointments = filterConsultantId
    ? appointments.filter((apt) => apt.consultantId === filterConsultantId)
    : appointments;

  // Get consultant name for appointment card
  const getConsultantName = (consultantId: string) => {
    return consultants.find((c) => c.id === consultantId)?.name;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar */}
      <Sidebar
        activeSection={activeSection}
        onSectionChange={(section) => {
          setActiveSection(section);
          if (section !== 'consultants') {
            setSelectedConsultant(null);
          }
        }}
        profile={profile}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation */}
        <TopNav
          title={sectionConfig.title}
          subtitle={sectionConfig.subtitle}
          showAddButton={sectionConfig.showAddButton}
          onAddClick={handleAddAppointment}
          profile={profile}
          onEditProfile={() => setIsProfileModalOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="p-8">
            {activeSection === 'dashboard' && (
              <DashboardOverview appointments={appointments} profileName={profile.name} />
            )}
            
            {activeSection === 'appointments' && (
              <>
                <SummaryStats appointments={appointments} consultants={consultants} />
                <div className="h-[calc(100vh-350px)]">
                  {viewMode === 'month' ? (
                    <MonthView
                      currentDate={currentDate}
                      onDateChange={setCurrentDate}
                      appointments={filteredAppointments}
                      onDateClick={handleMonthDateClick}
                    />
                  ) : (
                    <CalendarView
                      currentDate={currentDate}
                      onDateChange={setCurrentDate}
                      appointments={filteredAppointments}
                      consultants={consultants}
                      onAppointmentClick={handleAppointmentClick}
                      viewMode={viewMode}
                      onViewModeChange={setViewMode}
                      selectedConsultantId={filterConsultantId}
                      onConsultantFilter={setFilterConsultantId}
                    />
                  )}
                </div>
              </>
            )}

            {activeSection === 'consultants' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-white rounded-xl shadow-sm border p-6">
                    <h3 className="text-lg font-semibold mb-4">Select Consultant</h3>
                    <ConsultantList
                      consultants={consultants}
                      selectedConsultantId={selectedConsultant?.id || null}
                      onSelectConsultant={setSelectedConsultant}
                    />
                  </div>
                </div>
                <div>
                  <ConsultantDetailsPanel consultant={selectedConsultant} />
                  {selectedConsultant && (
                    <div className="mt-6">
                      <div className="bg-white rounded-xl shadow-sm border p-6">
                        <h3 className="text-lg font-semibold mb-4">Consultant Schedule</h3>
                        <div className="h-[600px]">
                          <CalendarView
                            currentDate={currentDate}
                            onDateChange={setCurrentDate}
                            appointments={appointments.filter(
                              (apt) => apt.consultantId === selectedConsultant.id
                            )}
                            consultants={consultants}
                            onAppointmentClick={handleAppointmentClick}
                            viewMode="week"
                            onViewModeChange={() => {}}
                            selectedConsultantId={selectedConsultant.id}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeSection === 'settings' && (
              <div className="bg-white rounded-xl shadow-sm border p-8">
                <h2 className="text-xl font-semibold mb-6">Settings</h2>
                <p className="text-gray-600">Configure your application preferences here.</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Right Sidebar */}
      {activeSection === 'appointments' && (
        <RightSidebar
          appointments={filteredAppointments}
          consultants={consultants}
          selectedConsultant={filterConsultantId ? consultants.find(c => c.id === filterConsultantId) : null}
          onAppointmentClick={handleAppointmentClick}
          onQuickAdd={handleAddAppointment}
        />
      )}

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