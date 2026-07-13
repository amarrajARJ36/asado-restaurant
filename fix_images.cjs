const fs = require('fs');
let code = fs.readFileSync('src/pages/alappuzha/AlappuzhaHome.tsx', 'utf8');

code = code.replace(
  '1599487405270-864309b8214f',
  '1502635385003-ee1e6a1a742d'
);

code = code.replace(
  '1587425126867-0c7f12e8489c',
  '1475503572774-15a45e5d60b9'
);

code = code.replace(
  '1592484080164-839213197171',
  '1464349095431-e9a21285b5f3'
);

fs.writeFileSync('src/pages/alappuzha/AlappuzhaHome.tsx', code);
