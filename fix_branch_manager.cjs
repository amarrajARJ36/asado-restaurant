const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/BranchManager.tsx', 'utf-8');

// 1. Add state for menu uploads
const stateSearch = `const [menuItems, setMenuItems] = useState<any[]>([]);`;
const stateReplace = `const [menuItems, setMenuItems] = useState<any[]>([]);
  const menuFileInputRef = useRef<HTMLInputElement>(null);
  const [targetMenuId, setTargetMenuId] = useState<string | null>(null);
  const [uploadingMenuId, setUploadingMenuId] = useState<string | null>(null);`;
code = code.replace(stateSearch, stateReplace);

// 2. Add the upload handler function
const handlerSearch = `const handleAddMenu = async () => {`;
const handlerReplace = `const triggerMenuUpload = (menuId: string) => {
    setTargetMenuId(menuId);
    if (menuFileInputRef.current) menuFileInputRef.current.click();
  };

  const handleMenuImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const menuId = targetMenuId;
    if (!file || !branchId || !menuId) return;

    setUploadingMenuId(menuId);
    try {
      storage.maxUploadRetryTime = 15000;
      const storageRef = ref(storage, \`menu/\${branchId}/\${Date.now()}_\${file.name}\`);
      const uploadTask = uploadBytes(storageRef, file);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Upload timed out. Check Storage rules or initialization.")), 15000);
      });
      
      await Promise.race([uploadTask, timeoutPromise]);
      const url = await getDownloadURL(storageRef);
      
      await setDoc(doc(db, 'menuItems', menuId), { imageUrl: url }, { merge: true });
    } catch (error) {
      console.error(error);
      alert("Image upload failed: " + (error as Error).message);
    } finally {
      setUploadingMenuId(null);
      setTargetMenuId(null);
      if (menuFileInputRef.current) menuFileInputRef.current.value = '';
    }
  };

  const handleAddMenu = async () => {`;
code = code.replace(handlerSearch, handlerReplace);

// 3. Add table header and hidden input
const theadSearch = `<th className="px-4 py-3 text-right">Actions</th>`;
const theadReplace = `<th className="px-4 py-3 text-center">Image</th>
                        <th className="px-4 py-3 text-right">Actions</th>`;
code = code.replace(theadSearch, theadReplace);

// 4. Add table data with upload button
const tbodySearch = `<td className="px-4 py-3 text-right">
                          <button onClick={() => handleRemoveMenu(item.id)} className="text-red-600 hover:underline">Delete</button>
                        </td>`;
const tbodyReplace = `<td className="px-4 py-3 text-center">
                          {item.imageUrl ? (
                            <div className="flex flex-col items-center gap-2">
                              <img src={item.imageUrl} alt="Menu" className="w-12 h-12 object-cover rounded shadow-sm" />
                              <button onClick={() => triggerMenuUpload(item.id)} className="text-xs text-amber-600 hover:underline">Change</button>
                            </div>
                          ) : (
                            <button onClick={() => triggerMenuUpload(item.id)} disabled={uploadingMenuId === item.id} className="text-xs text-neutral-500 hover:text-amber-600 border border-neutral-300 rounded px-2 py-1">
                              {uploadingMenuId === item.id ? '...' : 'Upload'}
                            </button>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => handleRemoveMenu(item.id)} className="text-red-600 hover:underline">Delete</button>
                        </td>`;
code = code.replace(tbodySearch, tbodyReplace);

// 5. Add the hidden input right before the table
const tableWrapSearch = `<table className="w-full text-left text-sm">`;
const tableWrapReplace = `<input type="file" accept="image/*" ref={menuFileInputRef} onChange={handleMenuImageUpload} className="hidden" />
                <table className="w-full text-left text-sm">`;
code = code.replace(tableWrapSearch, tableWrapReplace);

// 6. Fix colspan for empty state
const emptyStateSearch = `<td colSpan={4} className="px-4 py-8 text-center text-neutral-500">No menu items found.</td>`;
const emptyStateReplace = `<td colSpan={5} className="px-4 py-8 text-center text-neutral-500">No menu items found.</td>`;
code = code.replace(emptyStateSearch, emptyStateReplace);

fs.writeFileSync('src/pages/admin/BranchManager.tsx', code);
