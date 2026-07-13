const fs = require('fs');

if (fs.existsSync('src/pages/alappuzha/AlappuzhaMenu.tsx')) {
  let code = fs.readFileSync('src/pages/alappuzha/AlappuzhaMenu.tsx', 'utf-8');

  // Fix activeCategory
  code = code.replace(
    /const activeCategory = alappuzhaCategories\.find\(c => c\.name === activeCategoryName\);/,
    "const activeCategory = alappuzhaCategories.find(c => c.name === activeCategoryName) || alappuzhaCategories.find(c => c.id === activeCategoryName);"
  );

  // Fix counts
  code = code.replace(
    /const itemCount = alappuzhaMenu\.filter\(m => m\.category === category\.id\)\.length;/g,
    "const itemCount = alappuzhaMenu.filter(m => m.category === category.name).length;"
  );

  // Fix onClick setActiveCategoryName
  code = code.replace(
    /onClick=\{\(\) => setActiveCategoryId\(category\.id\)\}/g,
    "onClick={() => setActiveCategoryName(category.name)}"
  );
  
  // Fix close panel
  code = code.replace(
    /onClick=\{\(\) => setActiveCategoryId\(null\)\}/g,
    "onClick={() => setActiveCategoryName(null)}"
  );

  fs.writeFileSync('src/pages/alappuzha/AlappuzhaMenu.tsx', code);
  console.log("Updated AlappuzhaMenu.tsx");
}
