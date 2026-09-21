import { Link, Outlet, useLocation } from 'react-router-dom';
import { branches } from '../../data';
import { LayoutDashboard, Store, LogOut, Search, Bell } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function AdminLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 flex">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-neutral-200 flex flex-col shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-neutral-200">
          <Link to="/admin" className="font-bold text-xl uppercase tracking-tight text-neutral-900">
            Asado Admin
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-8 overflow-y-auto">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3 px-3">Overview</div>
            <Link 
              to="/admin" 
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                location.pathname === '/admin' ? "bg-amber-50 text-amber-900" : "text-neutral-600 hover:bg-neutral-50"
              )}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
          </div>
          
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3 px-3">Branches</div>
            <div className="space-y-1">
              {branches.map(branch => (
                <Link 
                  key={branch.id}
                  to={`/admin/branch/${branch.slug}`}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    location.pathname.includes(`/admin/branch/${branch.slug}`) ? "bg-amber-50 text-amber-900" : "text-neutral-600 hover:bg-neutral-50"
                  )}
                >
                  <Store className="w-4 h-4" />
                  {branch.name}
                </Link>
              ))}
            </div>
          </div>
        </nav>
        
        <div className="p-4 border-t border-neutral-200">
          <button className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-8 shrink-0">
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full pl-9 pr-4 py-2 bg-neutral-100 border border-neutral-200 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>
          <div className="flex items-center gap-4">
            <button className="relative text-neutral-500 hover:text-neutral-700">
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            <div className="w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
              A
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
      
    </div>
  );
}
