import { Link } from 'react-router-dom';
import { branches } from '../../data';
import { 
  Store, 
  ArrowRight, 
  UtensilsCrossed, 
  FolderTree, 
  Image, 
  Tag, 
  ExternalLink,
  MapPin,
  CheckCircle2,
  Clock
} from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              Admin Control Center
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
              Welcome Back, Admin
            </h1>
            <p className="text-neutral-500 text-sm mt-1 max-w-2xl">
              Select an individual branch below to update its menu dishes, categories, promotional banners, and gallery media.
            </p>
          </div>
          
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Link
              to="/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-neutral-700 hover:text-neutral-950 bg-neutral-100 hover:bg-neutral-200 transition-colors"
            >
              <span>View Live Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Branches List */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
            <Store className="w-5 h-5 text-amber-600" />
            <span>Asado Branches</span>
          </h2>
          <span className="text-xs font-semibold text-neutral-400">
            {branches.length} Locations
          </span>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {branches.map(branch => {
            const isActive = branch.status === 'active';
            return (
              <div 
                key={branch.id}
                className="bg-white rounded-3xl border border-neutral-200/90 shadow-xs hover:shadow-md hover:border-amber-400 transition-all duration-300 overflow-hidden flex flex-col group"
              >
                {/* Branch Hero Image Banner */}
                <div className="h-44 overflow-hidden relative bg-neutral-900">
                  <img 
                    src={branch.heroImage} 
                    alt={branch.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-xs ${
                      isActive 
                        ? 'bg-emerald-500/90 text-white' 
                        : 'bg-amber-500/90 text-neutral-950'
                    }`}>
                      {isActive ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Active Branch</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3" />
                          <span>Coming Soon</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Branch Name on Image */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold mb-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{branch.city}, Kerala</span>
                    </div>
                    <h3 className="text-2xl font-extrabold text-white tracking-tight leading-tight">
                      {branch.name}
                    </h3>
                  </div>
                </div>
                
                {/* Branch Details */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed mb-6 font-normal">
                      {branch.description}
                    </p>

                    {/* Quick Management Links */}
                    <div className="space-y-2 mb-6">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                        Management Sections:
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Link
                          to={`/admin/branch/${branch.slug}`}
                          className="flex items-center gap-2 p-2 rounded-xl bg-neutral-50 hover:bg-amber-50 border border-neutral-100 hover:border-amber-200 text-neutral-700 hover:text-amber-900 text-xs font-semibold transition-colors"
                        >
                          <UtensilsCrossed className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span className="truncate">Menu Items</span>
                        </Link>
                        <Link
                          to={`/admin/branch/${branch.slug}`}
                          className="flex items-center gap-2 p-2 rounded-xl bg-neutral-50 hover:bg-amber-50 border border-neutral-100 hover:border-amber-200 text-neutral-700 hover:text-amber-900 text-xs font-semibold transition-colors"
                        >
                          <FolderTree className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span className="truncate">Categories</span>
                        </Link>
                        <Link
                          to={`/admin/branch/${branch.slug}`}
                          className="flex items-center gap-2 p-2 rounded-xl bg-neutral-50 hover:bg-amber-50 border border-neutral-100 hover:border-amber-200 text-neutral-700 hover:text-amber-900 text-xs font-semibold transition-colors"
                        >
                          <Tag className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span className="truncate">Offers & Banners</span>
                        </Link>
                        <Link
                          to={`/admin/branch/${branch.slug}`}
                          className="flex items-center gap-2 p-2 rounded-xl bg-neutral-50 hover:bg-amber-50 border border-neutral-100 hover:border-amber-200 text-neutral-700 hover:text-amber-900 text-xs font-semibold transition-colors"
                        >
                          <Image className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span className="truncate">Gallery</span>
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Primary Action Buttons */}
                  <div className="pt-4 border-t border-neutral-100 flex items-center justify-between gap-3">
                    <Link
                      to={`/${branch.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 flex items-center gap-1 transition-colors"
                    >
                      <span>Preview</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>

                    <Link 
                      to={`/admin/branch/${branch.slug}`} 
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs bg-neutral-900 hover:bg-amber-500 text-white hover:text-neutral-950 transition-all shadow-xs"
                    >
                      <span>Manage Branch</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
