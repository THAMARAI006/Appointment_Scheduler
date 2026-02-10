import { ChevronDown, Edit, Bell, User, Settings, LogOut } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { useState } from 'react';

interface TopNavProps {
  title: string;
  subtitle: string;
  showAddButton?: boolean;
  onAddClick?: () => void;
  profile: {
    name: string;
    role: string;
    avatar: string;
  };
  onEditProfile: () => void;
}

export function TopNav({
  title,
  subtitle,
  showAddButton,
  onAddClick,
  profile,
  onEditProfile,
}: TopNavProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b border-blue-100">
      <div className="px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Page Title */}
          <div>
            <h1 className="text-2xl font-semibold text-slate-700">{title}</h1>
            <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
          </div>

          {/* Right Side - Profile & Actions */}
          <div className="flex items-center gap-4">
            {showAddButton && onAddClick && (
              <Button onClick={onAddClick} className="gap-2 bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white shadow-md">
                <span className="text-lg leading-none">+</span>
                Add Appointment
              </Button>
            )}

            {/* Notifications */}
            <button className="relative p-2 hover:bg-blue-50 rounded-xl transition-colors">
              <Bell className="w-5 h-5 text-slate-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-orange-400 rounded-full shadow-sm"></span>
            </button>

            {/* User Profile Section with Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-3 pl-4 border-l border-blue-200 hover:bg-blue-50 rounded-xl p-2 transition-colors"
              >
                {/* Profile Picture */}
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-blue-300"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center text-white font-medium text-sm shadow-md">
                    {profile.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                )}

                {/* Name & Role */}
                <div className="min-w-0 text-left">
                  <p className="font-medium text-sm text-slate-700 truncate">{profile.name}</p>
                  <p className="text-xs text-slate-500 truncate">{profile.role}</p>
                </div>

                <ChevronDown
                  className={`w-4 h-4 text-slate-500 transition-transform ${
                    showProfileMenu ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {showProfileMenu && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setShowProfileMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-blue-200 z-30 overflow-hidden">
                    {/* Profile Info */}
                    <div className="p-4 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-orange-50">
                      <div className="flex items-center gap-3">
                        {profile.avatar ? (
                          <img
                            src={profile.avatar}
                            alt={profile.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-blue-300"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center text-white font-medium shadow-md">
                            {profile.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase()
                              .slice(0, 2)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate text-slate-700">{profile.name}</p>
                          <p className="text-xs text-slate-500 truncate">{profile.role}</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="p-2">
                      <button
                        onClick={() => {
                          onEditProfile();
                          setShowProfileMenu(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-blue-50 transition-colors text-left"
                      >
                        <User className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium text-slate-700">My Profile</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          // Handle settings navigation
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-blue-50 transition-colors text-left"
                      >
                        <Settings className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium text-slate-700">Settings</span>
                      </button>

                      <div className="my-2 border-t border-blue-100" />

                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          // Handle logout
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-orange-50 transition-colors text-left text-orange-600"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm font-medium">Logout</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}