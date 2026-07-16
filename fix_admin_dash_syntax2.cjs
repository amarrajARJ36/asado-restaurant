const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminDashboard.tsx', 'utf-8');

code = code.replace(
  '<div>\n              \n              <div>',
  '<div>'
);
fs.writeFileSync('src/pages/admin/AdminDashboard.tsx', code);
