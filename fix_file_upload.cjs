const fs = require('fs');

let code = fs.readFileSync('src/pages/admin/BranchManager.tsx', 'utf-8');

const badUpload = `  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
  };`;

const goodUpload = `  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !branchId) return;
    setUploading(true);
    try {
      const storageRef = ref(storage, \`gallery/\${branchId}/\${Date.now()}_\${file.name}\`);
      await uploadBytes(storageRef, file);
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
  };`;

code = code.replace(badUpload, goodUpload);

fs.writeFileSync('src/pages/admin/BranchManager.tsx', code);
