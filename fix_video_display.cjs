const fs = require('fs');

let code = fs.readFileSync('src/pages/admin/BranchManager.tsx', 'utf-8');

code = code.replace(
  /<img src=\{img\.url\} alt="" className="w-full h-full object-cover" \/>/g,
  `{img.url.toLowerCase().includes('.mp4') ? (
                      <video src={img.url} className="w-full h-full object-cover" controls muted playsInline />
                    ) : (
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                    )}`
);

fs.writeFileSync('src/pages/admin/BranchManager.tsx', code);
