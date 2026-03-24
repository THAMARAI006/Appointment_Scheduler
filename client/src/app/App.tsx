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
import { ConsultantModal } from './components/consultant-modal';
import { ConsultantsGrid } from './components/consultants-grid';
import { ConsultantDetailsPanel } from './components/consultant-details-panel';
import { ConsultantAvailabilityHeatmap } from './components/consultant-availability-heatmap';
import type { Appointment } from './components/appointment-card';
import type { Consultant } from './types/consultant';

interface ProfileData {
  name: string;
  email: string;
  role: string;
  avatar: string;
  phone: string;
  department: string;
}

interface DashboardSettings {
  defaultSection: 'dashboard' | 'appointments' | 'consultants' | 'availability' | 'settings';
  profile: {
    adminName: string;
    email: string;
    phoneNumber: string;
  };
  business: {
    businessName: string;
    businessDescription: string;
    workingHoursStart: string;
    workingHoursEnd: string;
    timeZone: string;
  };
  whatsapp: {
    whatsappNumber: string;
    apiStatus: 'Connected' | 'Not Connected';
    webhookUrl: string;
  };
  notifications: {
    appointmentConfirmation: boolean;
    reminderMessages: boolean;
    cancellationAlerts: boolean;
  };
  consultant: {
    defaultAppointmentDurationMinutes: number;
    maxBookingsPerDay: number;
  };
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

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');
const AUTH_STORAGE_KEY = 'wp_dashboard_logged_in';
const SETTINGS_STORAGE_KEY = 'wp_dashboard_settings';

const DEFAULT_SETTINGS: DashboardSettings = {
  defaultSection: 'appointments',
  profile: {
    adminName: 'Lotus',
    email: 'lotus@appointme.com',
    phoneNumber: '+1 (555) 123-4567',
  },
  business: {
    businessName: 'Lotus Health Center',
    businessDescription: 'Appointment and consultant scheduling center',
    workingHoursStart: '09:00',
    workingHoursEnd: '17:00',
    timeZone: 'Asia/Kolkata',
  },
  whatsapp: {
    whatsappNumber: '+91 90000 00000',
    apiStatus: 'Connected',
    webhookUrl: '/whatsapp/webhook',
  },
  notifications: {
    appointmentConfirmation: true,
    reminderMessages: true,
    cancellationAlerts: true,
  },
  consultant: {
    defaultAppointmentDurationMinutes: 30,
    maxBookingsPerDay: 12,
  },
};

const normalizeSettings = (raw: unknown): DashboardSettings => {
  if (!raw || typeof raw !== 'object') return DEFAULT_SETTINGS;
  const parsed = raw as Partial<DashboardSettings>;

  return {
    defaultSection: parsed.defaultSection || DEFAULT_SETTINGS.defaultSection,
    profile: {
      ...DEFAULT_SETTINGS.profile,
      ...(parsed.profile || {}),
    },
    business: {
      ...DEFAULT_SETTINGS.business,
      ...(parsed.business || {}),
    },
    whatsapp: {
      ...DEFAULT_SETTINGS.whatsapp,
      ...(parsed.whatsapp || {}),
      apiStatus:
        parsed.whatsapp?.apiStatus === 'Not Connected' ? 'Not Connected' : 'Connected',
    },
    notifications: {
      ...DEFAULT_SETTINGS.notifications,
      ...(parsed.notifications || {}),
    },
    consultant: {
      ...DEFAULT_SETTINGS.consultant,
      ...(parsed.consultant || {}),
    },
  };
};

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

const buildDateTime = (date: string, time: string) => {
  const isoLike = `${date}T${time}:00`;
  const parsed = new Date(isoLike);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return window.localStorage.getItem(AUTH_STORAGE_KEY) !== 'false';
  });
  const [loginName, setLoginName] = useState('');
  const [settings, setSettings] = useState<DashboardSettings>(() => {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;
    const stored = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!stored) return DEFAULT_SETTINGS;
    try {
      return normalizeSettings(JSON.parse(stored));
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [calendarAppointments, setCalendarAppointments] = useState<Appointment[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [kpiStats, setKpiStats] = useState<ApiAppointmentKpi | null>(null);
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConsultantModalOpen, setIsConsultantModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [activeSection, setActiveSection] = useState(settings.defaultSection);
  const [selectedConsultant, setSelectedConsultant] = useState<Consultant | null>(null);
  const [editingConsultant, setEditingConsultant] = useState<Consultant | null>(null);
  const [defaultTenantId, setDefaultTenantId] = useState<number | null>(null);
  const [defaultServiceId, setDefaultServiceId] = useState<number | null>(null);

  const refreshAppointments = async () => {
    const appointmentsResponse = await fetch(`${API_BASE_URL}/appointments/`);
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
          '';

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
    const todayDate = now.toISOString().split('T')[0];

    const mapped = items
      .filter((item) => item.status !== 'completed' && item.status !== 'cancelled')
      .map((item) => {
        const consultantId =
          consultantList.find((consultant) => consultant.name === item.consultant_name)?.id ||
          consultantList[0]?.id ||
          '';

        const startTime = toTimeString(item.start_time, '09:00');
        const endTime = toTimeString(item.end_time, '10:00');
        const start = buildDateTime(item.date, startTime);
        const end = buildDateTime(item.date, endTime);

        return {
          id: item.id.toString(),
          customerName: item.applicant_name,
          consultantId,
          date: item.date,
          startTime,
          endTime,
          status: toUiStatus(item.status),
          _sortTime: start,
        } as Appointment & { _sortTime: Date | null };
      })
      .filter((item) => item.date >= todayDate)
      .sort((a, b) => a._sortTime!.getTime() - b._sortTime!.getTime())
      .map(({ _sortTime, ...appointment }) => appointment as Appointment);

    setUpcomingAppointments(mapped);
  };

  useEffect(() => {
    const loadInitialData = async () => {
      let resolvedConsultants: Consultant[] = [];

      try {
        const tenantsResponse = await fetch(`${API_BASE_URL}/tenants/`);
        if (!tenantsResponse.ok) {
          throw new Error(`Failed to load tenants (${tenantsResponse.status})`);
        }

        const tenants: ApiTenant[] = await tenantsResponse.json();
        const tenantId = tenants[0]?.id ?? null;
        setDefaultTenantId(tenantId);

        if (tenantId) {
          const servicesResponse = await fetch(`${API_BASE_URL}/services/tenant/${tenantId}`);
          if (servicesResponse.ok) {
            const tenantServices: ApiService[] = await servicesResponse.json();
            setDefaultServiceId(tenantServices[0]?.id ?? null);
          } else {
            setDefaultServiceId(null);
          }
        } else {
          setDefaultServiceId(null);
        }

        const consultantsResponse = await fetch(`${API_BASE_URL}/consultants/`);
        if (!consultantsResponse.ok) {
          throw new Error(`Failed to load consultants (${consultantsResponse.status})`);
        }

        const consultantsData: ApiConsultant[] = await consultantsResponse.json();
        const tenantConsultants = tenantId
          ? consultantsData.filter((consultant) => consultant.tenant_id === tenantId)
          : [];
        resolvedConsultants = tenantConsultants.map(mapApiToUiConsultant);
      } catch (error) {
        console.error('Failed to load tenant/service/consultant data.', error);
        setDefaultTenantId(null);
        setDefaultServiceId(null);
        resolvedConsultants = [];
      }

      try {
        setConsultants(resolvedConsultants);
        await refreshAppointments();
        await refreshKpisAndCalendar(currentDate, viewMode, resolvedConsultants);
        await refreshUpcomingAppointments(resolvedConsultants);
      } catch (error) {
        console.error('Failed to load appointment/dashboard data.', error);
        setAppointments([]);
        setCalendarAppointments([]);
        setUpcomingAppointments([]);
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

  useEffect(() => {
    if (consultants.length === 0) return;

    const intervalId = window.setInterval(() => {
      void refreshAppointments();
      void refreshKpisAndCalendar(currentDate, viewMode, consultants);
      void refreshUpcomingAppointments(consultants);
    }, 15 * 1000);

    return () => window.clearInterval(intervalId);
  }, [currentDate, viewMode, consultants]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const [profile, setProfile] = useState<ProfileData>({
    name: 'Lotus',
    email: 'lotus@appointme.com',
    role: 'Administrator',
    avatar: '',
    phone: '+1 (555) 123-4567',
    department: 'General Medicine',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordMessage, setPasswordMessage] = useState('');

  const handleAddAppointment = () => {
    setSelectedAppointment(null);
    setIsModalOpen(true);
  };

  const handleAddConsultant = () => {
    setEditingConsultant(null);
    setIsConsultantModalOpen(true);
  };

  const handleEditConsultant = (consultant: Consultant) => {
    setEditingConsultant(consultant);
    setIsConsultantModalOpen(true);
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

      const response = await fetch(`${API_BASE_URL}/appointments/`, {
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

  const handleLogout = () => {
    setIsAuthenticated(false);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(AUTH_STORAGE_KEY, 'false');
    }
  };

  const handleLogin = () => {
    if (!loginName.trim()) return;
    setProfile((prev) => ({ ...prev, name: loginName.trim() }));
    setIsAuthenticated(true);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(AUTH_STORAGE_KEY, 'true');
    }
    setActiveSection(settings.defaultSection);
  };

  const handleSaveConsultant = async (
    consultantData: Omit<Consultant, 'id' | 'availability' | 'avatar'>
  ) => {
    if (!defaultTenantId) {
      console.error('Missing tenant data. Please create tenant records first.');
      return;
    }

    const payload = {
      tenant_id: defaultTenantId,
      display_name: consultantData.name,
      specialization: consultantData.specialization,
      status: 'active',
    };

    try {
      const isEdit = Boolean(editingConsultant);
      const consultantUrl = isEdit
        ? `${API_BASE_URL}/consultants/${editingConsultant?.id}`
        : `${API_BASE_URL}/consultants/`;

      const response = await fetch(consultantUrl, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Save consultant failed with status ${response.status}`);
      }

      const savedConsultant: ApiConsultant = await response.json();
      const mappedConsultant = {
        ...mapApiToUiConsultant(savedConsultant),
        email: consultantData.email,
        phone: consultantData.phone,
      };

      if (isEdit && editingConsultant) {
        setConsultants((prev) =>
          prev.map((consultant) =>
            consultant.id === editingConsultant.id ? mappedConsultant : consultant
          )
        );
        setSelectedConsultant((prev) =>
          prev?.id === editingConsultant.id ? mappedConsultant : prev
        );
      } else {
        setConsultants((prev) => [...prev, mappedConsultant]);
      }

      setEditingConsultant(null);
    } catch (error) {
      console.error('Failed to save consultant in backend.', error);
    }
  };

  const handleDeleteConsultant = async () => {
    if (!editingConsultant) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/consultants/${editingConsultant.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Delete consultant failed with status ${response.status}`);
      }

      setConsultants((prev) => prev.filter((consultant) => consultant.id !== editingConsultant.id));
      setSelectedConsultant((prev) =>
        prev?.id === editingConsultant.id ? null : prev
      );
      setEditingConsultant(null);
    } catch (error) {
      console.error('Failed to delete consultant in backend.', error);
    }
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
        addButtonLabel: 'Add Appointment',
      },
      appointments: {
        title: 'Appointment Scheduler',
        subtitle: 'Manage your calendar and bookings',
        showAddButton: false,
        addButtonLabel: 'Add Appointment',
      },
      consultants: {
        title: 'Consultants',
        subtitle: 'View and manage consultant profiles',
        showAddButton: true,
        addButtonLabel: 'Add Consultant',
      },
      availability: {
        title: 'Availability Overview',
        subtitle: 'Check consultant availability at a glance',
        showAddButton: false,
        addButtonLabel: 'Add Appointment',
      },
      settings: {
        title: 'Settings',
        subtitle: 'Configure your preferences',
        showAddButton: false,
        addButtonLabel: 'Add Appointment',
      },
    };
    return configs[activeSection as keyof typeof configs];
  };

  const sectionConfig = getSectionConfig();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
          <h1 className="text-2xl font-semibold text-slate-800">Sign In</h1>
          <p className="text-sm text-slate-500 mt-2">Enter your name to continue to the dashboard.</p>
          <div className="mt-6 space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              Name
              <input
                type="text"
                value={loginName}
                onChange={(event) => setLoginName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') handleLogin();
                }}
                placeholder="Thamizh"
                className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
            <button
              onClick={handleLogin}
              className="w-full rounded-xl bg-blue-600 text-white px-4 py-2.5 font-medium hover:bg-blue-700 disabled:opacity-50"
              disabled={!loginName.trim()}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left Sidebar */}
      <ResponsiveSidebar

        activeSection={activeSection}
        onSectionChange={(section: string) => {
          setActiveSection(section as DashboardSettings['defaultSection']);
          setSelectedConsultant(null);
        }}
        onLogout={handleLogout}
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
            addButtonLabel={sectionConfig.addButtonLabel}
            onAddClick={activeSection === 'consultants' ? handleAddConsultant : handleAddAppointment}
            profile={profile}
            onEditProfile={() => setIsProfileModalOpen(true)}
            onOpenSettings={() => setActiveSection('settings')}
            onLogout={handleLogout}
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
                    <div className="flex items-center justify-between gap-4">
                      <button
                        onClick={() => setSelectedConsultant(null)}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        ← Back to all consultants
                      </button>
                      <button
                        onClick={() => selectedConsultant && handleEditConsultant(selectedConsultant)}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
                      >
                        Edit Consultant
                      </button>
                    </div>
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
                  <h2 className="text-xl font-semibold mb-2">Settings</h2>
                  <p className="text-sm text-slate-500">No settings configured yet.</p>
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

      {/* Consultant Modal */}
      <ConsultantModal
        isOpen={isConsultantModalOpen}
        onClose={() => {
          setIsConsultantModalOpen(false);
          setEditingConsultant(null);
        }}
        consultant={editingConsultant}
        onSave={handleSaveConsultant}
        onDelete={editingConsultant ? handleDeleteConsultant : undefined}
      />
    </div>
  );
}