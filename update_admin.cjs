const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/BranchManager.tsx', 'utf-8');

code = code.replace(
  "import { collection, onSnapshot, doc, setDoc, deleteDoc, query, where } from 'firebase/firestore';",
  "import { collection, onSnapshot, doc, setDoc, deleteDoc, query, where } from 'firebase/firestore';\nimport { ref, uploadBytes, getDownloadURL } from 'firebase/storage';"
);
code = code.replace(
  "import { db, handleFirestoreError, OperationType } from '../../lib/firebase';",
  "import { db, storage, handleFirestoreError, OperationType } from '../../lib/firebase';\nimport { useRef } from 'react';"
);

code = code.replace(
  "const [newImageUrl, setNewImageUrl] = useState('');",
  "const [newImageUrl, setNewImageUrl] = useState('');\n  const [uploading, setUploading] = useState(false);\n  const fileInputRef = useRef<HTMLInputElement>(null);\n  const [menuItems, setMenuItems] = useState<any[]>([]);\n  const [newMenuName, setNewMenuName] = useState('');\n  const [newMenuPrice, setNewMenuPrice] = useState('');\n  const [newMenuCategory, setNewMenuCategory] = useState('');\n  const [categories, setCategories] = useState<any[]>([]);\n  const [newCategoryName, setNewCategoryName] = useState('');\n"
);

code = code.replace(
  "    return () => unsubscribe();\n  }, [branchId]);",
  "    const qMenu = query(collection(db, 'menuItems'), where('branchSlug', '==', branchId));\n    const unsubMenu = onSnapshot(qMenu, (snapshot) => {\n      setMenuItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));\n    });\n    const qCat = query(collection(db, 'categories'), where('branchSlug', '==', branchId));\n    const unsubCat = onSnapshot(qCat, (snapshot) => {\n      setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));\n    });\n    return () => { unsubscribe(); unsubMenu(); unsubCat(); };\n  }, [branchId]);"
);

fs.writeFileSync('src/pages/admin/BranchManager.tsx', code);
console.log("Replaced hooks!");
