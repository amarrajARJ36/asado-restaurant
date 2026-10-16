import React, { useState, useEffect } from 'react';
import { 
  PauseCircle, 
  PlayCircle, 
  Clock, 
  ShieldAlert, 
  Save, 
  Check, 
  Eye, 
  RotateCcw, 
  Store, 
  Globe, 
  Phone, 
  Mail, 
  AlertTriangle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useMaintenance, DEFAULT_MAINTENANCE_SETTINGS } from '../hooks/useMaintenance';
import { branches } from '../data';
import MaintenanceScreen from './MaintenanceScreen';

export default function MaintenanceControlPanel() {
  const { settings, updateMaintenance, togglePause } = useMaintenance();

  const [isPaused, setIsPaused] = useState(settings.isPaused);
  const [pauseTitle, setPauseTitle] = useState(settings.pauseTitle);
  const [pauseMessage, setPauseMessage] = useState(settings.pauseMessage);
  const [expectedBack, setExpectedBack] = useState(settings.expectedBack || '');
  const [contactPhone, setContactPhone] = useState(settings.contactPhone || '');
  const [contactEmail, setContactEmail] = useState(settings.contactEmail || '');
  const [pausedBranches, setPausedBranches] = useState<string[]>(settings.pausedBranches || []);
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Sync state when external settings update
  useEffect(() => {
    setIsPaused(settings.isPaused);
    setPauseTitle(settings.pauseTitle);
    setPauseMessage(settings.pauseMessage);
    setExpectedBack(settings.expectedBack || '');
    setContactPhone(settings.contactPhone || '');
    setContactEmail(settings.contactEmail || '');
    setPausedBranches(settings.pausedBranches || []);
  }, [settings]);

  const handleToggle = async () => {
    const next = !isPaused;
    setIsPaused(next);
    await togglePause(next);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      await updateMaintenance({
        isPaused,
        pauseTitle: pauseTitle.trim() || DEFAULT_MAINTENANCE_SETTINGS.pauseTitle,
        pauseMessage: pauseMessage.trim() || DEFAULT_MAINTENANCE_SETTINGS.pauseMessage,
        expectedBack: expectedBack.trim(),
        contactPhone: contactPhone.trim(),
        contactEmail: contactEmail.trim(),
        pausedBranches
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleBranch = (slug: string) => {
    setPausedBranches(prev => {
      if (prev.includes(slug)) {
        return prev.filter(s => s !== slug);
      } else {
        return [...prev, slug];
      }
    });
  };

  return (
    <>
      <div className={`rounded-3xl border transition-all duration-300 shadow-xs overflow-hidden ${
        isPaused 
          ? 'bg-gradient-to-b from-amber-50/80 via-white to-white border-amber-300 shadow-amber-100/50' 
          : 'bg-white border-neutral-200'
      }`}>
        {/* Main Status Header */}
        <div className="p-6 sm:p-7 border-b border-neutral-100">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            {/* Left: Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                  isPaused 
                    ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${isPaused ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'}`} />
                  {isPaused ? '⏸️ Deployment Paused / Maintenance Active' : '🟢 Deployment Live (Normal Operation)'}
                </span>

                {isPaused && pausedBranches.length > 0 && (
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                    {pausedBranches.length === 1 
                      ? `${pausedBranches[0].toUpperCase()} Branch Only` 
                      : `${pausedBranches.length} Branches Paused`}
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
                <span>Website &amp; Deployment Pause Switch</span>
              </h2>
              
              <p className="text-neutral-500 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
                {isPaused ? (
                  <span className="text-amber-900 font-medium">
                    Public visitors are currently seeing the branded maintenance screen. Staff can still access the admin portal with PIN.
                  </span>
                ) : (
                  <span>
                    Need to temporarily pause public access while updating menus, prices, or taking a break? Toggle pause on with one click.
                  </span>
                )}
              </p>
            </div>

            {/* Right: Master Toggle & Quick Action */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={handleToggle}
                className={`relative inline-flex items-center gap-3 px-5 py-3 rounded-2xl text-sm font-black transition-all cursor-pointer shadow-sm ${
                  isPaused
                    ? 'bg-amber-500 hover:bg-amber-400 text-neutral-950 hover:shadow-md'
                    : 'bg-neutral-900 hover:bg-neutral-800 text-white hover:shadow-md'
                }`}
              >
                {isPaused ? (
                  <>
                    <PlayCircle className="w-5 h-5 fill-current" />
                    <span>Resume Website Now</span>
                  </>
                ) : (
                  <>
                    <PauseCircle className="w-5 h-5 text-amber-400" />
                    <span>Pause Website Access</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowPreview(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-3 rounded-2xl text-xs font-bold text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 transition-colors border border-neutral-200"
                title="Preview what customers see"
              >
                <Eye className="w-4 h-4 text-neutral-600" />
                <span className="hidden sm:inline">Preview Screen</span>
              </button>
            </div>
          </div>
        </div>

        {/* Configuration Body */}
        <div className="p-6 sm:p-7 bg-neutral-50/50">
          
          {/* Form Fields */}
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Notice Title */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Notice Headline / Title
                </label>
                <input
                  type="text"
                  value={pauseTitle}
                  onChange={(e) => setPauseTitle(e.target.value)}
                  placeholder="e.g. Updating Our Seasonal Menus"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 bg-white text-neutral-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>

              {/* Expected Resumption */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Expected Resumption / Return Time
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={expectedBack}
                    onChange={(e) => setExpectedBack(e.target.value)}
                    placeholder="e.g. Today at 5:00 PM or Check back soon"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-neutral-300 bg-white text-neutral-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Description Message */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                Customer Notice Message
              </label>
              <textarea
                rows={3}
                value={pauseMessage}
                onChange={(e) => setPauseMessage(e.target.value)}
                placeholder="Write a clear explanation for visitors..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 bg-white text-neutral-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-medium"
              />
            </div>

            {/* Advanced Options Accordion */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                <span>Scope &amp; Emergency Contact Settings</span>
                {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showAdvanced && (
                <div className="mt-3 p-4 rounded-2xl bg-white border border-neutral-200 space-y-4 animate-in fade-in duration-200">
                  
                  {/* Branch Scope */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                      Pause Scope
                    </label>
                    <p className="text-[11px] text-neutral-500 mb-2.5">
                      Select specific branches to pause, or leave all unselected for a Global Pause across the entire website.
                    </p>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setPausedBranches([])}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                          pausedBranches.length === 0
                            ? 'bg-neutral-900 text-white border-neutral-900'
                            : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                        }`}
                      >
                        <Globe className="w-3.5 h-3.5" />
                        <span>All Branches (Global Website Pause)</span>
                      </button>

                      {branches.map(b => {
                        const isSelected = pausedBranches.includes(b.slug);
                        return (
                          <button
                            key={b.slug}
                            type="button"
                            onClick={() => toggleBranch(b.slug)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-amber-500 text-neutral-950 border-amber-600 font-extrabold shadow-2xs'
                                : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                            }`}
                          >
                            <Store className="w-3.5 h-3.5" />
                            <span>{b.name}</span>
                            {isSelected && <Check className="w-3 h-3 text-neutral-950 stroke-[3]" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-neutral-100">
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
                        Inquiry Phone / WhatsApp
                      </label>
                      <div className="relative">
                        <Phone className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                          placeholder="+91 95625 36000"
                          className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-200 text-xs focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
                        Inquiry Email
                      </label>
                      <div className="relative">
                        <Mail className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
                        <input
                          type="email"
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          placeholder="info@asadocafe.com"
                          className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-200 text-xs focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Save Buttons & Feedback */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  setPauseTitle(DEFAULT_MAINTENANCE_SETTINGS.pauseTitle);
                  setPauseMessage(DEFAULT_MAINTENANCE_SETTINGS.pauseMessage);
                  setExpectedBack(DEFAULT_MAINTENANCE_SETTINGS.expectedBack || '');
                  setContactPhone(DEFAULT_MAINTENANCE_SETTINGS.contactPhone || '');
                  setContactEmail(DEFAULT_MAINTENANCE_SETTINGS.contactEmail || '');
                  setPausedBranches([]);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Default Notice</span>
              </button>

              <div className="flex items-center gap-3">
                {saveSuccess && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full animate-in fade-in">
                    <Check className="w-3.5 h-3.5" />
                    <span>Settings Updated &amp; Synced!</span>
                  </span>
                )}

                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isSaving ? 'Saving Changes...' : 'Save Settings'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Customer Screen Live Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col">
          <div className="bg-neutral-900 border-b border-neutral-800 px-4 sm:px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white text-xs sm:text-sm font-bold">
              <Eye className="w-4 h-4 text-amber-400" />
              <span>Customer View Preview (How customers see Asado Cafe while paused)</span>
            </div>
            <button
              onClick={() => setShowPreview(false)}
              className="px-3.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Close Preview
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <MaintenanceScreen
              settings={{
                isPaused: true,
                pauseTitle: pauseTitle || DEFAULT_MAINTENANCE_SETTINGS.pauseTitle,
                pauseMessage: pauseMessage || DEFAULT_MAINTENANCE_SETTINGS.pauseMessage,
                expectedBack,
                contactPhone,
                contactEmail,
                pausedBranches
              }}
              isAdmin={true}
              onTurnOff={() => {
                setShowPreview(false);
                if (isPaused) handleToggle();
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
