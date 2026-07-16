const fs = require('fs');

// Fix useBanners.ts
let bannersCode = fs.readFileSync('src/hooks/useBanners.ts', 'utf-8');
bannersCode = bannersCode.replace(/\\`banners\/\\\$\\{banner\.id\\}\\`/g, '`banners/${banner.id}`');
bannersCode = bannersCode.replace(/\\`banners\/\\\$\\{id\\}\\`/g, '`banners/${id}`');
fs.writeFileSync('src/hooks/useBanners.ts', bannersCode);

// Fix AdminDashboard.tsx
let adminCode = fs.readFileSync('src/pages/admin/AdminDashboard.tsx', 'utf-8');
// The issue is likely unbalanced tags due to replace. I'll just restore the original and do it cleanly.

