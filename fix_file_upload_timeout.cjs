const fs = require('fs');

let code = fs.readFileSync('src/pages/admin/BranchManager.tsx', 'utf-8');

const badUpload = `  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !branchId) return;
    setUploading(true);
    try {
      const storageRef = ref(storage, \`gallery/\${branchId}/\${Date.now()}_\${file.name}\`);
      await uploadBytes(storageRef, file);`;

const goodUpload = `  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !branchId) return;
    setUploading(true);
    try {
      storage.maxUploadRetryTime = 15000; // fail fast after 15 seconds if storage is not set up
      const storageRef = ref(storage, \`gallery/\${branchId}/\${Date.now()}_\${file.name}\`);
      
      const uploadTask = uploadBytes(storageRef, file);
      
      // Add a simple timeout promise race just in case
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Upload timed out. Please ensure Firebase Storage is initialized in your Firebase Console.")), 15000);
      });
      
      await Promise.race([uploadTask, timeoutPromise]);`;

code = code.replace(badUpload, goodUpload);

fs.writeFileSync('src/pages/admin/BranchManager.tsx', code);
