import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthViewModel } from '../../viewmodels/AuthViewModel';
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard, Users, Dumbbell, LogOut, Leaf, Menu, X, Utensils
} from 'lucide-react';
import { useState, type ReactNode } from 'react';

interface NavItem {
  to: string;
  icon: LucideIcon;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/users', icon: Users, label: 'Người dùng' },
  { to: '/foods', icon: Utensils, label: 'Đồ ăn' },
  { to: '/activities', icon: Dumbbell, label: 'Hoạt động' },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, handleLogout } = useAuthViewModel();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const onLogout = async () => {
    await handleLogout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-neutral-200
          transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-neutral-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <Leaf className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="text-lg font-bold text-neutral-900">Nutrix</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg hover:bg-neutral-100"
            >
              <X className="w-5 h-5 text-neutral-500" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {NAV_ITEMS.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* User & Logout */}
          <div className="border-t border-neutral-100 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-semibold">
                {user?.email?.charAt(0)?.toUpperCase() || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900 truncate">Admin</p>
                <p className="text-xs text-neutral-500 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-neutral-600
                hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Đăng xuất
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar (mobile) */}
        <header className="lg:hidden h-14 bg-white border-b border-neutral-200 flex items-center px-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-neutral-100"
          >
            <Menu className="w-5 h-5 text-neutral-600" />
          </button>
          <div className="flex items-center gap-2 ml-3">
            <div className="w-6 h-6 bg-primary-500 rounded-md flex items-center justify-center">
              <Leaf className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-neutral-900">Nutrix</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
