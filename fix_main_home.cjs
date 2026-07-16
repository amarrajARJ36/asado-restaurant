const fs = require('fs');

let code = fs.readFileSync('src/pages/MainHome.tsx', 'utf-8');

// Remove Notify Me button
code = code.replace(
  `                      ) : (
                        <button className="inline-flex items-center gap-2 bg-neutral-800 text-neutral-300 px-6 py-3 rounded-full font-medium border border-neutral-700 cursor-default">
                          Notify Me
                        </button>
                      )}`,
  `                      ) : null}`
);

// Remove location emoji span
const emojiSpan = `                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                          <span className="text-sm">📍</span>
                        </span>`;

code = code.replace(emojiSpan, '');
code = code.replace(emojiSpan, ''); // Just in case there are multiple
code = code.replace(emojiSpan, '');

fs.writeFileSync('src/pages/MainHome.tsx', code);
