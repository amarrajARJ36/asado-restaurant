import fs from 'fs';
import { branches, kollamCategories, alappuzhaCategories, kollamMenu, alappuzhaMenu } from './src/data';

function mergeItems(menu) {
  const mergedMenu = [];
  const sizeMap = new Map();

  for (const item of menu) {
    let name = item.name;
    let size = null;
    
    // Look for sizes in the name, but allow it anywhere?
    // The previous regex was: / \((Small|Large|Medium|Half|Full|Quarter)\)$/i
    // Wait, earlier I ran it and it updated data.ts, so the current data.ts has the merged items.
    // If I run it again on the NEW data.ts it won't find the sizes.
    // Let me undo data.ts using git checkout src/data.ts first.
  }
}
