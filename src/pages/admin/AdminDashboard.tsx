import { useState } from 'react';
import { Link } from 'react-router-dom';
import { branches } from '../../data';
import { Users, TrendingUp, DollarSign, Store, Plus, Trash2 } from 'lucide-react';
import { useBanners, Banner } from '../../hooks/useBanners';

export default function AdminDashboard() {
  const { banners, addBanner, removeBanner } = useBanners();
  const [isAdding, setIsAdding] = useState(false);
  const [newBanner, setNewBanner] = useState<Partial<Banner>>({
    title: '',
    subtitle: '',
    tagText: "Today's Special",
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-950',
    tagBg: 'bg-amber-200',
    tagColor: 'text-amber-900',
    branchSlug: 'all',
  });

  const handleAdd = () => {
    if (!newBanner.title || !newBanner.subtitle) return;
    addBanner({
      id: Date.now().toString(),
      ...newBanner
    } as Banner);
    setIsAdding(false);
    setNewBanner({
      title: '',
      subtitle: '',
      tagText: "Today's Special",
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-950',
      tagBg: 'bg-amber-200',
      tagColor: 'text-amber-900',
      branchSlug: 'all',
    });
  };

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Welcome Back, Admin</h1>
        <p className="text-neutral-500">Here's what's happening across all Asado branches today.</p>
      </div>

      {/* Promotions/Banners Management */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-neutral-900">Manage Promotional Banners</h2>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors"
          >
            {isAdding ? 'Cancel' : <><Plus className="w-4 h-4" /> Add Banner</>}
          </button>
        </div>

        {isAdding && (
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm mb-6">
            <h3 className="font-bold mb-4">Create New Banner</h3>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Title</label>
                <input 
                  type="text" 
                  value={newBanner.title}
                  onChange={(e) => setNewBanner({...newBanner, title: e.target.value})}
                  className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  placeholder="e.g., Buy 2 Get 1 Free"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Subtitle</label>
                <input 
                  type="text" 
                  value={newBanner.subtitle}
                  onChange={(e) => setNewBanner({...newBanner, subtitle: e.target.value})}
                  className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  placeholder="e.g., Valid this weekend"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Tag Text</label>
                <input 
                  type="text" 
                  value={newBanner.tagText}
                  onChange={(e) => setNewBanner({...newBanner, tagText: e.target.value})}
                  className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  placeholder="e.g., Today's Special"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Target Branch</label>
                <select 
                  className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 text-sm text-neutral-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  value={newBanner.branchSlug || 'all'}
                  onChange={(e) => setNewBanner({...newBanner, branchSlug: e.target.value})}
                >
                  <option value="all">All Branches</option>
                  <option value="kollam">Kollam</option>
                  <option value="alappuzha">Alappuzha</option>
                  <option value="varkala">Varkala</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Color Theme</label>
                <select 
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  onChange={(e) => {
                    const theme = e.target.value;
                    if (theme === 'amber') {
                      setNewBanner({...newBanner, bgColor: 'bg-amber-50', textColor: 'text-amber-950', tagBg: 'bg-amber-200', tagColor: 'text-amber-900'});
                    } else if (theme === 'blue') {
                      setNewBanner({...newBanner, bgColor: 'bg-blue-50', textColor: 'text-blue-950', tagBg: 'bg-blue-200', tagColor: 'text-blue-900'});
                    } else if (theme === 'green') {
                      setNewBanner({...newBanner, bgColor: 'bg-emerald-50', textColor: 'text-emerald-950', tagBg: 'bg-emerald-200', tagColor: 'text-emerald-900'});
                    }
                  }}
                >
                  <option value="amber">Warm (Amber)</option>
                  <option value="blue">Cool (Blue)</option>
                  <option value="green">Fresh (Green)</option>
                </select>
              </div>
            </div>
            
            <button 
              onClick={handleAdd}
              className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors"
            >
              Save Banner
            </button>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {banners.map((banner) => (
            <div key={banner.id} className={`relative p-6 rounded-2xl border ${banner.bgColor} ${banner.bgColor === 'bg-amber-50' ? 'border-amber-200' : 'border-neutral-200'} shadow-sm flex flex-col justify-center items-center text-center`}>
              <button 
                onClick={() => removeBanner(banner.id)}
                className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              
              <span className={`inline-block px-3 py-1 ${banner.tagBg} ${banner.tagColor} rounded-full text-xs font-bold uppercase tracking-wider mb-3`}>
                {banner.tagText} • {banner.branchSlug === "all" || !banner.branchSlug ? "All Branches" : banner.branchSlug}
              </span>
              <h3 className={`text-xl font-bold mb-1 ${banner.textColor}`}>{banner.title}</h3>
              <p className={`text-sm opacity-80 ${banner.textColor}`}>{banner.subtitle}</p>
            </div>
          ))}
          
          {banners.length === 0 && (
            <div className="col-span-2 text-center p-8 bg-neutral-50 rounded-2xl border border-dashed border-neutral-300 text-neutral-500">
              No active banners. Add one above to display on homepages.
            </div>
          )}
        </div>
      </div>

      {/* Quick Access Branches */}
      <h2 className="text-xl font-bold text-neutral-900 mb-6">Manage Branches</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {branches.map(branch => (
          <Link 
            to={`/admin/branch/${branch.slug}`} 
            key={branch.id}
            className="group bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden hover:border-amber-500 transition-colors"
          >
            <div className="h-32 overflow-hidden relative bg-neutral-800">
              {/* Image Placeholder */}
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">
                {branch.status === 'active' ? (
                  <span className="text-green-700">Active</span>
                ) : (
                  <span className="text-amber-700">Soon</span>
                )}
              </div>
            </div>
            
            <div className="p-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-neutral-900 mb-1">{branch.name}</h3>
                <p className="text-sm text-neutral-500">{branch.city}</p>
              </div>
              <span className="text-amber-600 text-sm font-medium">Manage &rarr;</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
