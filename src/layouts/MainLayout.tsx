// ============================================================
// SANAD 1.0 - Main Layout
// ============================================================
import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  Home, Users, Upload, Brain, Heart, Stethoscope,
  School, Phone, Palette, UsersRound, BarChart3,
  Settings, Menu, X, ChevronLeft, BookOpen
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'الرئيسية', icon: Home },
  { path: '/students', label: 'المتعلمون', icon: Users },
  { path: '/import', label: 'استيراد مسار', icon: Upload },
  { path: '/psychological', label: 'المواكبة النفسية', icon: Brain },
  { path: '/social', label: 'المواكبة الاجتماعية', icon: Heart },
  { path: '/health', label: 'الصحة المدرسية', icon: Stethoscope },
  { path: '/school-life', label: 'الحياة المدرسية', icon: School },
  { path: '/family', label: 'التواصل مع الأسر', icon: Phone },
  { path: '/activities', label: 'الأنشطة التربوية', icon: Palette },
  { path: '/social-activities', label: 'الأنشطة الموازية الاجتماعية', icon: UsersRound },
  { path: '/reports', label: 'التقارير', icon: BarChart3 },
  { path: '/settings', label: 'الإعدادات', icon: Settings },
];

export function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const getBreadcrumb = () => {
    const item = navItems.find(n => n.path === location.pathname);
    return item ? item.label : 'الرئيسية';
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 right-0 z-50
        ${sidebarOpen ? 'w-64' : 'w-20'} 
        ${mobileOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        bg-white border-l border-gray-200 flex flex-col transition-all duration-300
      `}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
          <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center w-full'}`}>
            <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="text-base font-bold text-gray-900">SANAD</h1>
                <p className="text-[10px] text-gray-500 -mt-0.5">1.0</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            {navItems.map(item => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${!sidebarOpen && 'justify-center'}
                    ${isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span className="truncate">{item.label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Collapse Button */}
        <div className="hidden lg:block p-3 border-t border-gray-100">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <ChevronLeft className={`w-4 h-4 transition-transform ${!sidebarOpen ? 'rotate-180' : ''}`} />
            {sidebarOpen && <span>طي القائمة</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900">{getBreadcrumb()}</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              {new Date().toLocaleDateString('ar-MA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </header>

        {/* Workspace */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
