const fs = require('fs');

if (fs.existsSync('src/pages/alappuzha/AlappuzhaMenu.tsx')) {
  let code = fs.readFileSync('src/pages/alappuzha/AlappuzhaMenu.tsx', 'utf-8');

  code = code.replace(
    "import { alappuzhaMenu, alappuzhaCategories } from '../../data';",
    "import { collection, onSnapshot, query, where } from 'firebase/firestore';\nimport { db, handleFirestoreError, OperationType } from '../../lib/firebase';"
  );

  const oldInit = `export default function AlappuzhaMenu() {
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const checkIsDesktop = () => setIsDesktop(window.innerWidth >= 768);
    checkIsDesktop();
    window.addEventListener('resize', checkIsDesktop);
    return () => window.removeEventListener('resize', checkIsDesktop);
  }, []);`;

  const newInit = `export default function AlappuzhaMenu() {
  const [activeCategoryName, setActiveCategoryName] = useState<string | null>(null);
  const [isDesktop, setIsDesktop] = useState(true);
  const [alappuzhaMenu, setAlappuzhaMenu] = useState<any[]>([]);
  const [alappuzhaCategories, setAlappuzhaCategories] = useState<any[]>([]);

  useEffect(() => {
    const checkIsDesktop = () => setIsDesktop(window.innerWidth >= 768);
    checkIsDesktop();
    window.addEventListener('resize', checkIsDesktop);
    return () => window.removeEventListener('resize', checkIsDesktop);
  }, []);

  useEffect(() => {
    const unsubMenu = onSnapshot(query(collection(db, 'menuItems'), where('branchSlug', '==', 'alappuzha')), (snapshot) => {
      setAlappuzhaMenu(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubCat = onSnapshot(query(collection(db, 'categories'), where('branchSlug', '==', 'alappuzha')), (snapshot) => {
      setAlappuzhaCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => { unsubMenu(); unsubCat(); };
  }, []);`;

  code = code.replace(oldInit, newInit);

  code = code.replace(/activeCategoryId/g, 'activeCategoryName');
  code = code.replace(/c => c\.id === activeCategoryName/g, 'c => c.name === activeCategoryName');
  code = code.replace(/item\.category_id === activeCategoryName/g, 'item.category === activeCategoryName');
  code = code.replace(/category_id/g, 'category');

  fs.writeFileSync('src/pages/alappuzha/AlappuzhaMenu.tsx', code);
  console.log("Updated AlappuzhaMenu.tsx");
}
