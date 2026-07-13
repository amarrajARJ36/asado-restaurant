const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/BranchManager.tsx', 'utf-8');

const handleAddMenu = `
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
      const storageRef = ref(storage, \`gallery/\${branchId}/\${Date.now()}_\${file.name}\`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setNewImageUrl(url);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  return (
`;

code = code.replace("  return (", handleAddMenu);

const menuTab = `          {activeTab === 'menu' && (
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
          )}`;

const catRegex = /\{\s*activeTab\s*===\s*'menu'\s*&&\s*\([\s\S]*?\)\s*\}/;
code = code.replace(catRegex, menuTab);

const catTab = `          {activeTab === 'categories' && (
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
          )}`;

const oldCatRegex = /\{\s*activeTab\s*===\s*'categories'\s*&&\s*\([\s\S]*?\)\s*\}/;
code = code.replace(oldCatRegex, catTab);

const newGalleryInput = `<div className="flex-1">
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
                      accept="image/jpeg,image/png,video/mp4" 
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
                </div>`;

const oldGalleryRegex = /<div className="flex-1">\s*<label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">Image URL<\/label>\s*<input\s*type="text"\s*value=\{newImageUrl\}\s*onChange=\{\(e\) => setNewImageUrl\(e\.target\.value\)\}\s*placeholder="https:\/\/images\.unsplash\.com\/\.\.\."\s*className="w-full px-4 py-2 bg-white border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"\s*\/>\s*<\/div>/;

code = code.replace(oldGalleryRegex, newGalleryInput);

// Also handle the video rendering in gallery
const newGalleryMap = `{galleryImages.map((img) => (
                  <div key={img.id} className="group relative rounded-xl overflow-hidden border border-neutral-200 aspect-square">
                    {img.url.includes('.mp4') || img.url.includes('video') ? (
                      <video src={img.url} className="w-full h-full object-cover" autoPlay muted loop playsInline />
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
                ))}`;

const oldGalleryMap = /\{galleryImages\.map\(\(img\) => \([\s\S]*?\}\)\)\}/;
code = code.replace(oldGalleryMap, newGalleryMap);

fs.writeFileSync('src/pages/admin/BranchManager.tsx', code);
console.log("Updated BranchManager.tsx completely!");
