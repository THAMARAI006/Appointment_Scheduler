import { 
  CalendarDays, 
  LayoutDashboard, 
  Users, 
  Settings,
  UserCog,
  ChevronRight,
  LogOut 
} from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
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
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ activeSection, onSectionChange, profile }: SidebarProps) {
  return (
    <div className="w-64 bg-white border-r flex flex-col h-full">
      {/* Logo/Brand */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <CalendarDays className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Appointment Scheduler</h1>
            <p className="text-xs text-gray-500">Scheduling System</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="flex-1 text-left">{item.label}</span>
                {isActive && <ChevronRight className="w-4 h-4" />}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Profile Section */}
      <div className="p-4 border-t space-y-2">
        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
          {profile.avatar ? (
            <img
              src={profile.avatar}
              alt={profile.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
            />
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
              {profile.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{profile.name}</p>
            <p className="text-xs text-gray-500 truncate">{profile.role}</p>
          </div>
        </div>
        
        {/* Logout Button */}
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-all">
          <LogOut className="w-5 h-5" />
          <span className="flex-1 text-left font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}