import { useState, useRef, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { branches } from '../../data';
import AdminPinLock from '../../components/AdminPinLock';
import { 
  LayoutDashboard, 
  Store, 
  LogOut, 
  Bell, 
  ChevronDown, 
  Menu, 
  X, 
  ExternalLink, 
  Check, 
  UtensilsCrossed
} from 'lucide-react';
import { cn } from '../../lib/utils';
import FooterCopyright from '../../components/FooterCopyright';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return (
      localStorage.getItem('asado_admin_auth') === 'true' ||
      sessionStorage.getItem('asado_admin_auth') === 'true'
    );
  });
  const [branchesOpen, setBranchesOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const branchesDropdownRef = useRef<HTMLDivElement>(null);

  const isOverviewActive = location.pathname === '/admin';
  const isBranchActive = location.pathname.includes('/admin/branch');
  const currentBranch = branches.find(b => location.pathname.includes(`/admin/branch/${b.slug}`));

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (branchesDropdownRef.current && !branchesDropdownRef.current.contains(event.target as Node)) {
        setBranchesOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on route navigation
  useEffect(() => {
    setMobileMenuOpen(false);
    setBranchesOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('asado_admin_auth');
    sessionStorage.removeItem('asado_admin_auth');
    setIsAuthenticated(false);
    navigate('/admin');
  };

  if (!isAuthenticated) {
    return <AdminPinLock onUnlock={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 flex flex-col w-full overflow-x-hidden">
      
      {/* Top Navigation Bar with Menu Buttons */}
      <header className="sticky top-0 z-40 bg-white border-b border-neutral-200 shadow-2xs">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between gap-4">
            
            {/* Brand Logo & Desktop Menu Buttons */}
            <div className="flex items-center gap-4 sm:gap-6 lg:gap-8">
              <Link to="/admin" className="flex items-center gap-2.5 shrink-0 group">
                <div className="w-9 h-9 rounded-xl bg-neutral-900 text-amber-500 flex items-center justify-center font-bold text-base shadow-xs group-hover:bg-amber-500 group-hover:text-neutral-950 transition-colors">
                  <UtensilsCrossed className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-extrabold text-lg uppercase tracking-tight text-neutral-900 block leading-tight">
                    Asado Admin
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-amber-600 block">
                    Management Portal
                  </span>
                </div>
              </Link>

              {/* Menu Buttons: Overview & Branches */}
              <nav className="hidden md:flex items-center gap-2.5">
                {/* 1. OVERVIEW MENU BUTTON */}
                <Link 
                  to="/admin" 
                  className={cn(
                    "inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer shadow-2xs",
                    isOverviewActive 
                      ? "bg-neutral-900 text-white shadow-xs" 
                      : "bg-neutral-50 text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950 border border-neutral-200"
                  )}
                >
                  <LayoutDashboard className={cn("w-4 h-4", isOverviewActive ? "text-amber-400" : "text-neutral-500")} />
                  <span>Overview</span>
                </Link>

                {/* 2. BRANCHES MENU BUTTON */}
                <div className="relative" ref={branchesDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setBranchesOpen(!branchesOpen)}
                    className={cn(
                      "inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all shadow-2xs cursor-pointer",
                      isBranchActive 
                        ? "bg-amber-500 text-neutral-950 shadow-xs" 
                        : "bg-neutral-50 text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950 border border-neutral-200"
                    )}
                  >
                    <Store className={cn("w-4 h-4", isBranchActive ? "text-neutral-950" : "text-amber-600")} />
                    <span>{currentBranch ? `Branch: ${currentBranch.name}` : "Branches"}</span>
                    <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", branchesOpen && "rotate-180")} />
                  </button>

                  {/* Branches Dropdown Menu */}
                  {branchesOpen && (
                    <div className="absolute left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-neutral-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-2 border-b border-neutral-100 flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Select Branch</span>
                        <span className="text-[11px] text-neutral-500 font-medium">{branches.length} locations</span>
                      </div>

                      <div className="py-1">
                        {branches.map(branch => {
                          const isCurrent = location.pathname.includes(`/admin/branch/${branch.slug}`);
                          return (
                            <Link
                              key={branch.id}
                              to={`/admin/branch/${branch.slug}`}
                              onClick={() => setBranchesOpen(false)}
                              className={cn(
                                "flex items-center justify-between px-4 py-2.5 text-sm transition-colors",
                                isCurrent 
                                  ? "bg-amber-50 text-amber-950 font-bold" 
                                  : "text-neutral-700 hover:bg-neutral-50"
                              )}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className={cn(
                                  "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold",
                                  isCurrent ? "bg-amber-500 text-neutral-950" : "bg-neutral-100 text-neutral-600"
                                )}>
                                  <Store className="w-3.5 h-3.5" />
                                </div>
                                <div className="min-w-0">
                                  <div className="truncate">{branch.name}</div>
                                  <div className="text-[11px] text-neutral-400 font-normal">{branch.city}</div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <span className={cn(
                                  "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                                  branch.status === 'active' 
                                    ? "bg-emerald-100 text-emerald-800" 
                                    : "bg-amber-100 text-amber-800"
                                )}>
                                  {branch.status === 'active' ? 'Active' : 'Soon'}
                                </span>
                                {isCurrent && <Check className="w-4 h-4 text-amber-600" />}
                              </div>
                            </Link>
                          );
                        })}
                      </div>

                      <div className="pt-2 px-3 pb-1 border-t border-neutral-100">
                        <Link
                          to="/admin"
                          onClick={() => setBranchesOpen(false)}
                          className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-neutral-600 hover:text-amber-800 hover:bg-amber-50 rounded-xl transition-colors"
                        >
                          <LayoutDashboard className="w-3.5 h-3.5" />
                          <span>View Overview & All Branches</span>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </nav>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              {/* Preview Live Site */}
              <Link 
                to={currentBranch ? `/${currentBranch.slug}` : "/"} 
                target="_blank"
                rel="noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-neutral-700 hover:text-amber-800 bg-neutral-50 hover:bg-amber-50 border border-neutral-200 transition-colors shadow-2xs"
                title="Preview live customer site"
              >
                <span>Live Site</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              {/* Notification Bell */}
              <button 
                type="button"
                className="relative p-2 text-neutral-500 hover:text-neutral-900 rounded-xl hover:bg-neutral-100 transition-colors"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full"></span>
              </button>

              {/* Admin Avatar & Logout */}
              <div className="flex items-center gap-2 pl-2 border-l border-neutral-200">
                <div className="w-8 h-8 rounded-full bg-amber-500 text-neutral-950 font-extrabold text-xs flex items-center justify-center shadow-xs">
                  AD
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-red-600 hover:text-red-800 hover:bg-red-50 transition-colors"
                  title="Log out of Admin"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>

              {/* Mobile Menu Hamburger */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl text-neutral-700 hover:bg-neutral-100 border border-neutral-200 cursor-pointer"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Slide-down Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-neutral-200 bg-white px-4 py-4 space-y-4 shadow-lg animate-in slide-in-from-top-2 duration-150">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2 px-1">Navigation</div>
              <div className="space-y-1">
                <Link
                  to="/admin"
                  className={cn(
                    "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors",
                    isOverviewActive ? "bg-neutral-900 text-white" : "text-neutral-700 hover:bg-neutral-50"
                  )}
                >
                  <LayoutDashboard className="w-4 h-4 text-amber-500" />
                  <span>Overview Dashboard</span>
                </Link>
              </div>
            </div>

            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2 px-1">Branches</div>
              <div className="space-y-1">
                {branches.map(branch => {
                  const isCurrent = location.pathname.includes(`/admin/branch/${branch.slug}`);
                  return (
                    <Link
                      key={branch.id}
                      to={`/admin/branch/${branch.slug}`}
                      className={cn(
                        "flex items-center justify-between px-3.5 py-2 rounded-xl text-sm font-medium transition-colors",
                        isCurrent ? "bg-amber-500 text-neutral-950 font-bold" : "text-neutral-700 hover:bg-neutral-50"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <Store className="w-4 h-4" />
                        <span>{branch.name}</span>
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-black/10">
                        {branch.status === 'active' ? 'Active' : 'Soon'}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
              <Link
                to={currentBranch ? `/${currentBranch.slug}` : "/"}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-neutral-700 hover:text-amber-800 flex items-center gap-1.5 py-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Visit Live Customer Menu</span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="text-xs font-semibold text-red-600 hover:text-red-800 flex items-center gap-1 py-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Page Content - Full width max-w-7xl, responsive padding, fits properly without dragging */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 min-w-0">
        <Outlet />
      </main>

      {/* Admin Footer */}
      <footer className="w-full bg-white border-t border-neutral-200 py-6 text-center mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FooterCopyright 
            className="text-neutral-500 text-xs sm:text-sm" 
            linkClassName="text-amber-600 hover:text-amber-700 font-semibold hover:underline transition-colors" 
          />
        </div>
      </footer>
      
    </div>
  );
}
