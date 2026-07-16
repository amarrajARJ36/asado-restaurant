const fs = require('fs');

let code = fs.readFileSync('src/hooks/useBanners.ts', 'utf-8');

code = code.replace('export interface Banner {', 'export interface Banner {\n  branchSlug?: string;');
code = code.replace('export function useBanners() {', 'export function useBanners(branchSlug?: string) {');
code = code.replace('if (fbBanners.length > 0) {', `
      let filtered = fbBanners;
      if (branchSlug) {
        filtered = fbBanners.filter(b => !b.branchSlug || b.branchSlug === 'all' || b.branchSlug === branchSlug);
      }
      if (filtered.length > 0) {
        setBanners(filtered);
      } else {
        setBanners([]); // Or defaultBanners, but let's empty it if there are real banners but none match.
      }
`);

fs.writeFileSync('src/hooks/useBanners.ts', code);
