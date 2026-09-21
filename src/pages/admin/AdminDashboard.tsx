import { useState } from 'react';
import { Link } from 'react-router-dom';
import { branches } from '../../data';
import { Plus, Trash2, Edit2, Eye, EyeOff, Check, X } from 'lucide-react';
import { useBanners, Banner } from '../../hooks/useBanners';

export default function AdminDashboard() {
  const { allBanners, addBanner, updateBanner, toggleBanner, removeBanner } = useBanners(undefined, { includeInactive: true });
  const [isAdding, setIsAdding] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>('all');

  const [newBanner, setNewBanner] = useState<Partial<Banner>>({
    title: '',
    subtitle: '',
    tagText: "Today's Special",
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-950',
    tagBg: 'bg-amber-200',
    tagColor: 'text-amber-900',
    branchSlug: 'all',
    isActive: true,
  });

  const handleAdd = async () => {
    if (!newBanner.title?.trim() || !newBanner.subtitle?.trim()) {
      alert("Please fill in both banner title and subtitle/offer text.");
      return;
    }
    await addBanner({
      ...newBanner,
      title: newBanner.title.trim(),
      subtitle: newBanner.subtitle.trim(),
      tagText: newBanner.tagText?.trim() || "Today's Special",
    });
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
      isActive: true,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingBanner) return;
    if (!editingBanner.title.trim() || !editingBanner.subtitle.trim()) {
      alert("Please enter both title and subtitle/offer text.");
      return;
    }
    await updateBanner(editingBanner.id, {
      title: editingBanner.title.trim(),
      subtitle: editingBanner.subtitle.trim(),
      tagText: editingBanner.tagText.trim(),
      branchSlug: editingBanner.branchSlug || 'all',
      bgColor: editingBanner.bgColor,
      textColor: editingBanner.textColor,
      tagBg: editingBanner.tagBg,
      tagColor: editingBanner.tagColor,
      isActive: editingBanner.isActive,
    });
    setEditingBanner(null);
  };

  const filteredBanners = selectedBranchFilter === 'all'
    ? allBanners
    : allBanners.filter(b => b.branchSlug === 'all' || b.branchSlug === selectedBranchFilter);

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Welcome Back, Admin</h1>
        <p className="text-neutral-500">Manage promotions, offers, and menus across all Asado branches.</p>
      </div>

      {/* Promotions/Banners Management */}
      <div className="mb-12 bg-white rounded-2xl border border-neutral-200 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-neutral-900">Manage Offers & Promotional Banners</h2>
            <p className="text-sm text-neutral-500 mt-0.5">Control announcement banners shown across branch homepages and menus.</p>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={selectedBranchFilter}
              onChange={(e) => setSelectedBranchFilter(e.target.value)}
              className="bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-2 text-sm text-neutral-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              <option value="all">All Branches</option>
              <option value="kollam">Kollam</option>
              <option value="alappuzha">Alappuzha</option>
              <option value="varkala">Varkala</option>
            </select>

            <button 
              onClick={() => { setIsAdding(!isAdding); setEditingBanner(null); }}
              className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors shrink-0"
            >
              {isAdding ? 'Cancel' : <><Plus className="w-4 h-4" /> Add Banner</>}
            </button>
          </div>
        </div>

        {/* Add Banner Form */}
        {isAdding && (
          <div className="bg-neutral-50 p-6 rounded-xl border border-neutral-200 mb-8 animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-neutral-900">Create New Offer Banner</h3>
              <button onClick={() => setIsAdding(false)} className="text-neutral-400 hover:text-neutral-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">Banner Title</label>
                <input 
                  type="text" 
                  value={newBanner.title}
                  onChange={(e) => setNewBanner({...newBanner, title: e.target.value})}
                  className="w-full bg-white border border-neutral-300 rounded-lg px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  placeholder="e.g., Buy 2 Mojitos Get 1 Free"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">Offer Details / Subtitle</label>
                <input 
                  type="text" 
                  value={newBanner.subtitle}
                  onChange={(e) => setNewBanner({...newBanner, subtitle: e.target.value})}
                  className="w-full bg-white border border-neutral-300 rounded-lg px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  placeholder="e.g., Valid all weekend by the lakeside."
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">Tag / Badge Text</label>
                <input 
                  type="text" 
                  value={newBanner.tagText}
                  onChange={(e) => setNewBanner({...newBanner, tagText: e.target.value})}
                  className="w-full bg-white border border-neutral-300 rounded-lg px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  placeholder="e.g., Today's Special, Weekend Offer..."
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">Target Branch</label>
                <select 
                  className="w-full bg-white border border-neutral-300 rounded-lg px-3.5 py-2.5 text-sm text-neutral-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  value={newBanner.branchSlug || 'all'}
                  onChange={(e) => setNewBanner({...newBanner, branchSlug: e.target.value})}
                >
                  <option value="all">All Branches (Global)</option>
                  <option value="kollam">Kollam Branch</option>
                  <option value="alappuzha">Alappuzha Branch</option>
                  <option value="varkala">Varkala Branch</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">Color Theme</label>
                <select 
                  className="w-full bg-white border border-neutral-300 rounded-lg px-3.5 py-2.5 text-sm text-neutral-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  onChange={(e) => {
                    const theme = e.target.value;
                    if (theme === 'amber') {
                      setNewBanner({...newBanner, bgColor: 'bg-amber-50', textColor: 'text-amber-950', tagBg: 'bg-amber-200', tagColor: 'text-amber-900'});
                    } else if (theme === 'blue') {
                      setNewBanner({...newBanner, bgColor: 'bg-blue-50', textColor: 'text-blue-950', tagBg: 'bg-blue-200', tagColor: 'text-blue-900'});
                    } else if (theme === 'green') {
                      setNewBanner({...newBanner, bgColor: 'bg-emerald-50', textColor: 'text-emerald-950', tagBg: 'bg-emerald-200', tagColor: 'text-emerald-900'});
                    } else if (theme === 'dark') {
                      setNewBanner({...newBanner, bgColor: 'bg-neutral-900', textColor: 'text-white', tagBg: 'bg-amber-500', tagColor: 'text-neutral-950'});
                    }
                  }}
                >
                  <option value="amber">Warm Amber</option>
                  <option value="blue">Cool Blue</option>
                  <option value="green">Fresh Emerald</option>
                  <option value="dark">Dark Luxury</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-6">
                <input 
                  type="checkbox" 
                  id="newBannerActive" 
                  checked={newBanner.isActive !== false} 
                  onChange={(e) => setNewBanner({...newBanner, isActive: e.target.checked})}
                  className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500" 
                />
                <label htmlFor="newBannerActive" className="text-sm font-semibold text-neutral-800">
                  Publish Immediately (Active)
                </label>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 border border-neutral-300 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleAdd}
                className="bg-amber-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-amber-700 transition-colors shadow-sm"
              >
                Create Banner
              </button>
            </div>
          </div>
        )}

        {/* Edit Banner Modal/Inline */}
        {editingBanner && (
          <div className="bg-amber-50/70 p-6 rounded-xl border border-amber-200 mb-8 animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-neutral-900 flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-amber-600" /> Edit Offer Banner
              </h3>
              <button onClick={() => setEditingBanner(null)} className="text-neutral-400 hover:text-neutral-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">Banner Title</label>
                <input 
                  type="text" 
                  value={editingBanner.title}
                  onChange={(e) => setEditingBanner({...editingBanner, title: e.target.value})}
                  className="w-full bg-white border border-neutral-300 rounded-lg px-3.5 py-2.5 text-sm text-neutral-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">Offer Details / Subtitle</label>
                <input 
                  type="text" 
                  value={editingBanner.subtitle}
                  onChange={(e) => setEditingBanner({...editingBanner, subtitle: e.target.value})}
                  className="w-full bg-white border border-neutral-300 rounded-lg px-3.5 py-2.5 text-sm text-neutral-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">Tag / Badge Text</label>
                <input 
                  type="text" 
                  value={editingBanner.tagText}
                  onChange={(e) => setEditingBanner({...editingBanner, tagText: e.target.value})}
                  className="w-full bg-white border border-neutral-300 rounded-lg px-3.5 py-2.5 text-sm text-neutral-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">Target Branch</label>
                <select 
                  className="w-full bg-white border border-neutral-300 rounded-lg px-3.5 py-2.5 text-sm text-neutral-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  value={editingBanner.branchSlug || 'all'}
                  onChange={(e) => setEditingBanner({...editingBanner, branchSlug: e.target.value})}
                >
                  <option value="all">All Branches (Global)</option>
                  <option value="kollam">Kollam</option>
                  <option value="alappuzha">Alappuzha</option>
                  <option value="varkala">Varkala</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">Theme Palette</label>
                <select 
                  className="w-full bg-white border border-neutral-300 rounded-lg px-3.5 py-2.5 text-sm text-neutral-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  value={editingBanner.bgColor?.includes('amber') ? 'amber' : editingBanner.bgColor?.includes('blue') ? 'blue' : editingBanner.bgColor?.includes('emerald') ? 'green' : 'dark'}
                  onChange={(e) => {
                    const theme = e.target.value;
                    if (theme === 'amber') {
                      setEditingBanner({...editingBanner, bgColor: 'bg-amber-50', textColor: 'text-amber-950', tagBg: 'bg-amber-200', tagColor: 'text-amber-900'});
                    } else if (theme === 'blue') {
                      setEditingBanner({...editingBanner, bgColor: 'bg-blue-50', textColor: 'text-blue-950', tagBg: 'bg-blue-200', tagColor: 'text-blue-900'});
                    } else if (theme === 'green') {
                      setEditingBanner({...editingBanner, bgColor: 'bg-emerald-50', textColor: 'text-emerald-950', tagBg: 'bg-emerald-200', tagColor: 'text-emerald-900'});
                    } else if (theme === 'dark') {
                      setEditingBanner({...editingBanner, bgColor: 'bg-neutral-900', textColor: 'text-white', tagBg: 'bg-amber-500', tagColor: 'text-neutral-950'});
                    }
                  }}
                >
                  <option value="amber">Warm Amber</option>
                  <option value="blue">Cool Blue</option>
                  <option value="green">Fresh Emerald</option>
                  <option value="dark">Dark Luxury</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-6">
                <input 
                  type="checkbox" 
                  id="editBannerActive" 
                  checked={editingBanner.isActive !== false} 
                  onChange={(e) => setEditingBanner({...editingBanner, isActive: e.target.checked})}
                  className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500" 
                />
                <label htmlFor="editBannerActive" className="text-sm font-semibold text-neutral-800">
                  Banner is Active on Website
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={() => setEditingBanner(null)}
                className="px-4 py-2 border border-neutral-300 bg-white rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveEdit}
                className="bg-neutral-900 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-black transition-colors shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}

        {/* Banners Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {filteredBanners.map((banner) => {
            const isActive = banner.isActive !== false;
            return (
              <div 
                key={banner.id} 
                className={`relative p-6 rounded-2xl border transition-all ${
                  isActive 
                    ? `${banner.bgColor || 'bg-amber-50'} border-neutral-300 shadow-sm` 
                    : 'bg-neutral-100 border-dashed border-neutral-300 opacity-75'
                } flex flex-col justify-between`}
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-block px-3 py-1 ${banner.tagBg || 'bg-amber-200'} ${banner.tagColor || 'text-amber-900'} rounded-full text-xs font-bold uppercase tracking-wider`}>
                      {banner.tagText}
                    </span>
                    <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-black/10 text-neutral-700">
                      {banner.branchSlug === "all" || !banner.branchSlug ? "All Branches" : `${banner.branchSlug}`}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Active toggle button */}
                    <button
                      onClick={() => toggleBanner(banner.id, !isActive)}
                      title={isActive ? "Turn Off Banner" : "Turn On Banner"}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
                          : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300 border border-neutral-300'
                      }`}
                    >
                      {isActive ? (
                        <>
                          <Eye className="w-3 h-3 text-emerald-600" />
                          <span>Active</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3 text-neutral-500" />
                          <span>Off</span>
                        </>
                      )}
                    </button>

                    {/* Edit button */}
                    <button 
                      onClick={() => { setEditingBanner(banner); setIsAdding(false); }}
                      className="p-1.5 text-neutral-500 hover:text-amber-700 hover:bg-white/80 rounded-lg transition-colors"
                      title="Edit Banner Details"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Delete button */}
                    <button 
                      onClick={() => {
                        if (confirm(`Delete banner "${banner.title}"?`)) {
                          removeBanner(banner.id);
                        }
                      }}
                      className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Banner"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="py-2">
                  <h3 className={`text-xl font-bold mb-1 ${isActive ? (banner.textColor || 'text-neutral-900') : 'text-neutral-600 line-through'}`}>
                    {banner.title}
                  </h3>
                  <p className={`text-sm ${isActive ? (banner.textColor || 'text-neutral-800') : 'text-neutral-500'} opacity-85 leading-relaxed`}>
                    {banner.subtitle}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-between text-xs text-neutral-500">
                  <span>Status: <strong className={isActive ? 'text-emerald-700' : 'text-neutral-500'}>{isActive ? 'Displayed to visitors' : 'Turned Off (Hidden)'}</strong></span>
                  <button 
                    onClick={() => toggleBanner(banner.id, !isActive)}
                    className="font-medium text-amber-700 hover:underline"
                  >
                    {isActive ? 'Click to turn off' : 'Click to turn on'}
                  </button>
                </div>
              </div>
            );
          })}
          
          {filteredBanners.length === 0 && (
            <div className="col-span-2 text-center p-12 bg-neutral-50 rounded-2xl border border-dashed border-neutral-300 text-neutral-500">
              <p className="text-base font-medium mb-1">No banners found for {selectedBranchFilter === 'all' ? 'any branch' : selectedBranchFilter}.</p>
              <p className="text-sm">Click "Add Banner" above to create an offer announcement.</p>
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
