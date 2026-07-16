const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminDashboard.tsx', 'utf-8');

// Add branchSlug to newBanner initial state
code = code.replace(
  "tagColor: 'text-amber-900',",
  "tagColor: 'text-amber-900',\n    branchSlug: 'all',"
);

// Add the selector to the grid
const addBranchSelect = `
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Target Branch</label>
                <select 
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  value={newBanner.branchSlug || 'all'}
                  onChange={(e) => setNewBanner({...newBanner, branchSlug: e.target.value})}
                >
                  <option value="all">All Branches</option>
                  <option value="kollam">Kollam</option>
                  <option value="alappuzha">Alappuzha</option>
                  <option value="varkala">Varkala</option>
                </select>
              </div>
`;

code = code.replace(
  '<label className="block text-sm font-medium text-neutral-700 mb-1">Color Theme</label>',
  addBranchSelect + '\n              <div>\n                <label className="block text-sm font-medium text-neutral-700 mb-1">Color Theme</label>'
);

// Show the branchSlug on the banner cards
code = code.replace(
  '{banner.tagText}',
  '{banner.tagText} • {banner.branchSlug === "all" || !banner.branchSlug ? "All Branches" : banner.branchSlug}'
);

fs.writeFileSync('src/pages/admin/AdminDashboard.tsx', code);
