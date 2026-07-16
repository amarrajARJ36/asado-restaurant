const fs = require('fs');

let code = fs.readFileSync('src/pages/admin/AdminDashboard.tsx', 'utf-8');

// The issue was I nested an extra <div>. 
// Before my edit, it was:
//               <div>
//                 <label className="block text-sm font-medium text-neutral-700 mb-1">Color Theme</label>
// 
// After my edit, it became:
//               <div>
//               <div>
//                 <label className="block text-sm font-medium text-neutral-700 mb-1">Target Branch</label>
//                 ...
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-neutral-700 mb-1">Color Theme</label>

code = code.replace(
  '<div>\n              <div>\n                <label className="block text-sm font-medium text-neutral-700 mb-1">Target Branch</label>',
  '<div>\n                <label className="block text-sm font-medium text-neutral-700 mb-1">Target Branch</label>'
);

fs.writeFileSync('src/pages/admin/AdminDashboard.tsx', code);
