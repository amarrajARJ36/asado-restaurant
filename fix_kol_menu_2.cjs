const fs = require('fs');

if (fs.existsSync('src/pages/kollam/KollamMenu.tsx')) {
  let code = fs.readFileSync('src/pages/kollam/KollamMenu.tsx', 'utf-8');

  code = code.replace(
    /const activeCategory = kollamCategories\.find\(c => c\.name === activeCategoryName\);/,
    "const activeCategory = kollamCategories.find(c => c.name === activeCategoryName) || kollamCategories.find(c => c.id === activeCategoryName);"
  );

  code = code.replace(
    /const itemCount = kollamMenu\.filter\(m => m\.category === category\.id\)\.length;/g,
    "const itemCount = kollamMenu.filter(m => m.category === category.name).length;"
  );

  code = code.replace(
    /onClick=\{\(\) => setActiveCategoryId\(category\.id\)\}/g,
    "onClick={() => setActiveCategoryName(category.name)}"
  );
  
  code = code.replace(
    /onClick=\{\(\) => setActiveCategoryId\(null\)\}/g,
    "onClick={() => setActiveCategoryName(null)}"
  );

  fs.writeFileSync('src/pages/kollam/KollamMenu.tsx', code);
  console.log("Updated KollamMenu.tsx");
}
