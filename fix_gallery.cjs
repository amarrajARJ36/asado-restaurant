const fs = require('fs');

function fix(filename) {
  if (!fs.existsSync(filename)) return;
  let code = fs.readFileSync(filename, 'utf-8');
  
  const oldImg = /<img\s+src=\{img\.url\}\s+alt=\{img\.category\}\s+className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"\s*\/>/;
  
  const newImg = `{img.url.includes('.mp4') || img.url.includes('video') ? (
                  <video src={img.url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" autoPlay muted loop playsInline />
                ) : (
                  <img src={img.url} alt={img.category} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                )}`;
  
  if (code.match(oldImg)) {
    code = code.replace(oldImg, newImg);
    fs.writeFileSync(filename, code);
    console.log("Updated", filename);
  }
}

fix('src/pages/kollam/KollamGallery.tsx');
fix('src/pages/alappuzha/AlappuzhaHome.tsx');
