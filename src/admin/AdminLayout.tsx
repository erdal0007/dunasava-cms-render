import { Link, useLocation, Outlet } from 'react-router';
import { useAuth } from '@/hooks/useAuth';
import {
  LayoutDashboard,
  Layers,
  Package,
  Factory,
  Languages,
  BarChart3,
  Settings,
  Image,
  LogOut,
  ChevronRight,
  Globe,
} from 'lucide-react';

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/sections', label: 'Bölümler', icon: Layers },
  { path: '/admin/products', label: 'Ürünler', icon: Package },
  { path: '/admin/sectors', label: 'Sektörler', icon: Factory },
  { path: '/admin/translations', label: 'Çeviriler', icon: Languages },
  { path: '/admin/statistics', label: 'İstatistikler', icon: BarChart3 },
  { path: '/admin/settings', label: 'Ayarlar', icon: Settings },
  { path: '/admin/media', label: 'Medya', icon: Image },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-[#0A1628]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0D1F2D] border-r border-[#1A3A4A] flex flex-col fixed h-full">
        {/* Logo */}
        <div className="p-6 border-b border-[#1A3A4A]">
          <Link to="/admin" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#4A7C59] flex items-center justify-center">
              <Globe size={16} className="text-white" />
            </div>
            <div>
              <div className="text-white text-sm font-medium tracking-wide">DUNASAVA</div>
              <div className="text-[#4A7C59] text-[10px] tracking-wider">ADMIN PANEL</div>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-[#4A7C59]/15 text-[#4A7C59]'
                    : 'text-[#8A9BAE] hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={17} />
                <span>{item.label}</span>
                {isActive && <ChevronRight size={14} className="ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-[#1A3A4A]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-[#4A7C59]/20 flex items-center justify-center">
              <span className="text-[#4A7C59] text-xs font-medium">
                {user?.name?.charAt(0) || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm truncate">{user?.name || 'Admin'}</div>
              <div className="text-[#8A9BAE] text-[10px]">{user?.role || 'admin'}</div>
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="flex items-center gap-2 text-[#8A9BAE] hover:text-red-400 text-xs transition-colors w-full px-2 py-1.5"
          >
            <LogOut size={13} />
            <span>Çıkış Yap</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64">
        <Outlet />
      </main>
    </div>
  );
}
