import React from "react";
import { useParams } from 'react-router-dom';
import { branches } from '../../data';
import { useState, useEffect } from 'react';
import { Image, Utensils, Tag, Store, Plus, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { collection, onSnapshot, doc, setDoc, deleteDoc, query, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, handleFirestoreError, OperationType } from '../../lib/firebase';
import { useRef } from 'react';

export default function BranchManager() {
  const { branchId } = useParams();
  const branch = branches.find(b => b.slug === branchId);
  const [activeTab, setActiveTab] = useState('menu');
  
  // Gallery State
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [newMenuName, setNewMenuName] = useState('');
  const [newMenuPrice, setNewMenuPrice] = useState('');
  const [newMenuCategory, setNewMenuCategory] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');

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

    const qMenu = query(collection(db, 'menuItems'), where('branchSlug', '==', branchId));
    const unsubMenu = onSnapshot(qMenu, (snapshot) => {
      setMenuItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const qCat = query(collection(db, 'categories'), where('branchSlug', '==', branchId));
    const unsubCat = onSnapshot(qCat, (snapshot) => {
      setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  
return (
) => { unsubscribe(); unsubMenu(); unsubCat(); };
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

  const handleAddMenu = async () => {
    if (!newMenuName || !newMenuPrice || !newMenuCategory) return;
    const id = Date.now().toString();
    try {
      await setDoc(doc(db, 'menuItems', id), {
        name: newMenuName,
        price: newMenuPrice,
        category: newMenuCategory,
        status: 'active',
        branchSlug: branchId
      });
      setNewMenuName('');
      setNewMenuPrice('');
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'menuItems');
    }
  };

  const handleRemoveMenu = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'menuItems', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, 'menuItems');
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName) return;
    const id = Date.now().toString();
    try {
      await setDoc(doc(db, 'categories', id), {
        name: newCategoryName,
        branchSlug: branchId
      });
      setNewCategoryName('');
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'categories');
    }
  };

  const handleRemoveCategory = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'categories', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, 'categories');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !branchId) return;
    setUploading(true);
    try {
      storage.maxUploadRetryTime = 15000; // fail fast after 15 seconds if storage is not set up
      const storageRef = ref(storage, `gallery/${branchId}/${Date.now()}_${file.name}`);
      
      const uploadTask = uploadBytes(storageRef, file);
      
      // Add a simple timeout promise race just in case
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Upload timed out. Please ensure Firebase Storage is initialized in your Firebase Console.")), 15000);
      });
      
      await Promise.race([uploadTask, timeoutPromise]);
      const url = await getDownloadURL(storageRef);
      setNewImageUrl(url);
      
      // Immediately add to gallery
      const id = Date.now().toString();
      const newImg = {
        url: url,
        category: newImageCategory,
        branchSlug: branchId,
        createdAt: Date.now()
      };
      await setDoc(doc(db, 'galleryImages', id), newImg);
      setNewImageUrl('');
      alert("File uploaded successfully!");
    } catch (error: any) {
      console.error("Error uploading file:", error);
      alert("Failed to upload file. Please ensure Firebase Storage is initialized in your Firebase Console.");
    } finally {
      setUploading(false);
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
              </div>
              <p className="text-neutral-500 mb-6">Manage the digital menu for {branch.name}.</p>
              
              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 mb-8 flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">Item Name</label>
                  <input type="text" value={newMenuName} onChange={e => setNewMenuName(e.target.value)} className="w-full px-4 py-2 bg-white border border-neutral-300 rounded-lg text-sm outline-none" />
                </div>
                <div className="w-32">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">Price</label>
                  <input type="text" value={newMenuPrice} onChange={e => setNewMenuPrice(e.target.value)} className="w-full px-4 py-2 bg-white border border-neutral-300 rounded-lg text-sm outline-none" />
                </div>
                <div className="w-48">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">Category</label>
                  <select value={newMenuCategory} onChange={e => setNewMenuCategory(e.target.value)} className="w-full px-4 py-2 bg-white border border-neutral-300 rounded-lg text-sm outline-none">
                    <option value="">Select...</option>
                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <button onClick={handleAddMenu} className="bg-neutral-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-black transition-colors flex items-center gap-2 text-sm h-[38px]">
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>

              <div className="border border-neutral-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-neutral-50 border-b border-neutral-200">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-neutral-600">Item</th>
                      <th className="px-4 py-3 font-semibold text-neutral-600">Price</th>
                      <th className="px-4 py-3 font-semibold text-neutral-600">Category</th>
                      <th className="px-4 py-3 text-right font-semibold text-neutral-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {menuItems.map(item => (
                      <tr key={item.id}>
                        <td className="px-4 py-3 font-medium">{item.name}</td>
                        <td className="px-4 py-3">{item.price}</td>
                        <td className="px-4 py-3">{item.category}</td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => handleRemoveMenu(item.id)} className="text-red-600 hover:underline">Delete</button>
                        </td>
                      </tr>
                    ))}
                    {menuItems.length === 0 && (
                      <tr><td colSpan={4} className="px-4 py-8 text-center text-neutral-500">No menu items found.</td></tr>
                    )}
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
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">Image/Video URL or File</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="flex-1 px-4 py-2 bg-white border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                    <input 
                      type="file" 
                      accept="image/*,video/*" 
                      ref={fileInputRef} 
                      onChange={handleFileUpload} 
                      className="hidden" 
                    />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="bg-white border border-neutral-300 text-neutral-700 px-4 py-2 rounded-lg font-medium hover:bg-neutral-50 transition-colors text-sm"
                    >
                      {uploading ? 'Uploading...' : 'Upload'}
                    </button>
                  </div>
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
                    {img.url.toLowerCase().includes('.mp4') ? (
                      <video src={img.url} className="w-full h-full object-cover" controls muted playsInline />
                    ) : (
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                    )}
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
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Categories</h2>
              </div>
              <p className="text-neutral-500 mb-6">Manage menu categories.</p>
              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 mb-8 flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">Category Name</label>
                  <input type="text" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} className="w-full px-4 py-2 bg-white border border-neutral-300 rounded-lg text-sm outline-none" />
                </div>
                <button onClick={handleAddCategory} className="bg-neutral-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-black transition-colors flex items-center gap-2 text-sm h-[38px]">
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
              <div className="border border-neutral-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-neutral-50 border-b border-neutral-200">
                    <tr><th className="px-4 py-3 font-semibold text-neutral-600">Name</th><th className="px-4 py-3 text-right font-semibold text-neutral-600">Actions</th></tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {categories.map(c => (
                      <tr key={c.id}>
                        <td className="px-4 py-3 font-medium">{c.name}</td>
                        <td className="px-4 py-3 text-right"><button onClick={() => handleRemoveCategory(c.id)} className="text-red-600 hover:underline">Delete</button></td>
                      </tr>
                    ))}
                    {categories.length === 0 && <tr><td colSpan={2} className="px-4 py-8 text-center text-neutral-500">No categories found.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
