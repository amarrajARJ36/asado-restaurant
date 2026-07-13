const fs = require('fs');

let code = fs.readFileSync('src/pages/admin/BranchManager.tsx', 'utf-8');

// The block that was incorrectly inserted inside useEffect
const badBlock = `  const handleAddMenu = async () => {
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

  `;

code = code.replace(badBlock, "");

// Now we insert it before the main `return (`

code = code.replace("  return (", badBlock + "  return (");

fs.writeFileSync('src/pages/admin/BranchManager.tsx', code);
