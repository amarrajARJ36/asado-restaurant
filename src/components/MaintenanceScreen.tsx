import React from 'react';
import { Link } from 'react-router-dom';
import { 
  PauseCircle, 
  Clock, 
  Phone, 
  MessageCircle, 
  UtensilsCrossed, 
  Lock, 
  ArrowRight,
  ShieldAlert,
  Play
} from 'lucide-react';
import { MaintenanceSettings } from '../types';

interface MaintenanceScreenProps {
  settings: MaintenanceSettings;
  branchName?: string;
  isAdmin?: boolean;
  onTurnOff?: () => void;
}

export default function MaintenanceScreen({
  settings,
  branchName,
  isAdmin = false,
  onTurnOff
}: MaintenanceScreenProps) {
  const cleanPhone = (settings.contactPhone || '+91 95625 36000').replace(/[^0-9+]/g, '');
  const waNumber = cleanPhone.replace('+', '');

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between relative overflow-hidden select-none">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 sm:w-[600px] sm:h-[600px] bg-amber-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-neutral-800/20 rounded-full blur-2xl pointer-events-none" />

      {/* Admin Top Notification (If Admin viewing live preview) */}
      {isAdmin && (
        <div className="relative z-20 bg-amber-500/15 border-b border-amber-500/30 px-4 py-2.5 backdrop-blur-md">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-amber-300 font-medium">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Admin Mode Active:</strong> Public visitors currently see this pause screen.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {onTurnOff && (
                <button
                  onClick={onTurnOff}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Resume Website Now
                </button>
              )}
              <Link
                to="/admin"
                className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold text-xs border border-neutral-700 transition-colors"
              >
                Go to Admin Portal
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12 relative z-10">
        <div className="w-full max-w-xl mx-auto text-center">
          
          {/* Logo & Icon Badge */}
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-neutral-900 border border-neutral-800 text-amber-500 shadow-2xl mb-6">
            <UtensilsCrossed className="w-8 h-8" />
          </div>

          <div className="mb-3">
            <span className="text-xs sm:text-sm font-extrabold tracking-widest uppercase text-neutral-400">
              ASADO CAFE &bull; {branchName ? branchName.toUpperCase() : 'THE RIVER RESTAURANT'}
            </span>
          </div>

          {/* Status Indicator */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-6">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <PauseCircle className="w-3.5 h-3.5" />
            <span>Site Temporarily Paused</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-4 leading-tight">
            {settings.pauseTitle || "We'll Be Right Back"}
          </h1>

          {/* Message */}
          <p className="text-neutral-400 text-base sm:text-lg leading-relaxed max-w-md mx-auto mb-8 font-normal">
            {settings.pauseMessage || "We are currently conducting routine updates and maintenance to deliver the best culinary experience. Please check back with us shortly!"}
          </p>

          {/* Expected Return Note */}
          {settings.expectedBack && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-900/90 border border-neutral-800 text-neutral-300 text-xs sm:text-sm font-medium mb-8">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Resuming: <strong className="text-white">{settings.expectedBack}</strong></span>
            </div>
          )}

          {/* Contact & Support Section */}
          <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-5 sm:p-6 backdrop-blur-sm max-w-md mx-auto mb-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-4">
              Need assistance or have an existing reservation?
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href={`tel:${cleanPhone}`}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs sm:text-sm transition-all border border-neutral-700 hover:border-neutral-600"
              >
                <Phone className="w-4 h-4 text-amber-400" />
                <span>Call Restaurant</span>
              </a>

              <a
                href={`https://wa.me/${waNumber}?text=Hi%20Asado%20Cafe,%20I%20have%20an%20inquiry%20regarding%20reservations`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 font-semibold text-xs sm:text-sm transition-all border border-emerald-500/30 hover:border-emerald-500/50"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp Us</span>
              </a>
            </div>
          </div>

          {/* Admin link */}
          <div className="flex items-center justify-center gap-2 text-xs text-neutral-500 hover:text-neutral-400 transition-colors">
            <Lock className="w-3.5 h-3.5" />
            <Link to="/admin" className="hover:underline flex items-center gap-1 font-medium">
              Restaurant Staff & Management Login
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 border-t border-neutral-900 text-center text-xs text-neutral-600 relative z-10">
        <p>&copy; {new Date().getFullYear()} ASADO Cafe &amp; Dining. All rights reserved.</p>
      </footer>
    </div>
  );
}
