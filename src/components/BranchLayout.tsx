import { Link, Outlet, useLocation } from 'react-router-dom';
import { branches } from '../data';
import { useState, useRef, useEffect } from 'react';
import { MapPin, ChevronDown, Menu as MenuIcon, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import FooterCopyright from './FooterCopyright';

interface BranchLayoutProps {
  branchSlug: string;
}

export default function BranchLayout({ branchSlug }: BranchLayoutProps) {
  const branch = branches.find(b => b.slug === branchSlug);
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  if (!branch) return <div>Branch not found</div>;

  let navLinks = [
    { name: 'Home', path: `/${branchSlug}` },
    { name: 'Menu', path: `/${branchSlug}/menu` },
    { name: 'Gallery', path: `/${branchSlug}/gallery` },
  ];

  if (branchSlug === 'kollam') {
    navLinks = [
      { name: 'Home', path: `/${branchSlug}` },
      { name: 'Menu', path: `/${branchSlug}/menu` },
      { name: 'Cruise', path: `/${branchSlug}/cruise` },
      { name: "Celebrations", path: `/${branchSlug}/celebrations` },
      { name: 'Gallery', path: `/${branchSlug}/gallery` },
    ];
  } else if (branchSlug === 'alappuzha') {
    navLinks = [
      { name: 'Home', path: `/${branchSlug}` },
      { name: 'Menu', path: `/${branchSlug}/menu` },
      { name: 'Houseboats', path: `/${branchSlug}#houseboats` },
      { name: 'Celebrations', path: `/${branchSlug}#celebrations` },
      { name: 'Gallery', path: `/${branchSlug}#gallery` },
      { name: 'Contact', path: `/${branchSlug}#contact` },
    ];
  }

  return (
    <div className="min-h-screen bg-neutral-50 font-sans text-neutral-900 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo / Brand */}
          <Link to="/" className="flex flex-col hover:opacity-80 transition-opacity">
            <span className="text-xl font-bold tracking-tight uppercase">ASADO CAFE</span>
            <div className="flex items-center text-xs text-neutral-500 gap-1 font-medium mt-0.5">
              <MapPin className="w-3 h-3" />
              <span>You're viewing ASADO {branch.name.toUpperCase()}</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
               // Exact match for Home, otherwise includes for active state
               const isActive = link.path === `/${branchSlug}` 
                 ? location.pathname === link.path 
                 : location.pathname.startsWith(link.path);

               return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-amber-600",
                    isActive ? "text-amber-600" : "text-neutral-600"
                  )}
                >
                  {link.name}
                </Link>
               )
            })}
          </nav>

          {/* Branch Switcher & Mobile Toggle */}
          <div className="flex items-center gap-4">
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-neutral-100 rounded-full hover:bg-neutral-200 transition-colors"
              >
                <MapPin className="w-4 h-4 text-amber-600" />
                <span className="hidden sm:inline">{branch.name}</span>
                <ChevronDown className="w-4 h-4 text-neutral-500" />
              </button>
              
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-neutral-100 overflow-hidden"
                  >
                    <div className="p-2 bg-neutral-50 border-b border-neutral-100 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                      Switch Branch
                    </div>
                    <div className="py-1">
                      {branches.map(b => (
                        <Link 
                          key={b.id}
                          to={b.status === 'coming_soon' ? '#' : `/${b.slug}`}
                          onClick={() => setIsDropdownOpen(false)}
                          className={cn(
                            "flex items-center justify-between px-4 py-3 text-sm transition-colors",
                            b.id === branch.id ? "bg-amber-50 text-amber-900 font-medium" : "text-neutral-700 hover:bg-neutral-50",
                            b.status === 'coming_soon' && "opacity-60 cursor-default"
                          )}
                        >
                          <span>{b.name}</span>
                          {b.id === branch.id && (
                            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                          )}
                          {b.status === 'coming_soon' && (
                            <span className="text-[10px] uppercase font-bold bg-neutral-200 px-2 py-0.5 rounded-sm">Soon</span>
                          )}
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <button 
              className="md:hidden p-2 text-neutral-600"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-neutral-200 bg-white overflow-hidden"
            >
              <nav className="flex flex-col p-4 gap-2">
                {navLinks.map((link) => {
                  const isActive = link.path === `/${branchSlug}` 
                    ? location.pathname === link.path 
                    : location.pathname.startsWith(link.path);

                  return (
                    <Link
                      key={link.name}
                      to={link.path}
                      className={cn(
                        "px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                        isActive ? "bg-amber-50 text-amber-700" : "text-neutral-700 hover:bg-neutral-50"
                      )}
                    >
                      {link.name}
                    </Link>
                  )
                })}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-neutral-900 text-neutral-400 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-8">
          <div>
            <Link to="/" className="text-xl font-bold tracking-tight text-white uppercase block mb-4 hover:opacity-80 transition-opacity">
              ASADO CAFE
            </Link>
            <p className="text-sm max-w-xs">An Experience. More than a restaurant.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 uppercase tracking-wider text-sm">Branches</h4>
            <ul className="space-y-2 text-sm">
              {branches.map(b => (
                <li key={b.id}>
                  {b.status === 'coming_soon' ? (
                    <span className="text-neutral-600">{b.name} (Coming Soon)</span>
                  ) : (
                    <Link to={`/${b.slug}`} className="hover:text-white transition-colors">
                      {b.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 uppercase tracking-wider text-sm">Contact {branch.name}</h4>
            {branch.slug === 'kollam' ? (
              <>
                <p className="text-sm mb-2 text-neutral-400">Jaladarshini Lakeside Gardens, near Milma Diary, Palace Nagar, Thevally, Kollam, Kerala 691012</p>
                <p className="text-sm mb-2 text-neutral-400">Phone/WhatsApp: <a href="tel:09061114112" className="hover:underline">09061114112</a></p>
                <p className="text-sm mb-2"><a href="https://maps.app.goo.gl/tycM4c3aJdQ1JanL6?g_st=aw" target="_blank" rel="noreferrer" className="text-amber-500 hover:underline">Google Maps</a></p>
              </>
            ) : branch.slug === 'alappuzha' ? (
              <>
                <p className="text-sm mb-2 text-neutral-400">Asado Cafe, Erezha, Mullakkal, Alappuzha, Kerala 688011</p>
                <p className="text-sm mb-2 text-neutral-400">Phone/WhatsApp: <a href="tel:+919876512345" className="hover:underline">+91 98765 12345</a></p>
                <p className="text-sm mb-2"><a href="https://maps.app.goo.gl/BTdeG8hUQJL4P2pU7?g_st=ac" target="_blank" rel="noreferrer" className="text-amber-500 hover:underline">Google Maps</a></p>
              </>
            ) : (
               <p className="text-sm mb-2 text-neutral-400">Opening Soon</p>
            )}
            
            <div className="mt-4">
              <a href="https://www.instagram.com/asado_cafe?igsh=MWQwOWgyaGJxaGd6Yw==" target="_blank" rel="noreferrer" className="text-sm text-neutral-400 hover:text-white transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
                Instagram
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-neutral-800 text-center">
          <FooterCopyright className="text-neutral-500 text-sm" />
        </div>
      </footer>
    </div>
  );
}
