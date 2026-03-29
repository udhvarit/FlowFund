import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Receipt,
  PlusCircle,
  CheckCircle,
  Users,
  Tags,
  GitBranch,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search
} from 'lucide-react';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/expenses', icon: Receipt, label: 'Expenses' },
    { path: '/expenses/new', icon: PlusCircle, label: 'New Expense' },
    ...(user?.role !== 'employee' ? [{ path: '/approvals', icon: CheckCircle, label: 'Approvals' }] : []),
    ...(user?.role === 'admin' ? [
      { path: '/users', icon: Users, label: 'Users' },
      { path: '/categories', icon: Tags, label: 'Categories' },
      { path: '/approval-sequences', icon: GitBranch, label: 'Approval Flows' },
      { path: '/approval-rules', icon: GitBranch, label: 'Approval Rules' },
      { path: '/settings', icon: Settings, label: 'Settings' }
    ] : [])
  ];

  return (
    <div className="min-h-screen bg-secondary-50">
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-3 px-6 py-5 border-b border-secondary-100">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <Receipt className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-secondary-900">ExpenseFlow</h1>
              <p className="text-xs text-secondary-500">Reimbursement System</p>
            </div>
          </div>

          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => sidebarLink(isActive)}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="p-4 border-t border-secondary-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-primary-600">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-secondary-900 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-secondary-500 capitalize">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-2 text-secondary-600 hover:bg-secondary-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-40 bg-white border-b border-secondary-200">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 text-secondary-600 hover:bg-secondary-100 rounded-lg"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <div className="hidden sm:flex items-center flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                <input
                  type="text"
                  placeholder="Search expenses..."
                  className="w-full pl-10 pr-4 py-2 bg-secondary-50 border-0 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="relative p-2 text-secondary-600 hover:bg-secondary-100 rounded-lg">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </header>

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function sidebarLink(isActive) {
  return `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
    isActive
      ? 'bg-primary-50 text-primary-600 font-medium'
      : 'text-secondary-600 hover:bg-secondary-50'
  }`;
}
