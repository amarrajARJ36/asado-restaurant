import { useParams } from 'react-router-dom';
import { branches } from '../../data';
import { useState, useEffect } from 'react';
import { Image, Utensils, Tag, Store, Plus, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { collection, onSnapshot, doc, setDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';

export default function BranchManager() {
  const { branchId } = useParams();
  const branch = branches.find(b => b.slug === branchId);
  const [activeTab, setActiveTab] = useState('menu');
  
  // Gallery State
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageCategory, setNewImageCategory] = useState('Food');

  const galleryCategories = ['Food', 'Ambience', 'Lake View', 'Boating', 'Events', 'Decorations'];

  useEffect(() => {
    if (!branchId) return;
    const q = query(collection(db, 'galleryImages'), where('branchSlug', '==', branchId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const images = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setGalleryImages(images.sort((a: any, b: any) => b.createdAt - a.createdAt));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'galleryImages');
    });

    return () => unsubscribe();
  }, [branchId]);

  if (!branch) return <div>Branch not found</div>;

  const tabs = [
    { id: 'menu', name: 'Menu Items', icon: Utensils },
    { id: 'categories', name: 'Categories', icon: Tag },
    { id: 'offers', name: 'Offers Banner', icon: Tag },
    { id: 'gallery', name: 'Gallery', icon: Image },
  ];

  const handleAddImage = async () => {
    if (!newImageUrl) return;
    const id = Date.now().toString();
    const newImg = {
      url: newImageUrl,
      category: newImageCategory,
      branchSlug: branchId,
      createdAt: Date.now()
    };
    try {
      await setDoc(doc(db, 'galleryImages', id), newImg);
      setNewImageUrl('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `galleryImages/${id}`);
    }
  };

  const handleRemoveImage = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'galleryImages', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `galleryImages/${id}`);
    }
  };

  return (
    <div className="max-w-5xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Manage {branch.name}</h1>
          <p className="text-neutral-500">Update content specifically for the {branch.name} branch.</p>
        </div>
        <div className="bg-white border border-neutral-200 px-4 py-2 rounded-lg text-sm font-medium">
          Status: {branch.status === 'active' ? <span className="text-green-600">Active</span> : <span className="text-amber-600">Coming Soon</span>}
        </div>
      </div>

      <div className="flex gap-8 items-start">
        {/* Vertical Tabs */}
        <div className="w-64 shrink-0 space-y-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors text-left",
                  activeTab === tab.id ? "bg-white border border-neutral-200 shadow-sm text-neutral-900" : "text-neutral-600 hover:bg-neutral-200/50"
                )}
              >
                <Icon className={cn("w-4 h-4", activeTab === tab.id ? "text-amber-600" : "text-neutral-400")} />
                {tab.name}
              </button>
            )
          })}
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 bg-white border border-neutral-200 rounded-2xl p-8 min-h-[500px]">
          {activeTab === 'offers' && (
            <div>
              <h2 className="text-xl font-bold mb-6">Offers Banner</h2>
              <p className="text-neutral-500 mb-6">This banner appears on the main brand page and branch home page.</p>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Banner Text</label>
                  <input 
                    type="text" 
                    defaultValue={branch.slug === 'kollam' ? "See Live Fifa 2026 Matches (Everyday)" : branch.slug === 'alappuzha' ? "Live Music Every Saturday" : ""}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="bannerActive" defaultChecked className="w-4 h-4 text-amber-600 rounded" />
                  <label htmlFor="bannerActive" className="text-sm font-medium text-neutral-700">Enable Banner</label>
                </div>
                <button className="bg-neutral-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-black transition-colors">
                  Save Banner
                </button>
              </div>
            </div>
          )}

          {activeTab === 'menu' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Menu Items</h2>
                <button className="bg-amber-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-amber-700">
                  + Add Item
                </button>
              </div>
              <p className="text-neutral-500 mb-6">Manage the digital menu for {branch.name}.</p>
              
              <div className="border border-neutral-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-neutral-50 border-b border-neutral-200">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-neutral-600">Item</th>
                      <th className="px-4 py-3 font-semibold text-neutral-600">Price</th>
                      <th className="px-4 py-3 font-semibold text-neutral-600">Category</th>
                      <th className="px-4 py-3 font-semibold text-neutral-600">Status</th>
                      <th className="px-4 py-3 text-right font-semibold text-neutral-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    <tr>
                      <td className="px-4 py-3 font-medium">Signature BBQ Ribs</td>
                      <td className="px-4 py-3">₹850</td>
                      <td className="px-4 py-3">BBQ</td>
                      <td className="px-4 py-3"><span className="text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-bold">Active</span></td>
                      <td className="px-4 py-3 text-right">
                        <button className="text-amber-600 hover:underline">Edit</button>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium">Lotus Stem</td>
                      <td className="px-4 py-3">₹320</td>
                      <td className="px-4 py-3">Starters</td>
                      <td className="px-4 py-3"><span className="text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-bold">Active</span></td>
                      <td className="px-4 py-3 text-right">
                        <button className="text-amber-600 hover:underline">Edit</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'gallery' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Gallery Management</h2>
              </div>
              <p className="text-neutral-500 mb-6">Organize and upload images to the {branch.name} gallery.</p>

              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 mb-8 flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">Image URL</label>
                  <input 
                    type="text" 
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-4 py-2 bg-white border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
                <div className="w-48">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">Category</label>
                  <select 
                    value={newImageCategory}
                    onChange={(e) => setNewImageCategory(e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  >
                    {galleryCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <button 
                  onClick={handleAddImage}
                  className="bg-neutral-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-black transition-colors flex items-center gap-2 text-sm h-[38px]"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {galleryImages.map((img) => (
                  <div key={img.id} className="group relative rounded-xl overflow-hidden border border-neutral-200 aspect-square">
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4">
                      <div className="self-end">
                        <button 
                          onClick={() => handleRemoveImage(img.id)}
                          className="bg-white/20 hover:bg-red-500 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="bg-white text-neutral-900 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full self-start">
                        {img.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
                <Store className="w-8 h-8 text-neutral-400" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 mb-2 capitalize">Categories Management</h3>
              <p className="text-neutral-500 max-w-sm">This module allows you to independently manage the categories for {branch.name} without affecting other branches.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
