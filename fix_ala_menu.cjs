const fs = require('fs');
let code = fs.readFileSync('src/pages/alappuzha/AlappuzhaMenu.tsx', 'utf-8');

const badInit = `  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryName, setActiveCategoryId] = useState<string | null>(null);
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const checkIsDesktop = () => setIsDesktop(window.innerWidth >= 768);
    checkIsDesktop();
    window.addEventListener('resize', checkIsDesktop);
    return () => window.removeEventListener('resize', checkIsDesktop);
  }, []);`;

const goodInit = `  const [searchQuery, setSearchQuery] = useState('');
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

code = code.replace(badInit, goodInit);
code = code.replace(/setActiveCategoryId/g, 'setActiveCategoryName');

fs.writeFileSync('src/pages/alappuzha/AlappuzhaMenu.tsx', code);
