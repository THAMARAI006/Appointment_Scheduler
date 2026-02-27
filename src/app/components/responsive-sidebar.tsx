import { 
  CalendarDays, 
  LayoutDashboard, 
  Users, 
  Settings,
  UserCog,
  LogOut,
  ClockIcon,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

interface ResponsiveSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  profile: {
    name: string;
    role: string;
    avatar: string;
  };
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'appointments', label: 'Appointments', icon: CalendarDays },
  { id: 'consultants', label: 'Consultants', icon: UserCog },
  { id: 'availability', label: 'Availability', icon: ClockIcon },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function ResponsiveSidebar({ activeSection, onSectionChange, profile }: ResponsiveSidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-slate-200 flex-shrink-0 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
            <CalendarDays className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-700">AppointMe</h1>
            <p className="text-xs text-slate-500">Scheduling System</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu - Scrollable */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSectionChange(item.id);
                  setIsMobileOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white font-medium shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span className="flex-1 text-left">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Profile Section - Sticky at Bottom */}
      <div className="p-4 border-t border-slate-200 flex-shrink-0 bg-white">
        <div className="space-y-2">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-slate-200"
              />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                {profile.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate text-slate-700">{profile.name}</p>
              <p className="text-xs text-slate-500 truncate">{profile.role}</p>
            </div>
          </div>
          
          {/* Logout Button */}
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-orange-600 hover:bg-orange-50 transition-all border border-orange-200">
            <LogOut className="w-5 h-5" />
            <span className="flex-1 text-left font-medium">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center border border-slate-200"
      >
        {isMobileOpen ? <X className="w-5 h-5 text-slate-600" /> : <Menu className="w-5 h-5 text-slate-600" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-900/20 z-30 backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar - Desktop & Mobile */}
      <aside
        className={`
          fixed lg:static top-0 left-0 h-screen w-64 bg-white border-r border-slate-200 flex flex-col z-40
          transition-transform duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <SidebarContent />
      </aside>
    </>
  );
}