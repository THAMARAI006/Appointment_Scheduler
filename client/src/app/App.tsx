import { useEffect, useState } from 'react';
import { ResponsiveSidebar } from './components/responsive-sidebar';
import { TopNav } from './components/top-nav';
import { CompactSummary } from './components/compact-summary';
import { AppointmentsCarousel } from './components/appointments-carousel';
import { ProfessionalCalendar } from './components/professional-calendar';
import { AvailabilityView } from './components/availability-view';
import { DashboardOverview } from './components/dashboard-overview';
import { AppointmentModal } from './components/appointment-modal';
import { EditProfileModal } from './components/edit-profile-modal';
import { ConsultantsGrid } from './components/consultants-grid';
import { ConsultantDetailsPanel } from './components/consultant-details-panel';
import { ConsultantAvailabilityHeatmap } from './components/consultant-availability-heatmap';
import type { Appointment } from './components/appointment-card';
import type { Consultant } from './types/consultant';

// Sample Consultants (fallback)
const sampleConsultants: Consultant[] = [
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

type ApiAppointment = {
  id: number;
  tenant_id: number;
  consultant_id: number;
  service_id: number;
  user_id?: number | null;
  customer_name: string;
  phone_number: string;
  appointment_time: string;
  end_time?: string | null;
  timezone?: string | null;
  notes?: string | null;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  created_at: string;
  updated_at?: string | null;
};

type ApiAppointmentKpi = {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  daily_upcoming_appointments: number;
};

type ApiAppointmentCalendarItem = {
  id: number;
  applicant_name: string;
  consultant_name: string;
  start_time: string;
  end_time?: string | null;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  date: string;
};

type ApiUpcomingAppointment = ApiAppointmentCalendarItem;

type ApiTenant = {
  id: number;
  name: string;
  code: string;
  status: string;
};

type ApiService = {
  id: number;
  tenant_id: number;
  name: string;
  duration_minutes: number;
  status: string;
};

type ApiConsultant = {
  id: number;
  tenant_id: number;
  display_name: string;
  specialization?: string | null;
  status: string;
};

const API_BASE_URL = 'http://127.0.0.1:8000';

const defaultAvailability: Consultant['availability'] = {
  monday: [{ start: '09:00', end: '17:00' }],
  tuesday: [{ start: '09:00', end: '17:00' }],
  wednesday: [{ start: '09:00', end: '17:00' }],
  thursday: [{ start: '09:00', end: '17:00' }],
  friday: [{ start: '09:00', end: '17:00' }],
  saturday: [],
  sunday: [],
};

const toUiStatus = (
  status: ApiAppointment['status']
): 'Pending' | 'Confirmed' | 'Completed' => {
  if (status === 'confirmed') return 'Confirmed';
  if (status === 'completed') return 'Completed';
  return 'Pending';
};

const toApiStatus = (
  status: Appointment['status']
): ApiAppointment['status'] => {
  if (status === 'Confirmed') return 'confirmed';
  if (status === 'Completed') return 'completed';
  return 'pending';
};

const extractDateString = (value: string | null | undefined, fallback: string) => {
  if (!value) return fallback;
  const match = value.match(/^(\d{4}-\d{2}-\d{2})/);
  if (match) return match[1];

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return fallback;

  const year = parsed.getFullYear();
  const month = `${parsed.getMonth() + 1}`.padStart(2, '0');
  const day = `${parsed.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const extractTimeString = (value: string | null | undefined, fallback: string) => {
  if (!value) return fallback;
  const isoMatch = value.match(/T(\d{2}:\d{2})/);
  if (isoMatch) return isoMatch[1];

  const timeOnlyMatch = value.match(/^(\d{2}:\d{2})/);
  if (timeOnlyMatch) return timeOnlyMatch[1];

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return fallback;

  const hours = `${parsed.getHours()}`.padStart(2, '0');
  const minutes = `${parsed.getMinutes()}`.padStart(2, '0');
  return `${hours}:${minutes}`;
};

const mapApiToUiAppointment = (appointment: ApiAppointment): Appointment => {
  const fallbackDate = new Date().toISOString().split('T')[0];
  const startTime = extractTimeString(appointment.appointment_time, '09:00');
  const endTime = extractTimeString(appointment.end_time, '10:00');

  return {
    id: appointment.id.toString(),
    customerName: appointment.customer_name,
    consultantId: appointment.consultant_id.toString(),
    date: extractDateString(appointment.appointment_time, fallbackDate),
    startTime,
    endTime,
    status: toUiStatus(appointment.status),
  };
};

const mapApiToUiConsultant = (consultant: ApiConsultant): Consultant => ({
  id: consultant.id.toString(),
  name: consultant.display_name,
  specialization: consultant.specialization || 'General',
  email: `consultant${consultant.id}@clinic.com`,
  phone: '+1 (555) 000-0000',
  availability: {
    monday: [...defaultAvailability.monday],
    tuesday: [...defaultAvailability.tuesday],
    wednesday: [...defaultAvailability.wednesday],
    thursday: [...defaultAvailability.thursday],
    friday: [...defaultAvailability.friday],
    saturday: [],
    sunday: [],
  },
});

const combineDateTime = (date: string, time: string) => `${date}T${time}:00`;

const toApiFilter = (mode: 'day' | 'week' | 'month'): 'daily' | 'weekly' =>
  mode === 'day' ? 'daily' : 'weekly';

const toTimeString = (value: string | null | undefined, fallback: string) => {
  return extractTimeString(value, fallback);
};

export default function App() {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [calendarAppointments, setCalendarAppointments] = useState<Appointment[]>(initialAppointments);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>(initialAppointments);
  const [kpiStats, setKpiStats] = useState<ApiAppointmentKpi | null>(null);
  const [consultants, setConsultants] = useState<Consultant[]>(sampleConsultants);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [activeSection, setActiveSection] = useState('appointments');
  const [selectedConsultant, setSelectedConsultant] = useState<Consultant | null>(null);
  const [defaultTenantId, setDefaultTenantId] = useState<number | null>(null);
  const [defaultServiceId, setDefaultServiceId] = useState<number | null>(null);

  const refreshAppointments = async () => {
    const appointmentsResponse = await fetch(`${API_BASE_URL}/appointments`);
    if (!appointmentsResponse.ok) {
      throw new Error(`Failed to load appointments (${appointmentsResponse.status})`);
    }

    const apiAppointments: ApiAppointment[] = await appointmentsResponse.json();
    setAppointments(apiAppointments.map(mapApiToUiAppointment));
  };

  const refreshKpisAndCalendar = async (
    date: Date,
    mode: 'day' | 'week' | 'month',
    consultantList: Consultant[]
  ) => {
    const filter = toApiFilter(mode);
    const dateParam = date.toISOString().split('T')[0];
    const query = new URLSearchParams({ filter, date: dateParam }).toString();

    const [kpiResponse, calendarResponse] = await Promise.all([
      fetch(`${API_BASE_URL}/appointments/kpis?${query}`),
      fetch(`${API_BASE_URL}/appointments/calendar?${query}`),
    ]);

    if (kpiResponse.ok) {
      const kpi: ApiAppointmentKpi = await kpiResponse.json();
      setKpiStats(kpi);
    }

    if (calendarResponse.ok) {
      const calendarItems: ApiAppointmentCalendarItem[] = await calendarResponse.json();
      const mappedCalendarAppointments: Appointment[] = calendarItems.map((item) => {
        const consultantId =
          consultantList.find((consultant) => consultant.name === item.consultant_name)?.id ||
          consultantList[0]?.id ||
          '1';

        const startTime = toTimeString(item.start_time, '09:00');
        const endTime = toTimeString(item.end_time, '10:00');

        return {
          id: item.id.toString(),
          customerName: item.applicant_name,
          consultantId,
          date: item.date,
          startTime,
          endTime,
          status: toUiStatus(item.status),
        };
      });

      setCalendarAppointments(mappedCalendarAppointments);
    }
  };

  const refreshUpcomingAppointments = async (consultantList: Consultant[]) => {
    const today = new Date();
    const dateParam = today.toISOString().split('T')[0];
    const query = new URLSearchParams({ filter: 'weekly', date: dateParam }).toString();
    const response = await fetch(`${API_BASE_URL}/appointments/calendar?${query}`);

    if (!response.ok) {
      throw new Error(`Failed to load upcoming appointments (${response.status})`);
    }

    const items: ApiUpcomingAppointment[] = await response.json();
    const now = new Date();

    const mapped = items
      .filter((item) => item.status !== 'completed' && item.status !== 'cancelled')
      .map((item) => {
        const consultantId =
          consultantList.find((consultant) => consultant.name === item.consultant_name)?.id ||
          consultantList[0]?.id ||
          '1';

        const start = new Date(item.start_time);
        const end = item.end_time ? new Date(item.end_time) : null;

        return {
          id: item.id.toString(),
          customerName: item.applicant_name,
          consultantId,
          date: item.date,
          startTime: toTimeString(item.start_time, '09:00'),
          endTime: end ? toTimeString(item.end_time, '10:00') : toTimeString(item.start_time, '10:00'),
          status: toUiStatus(item.status),
          _sortTime: start,
        } as Appointment & { _sortTime: Date };
      })
      .filter((item) => item._sortTime >= now)
      .sort((a, b) => a._sortTime.getTime() - b._sortTime.getTime())
      .map(({ _sortTime, ...appointment }) => appointment as Appointment);

    setUpcomingAppointments(mapped);
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const tenantsResponse = await fetch(`${API_BASE_URL}/tenants`);
        if (!tenantsResponse.ok) {
          throw new Error(`Failed to load tenants (${tenantsResponse.status})`);
        }

        const tenants: ApiTenant[] = await tenantsResponse.json();
        let tenantId: number;
        if (tenants.length > 0) {
          tenantId = tenants[0].id;
        } else {
          const createTenantResponse = await fetch(`${API_BASE_URL}/tenants`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: 'Default Clinic',
              code: 'default-clinic',
              status: 'active',
            }),
          });
          if (!createTenantResponse.ok) {
            throw new Error(`Failed to create tenant (${createTenantResponse.status})`);
          }
          const createdTenant: ApiTenant = await createTenantResponse.json();
          tenantId = createdTenant.id;
        }
        setDefaultTenantId(tenantId);

        const servicesResponse = await fetch(`${API_BASE_URL}/services/tenant/${tenantId}`);
        if (!servicesResponse.ok) {
          throw new Error(`Failed to load services (${servicesResponse.status})`);
        }

        const tenantServices: ApiService[] = await servicesResponse.json();
        let serviceId: number;
        if (tenantServices.length > 0) {
          serviceId = tenantServices[0].id;
        } else {
          const createServiceResponse = await fetch(`${API_BASE_URL}/services`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              tenant_id: tenantId,
              name: 'General Consultation',
              duration_minutes: 60,
              price: 0,
              status: 'active',
            }),
          });
          if (!createServiceResponse.ok) {
            throw new Error(`Failed to create service (${createServiceResponse.status})`);
          }
          const createdService: ApiService = await createServiceResponse.json();
          serviceId = createdService.id;
        }
        setDefaultServiceId(serviceId);

        const consultantsResponse = await fetch(`${API_BASE_URL}/consultants`);
        if (!consultantsResponse.ok) {
          throw new Error(`Failed to load consultants (${consultantsResponse.status})`);
        }

        const consultantsData: ApiConsultant[] = await consultantsResponse.json();
        const tenantConsultants = consultantsData.filter((consultant) => consultant.tenant_id === tenantId);
        let finalConsultants: ApiConsultant[] = tenantConsultants;

        if (tenantConsultants.length === 0) {
          const createConsultantPromises = sampleConsultants.map((consultant) =>
            fetch(`${API_BASE_URL}/consultants`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                tenant_id: tenantId,
                display_name: consultant.name,
                specialization: consultant.specialization,
                status: 'active',
              }),
            })
          );

          const createdConsultantResponses = await Promise.all(createConsultantPromises);
          const allSucceeded = createdConsultantResponses.every((response) => response.ok);
          if (allSucceeded) {
            const createdConsultants: ApiConsultant[] = await Promise.all(
              createdConsultantResponses.map(async (response) => response.json())
            );
            finalConsultants = createdConsultants;
          }
        }

        if (finalConsultants.length > 0) {
          setConsultants(finalConsultants.map(mapApiToUiConsultant));
        }

        await refreshAppointments();
        const uiConsultants = finalConsultants.map(mapApiToUiConsultant);
        await refreshKpisAndCalendar(currentDate, viewMode, uiConsultants);
        await refreshUpcomingAppointments(uiConsultants);
      } catch (error) {
        console.error('Failed to load backend data, using local sample data.', error);
        setConsultants(sampleConsultants);
      }
    };

    void loadInitialData();
  }, []);

  useEffect(() => {
    const fetchFilteredCalendarData = async () => {
      try {
        await refreshKpisAndCalendar(currentDate, viewMode, consultants);
        await refreshUpcomingAppointments(consultants);
      } catch (error) {
        console.error('Failed to refresh KPI/calendar data.', error);
      }
    };

    void fetchFilteredCalendarData();
  }, [currentDate, viewMode, consultants]);

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

  const handleSaveAppointment = async (
    appointmentData: Omit<Appointment, 'id'> & { id?: string }
  ) => {
    if (!defaultTenantId || !defaultServiceId) {
      console.error('Missing tenant or service data. Please create tenant/service records first.');
      return;
    }

    const consultantId = Number.parseInt(appointmentData.consultantId, 10);
    if (Number.isNaN(consultantId)) {
      console.error('Invalid consultant selected.');
      return;
    }

    const payload = {
      tenant_id: defaultTenantId,
      consultant_id: consultantId,
      service_id: defaultServiceId,
      customer_name: appointmentData.customerName,
      phone_number: '+10000000000',
      appointment_time: combineDateTime(appointmentData.date, appointmentData.startTime),
      end_time: combineDateTime(appointmentData.date, appointmentData.endTime),
      status: toApiStatus(appointmentData.status),
    };

    try {
      if (appointmentData.id) {
        const response = await fetch(`${API_BASE_URL}/appointments/${appointmentData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`Update failed with status ${response.status}`);
        }

        const updatedAppointment: ApiAppointment = await response.json();
        const mapped = mapApiToUiAppointment(updatedAppointment);
        setAppointments((prev) => prev.map((apt) => (apt.id === mapped.id ? mapped : apt)));
        await refreshKpisAndCalendar(currentDate, viewMode, consultants);
        await refreshUpcomingAppointments(consultants);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Create failed with status ${response.status}`);
      }

      const createdAppointment: ApiAppointment = await response.json();
      setAppointments((prev) => [...prev, mapApiToUiAppointment(createdAppointment)]);
      await refreshKpisAndCalendar(currentDate, viewMode, consultants);
      await refreshUpcomingAppointments(consultants);
    } catch (error) {
      console.error('Failed to save appointment in backend.', error);
    }
  };

  const handleDeleteAppointment = async () => {
    if (selectedAppointment) {
      try {
        const response = await fetch(`${API_BASE_URL}/appointments/${selectedAppointment.id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error(`Delete failed with status ${response.status}`);
        }

        setAppointments((prev) => prev.filter((apt) => apt.id !== selectedAppointment.id));
        await refreshKpisAndCalendar(currentDate, viewMode, consultants);
        await refreshUpcomingAppointments(consultants);
      } catch (error) {
        console.error('Failed to delete appointment in backend.', error);
      }
    }
  };

  const handleSaveProfile = (profileData: ProfileData) => {
    setProfile(profileData);
  };

  // Get next appointment
  const today = new Date().toISOString().split('T')[0];
  const nextAppointment = upcomingAppointments[0];

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
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left Sidebar */}
      <ResponsiveSidebar

        activeSection={activeSection}
        onSectionChange={(section: string) => {
          setActiveSection(section);
          setSelectedConsultant(null);
        }}
        profile={profile}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0 h-screen">
        {/* Top Navigation - Sticky */}
        <div className="flex-shrink-0 sticky top-0 z-20 bg-white border-b border-slate-200">
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
          <div className="p-6 md:p-8">
            {/* Dashboard */}
            {activeSection === 'dashboard' && (
              <div className="space-y-6 max-w-7xl mx-auto">
                <DashboardOverview
                  appointments={appointments}
                  profileName={profile.name}
                  kpis={
                    kpiStats
                      ? {
                          total: kpiStats.total,
                          pending: kpiStats.pending,
                          confirmed: kpiStats.confirmed,
                          completed: kpiStats.completed,
                          upcoming: kpiStats.daily_upcoming_appointments,
                        }
                      : undefined
                  }
                />
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
                  kpis={
                    kpiStats
                      ? {
                          total: kpiStats.total,
                          pending: kpiStats.pending,
                          confirmed: kpiStats.confirmed,
                          completed: kpiStats.completed,
                          upcoming: kpiStats.daily_upcoming_appointments,
                        }
                      : undefined
                  }
                />

                {/* Upcoming Appointments Carousel */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h3 className="text-lg font-semibold mb-4">Upcoming Appointments</h3>
                  <AppointmentsCarousel
                    appointments={upcomingAppointments}
                    consultants={consultants}
                    onAppointmentClick={handleAppointmentClick}
                  />
                </div>

                {/* Compact Calendar */}
                <div className="h-[600px]">
                  <ProfessionalCalendar
                    currentDate={currentDate}
                    onDateChange={setCurrentDate}
                    appointments={calendarAppointments}
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
                        onDayClick={(date: Date) => {
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
                  onConsultantClick={(consultant: Consultant) => {
                    setSelectedConsultant(consultant);
                    setActiveSection('consultants');
                  }}
                />
              </div>
            )}

            {/* Settings */}
            {activeSection === 'settings' && (
              <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
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