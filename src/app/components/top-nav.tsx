import { ChevronDown, Edit, Bell } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

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
  return (
    <header className="bg-white border-b sticky top-0 z-20 shadow-sm">
      <div className="px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Page Title */}
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          </div>

          {/* Right Side - Profile & Actions */}
          <div className="flex items-center gap-4">
            {showAddButton && onAddClick && (
              <Button onClick={onAddClick} className="gap-2">
                <span className="text-lg leading-none">+</span>
                Add Appointment
              </Button>
            )}

            {/* Notifications */}
            <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Profile Section */}
            <div className="flex items-center gap-3 pl-4 border-l">
              {/* Profile Picture */}
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-11 h-11 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                  {profile.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)}
                </div>
              )}

              {/* Name & Role */}
              <div className="min-w-0">
                <p className="font-medium text-sm text-gray-900 truncate">{profile.name}</p>
                <p className="text-xs text-gray-500 truncate">{profile.role}</p>
              </div>

              {/* Edit Profile Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={onEditProfile}
                className="gap-2 flex-shrink-0"
              >
                <Edit className="w-3.5 h-3.5" />
                Edit Profile
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}