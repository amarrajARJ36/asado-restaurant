const fs = require('fs');
let code = fs.readFileSync('src/pages/alappuzha/AlappuzhaHome.tsx', 'utf8');

const scrollAnimBase = `initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8, ease: "easeOut" }}`;

// The idea is to replace standard non-motion divs in sections with motion.divs with scroll animations.
// Or we can just build a regex to replace some container elements.
// Section 2: Discover the Backwaters
code = code.replace(
  /<div className="max-w-4xl mx-auto text-center relative z-10">/,
  `<motion.div ${scrollAnimBase} className="max-w-4xl mx-auto text-center relative z-10">`
).replace(
  /<\/h2>\s*<p className="text-xl text-slate-600 font-light leading-relaxed mb-8">\s*Asado Alappuzha/g,
  `</h2>
          <p className="text-xl text-slate-600 font-light leading-relaxed mb-8">
            Asado Alappuzha`
).replace(
  /<\/div>\s*<\/div>\s*<\/section>/,
  `</motion.div>
        </div>
      </section>`
);

// Section 3: Houseboat curation
code = code.replace(
  /<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">/,
  `<motion.div ${scrollAnimBase} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">`
).replace(
  /<\/AnimatePresence>\s*<\/div>\s*<\/div>\s*<\/section>/,
  `</AnimatePresence>
        </motion.div>
      </section>`
);

// Section 4: Celebrate at Asado
code = code.replace(
  /<div className="max-w-5xl mx-auto px-4 relative z-10 text-center">/,
  `<motion.div ${scrollAnimBase} className="max-w-5xl mx-auto px-4 relative z-10 text-center">`
).replace(
  /<\/div>\s*<\/div>\s*<\/section>\s*{\/\* 5. Gallery \*\/}/,
  `</div>
        </motion.div>
      </section>
      
      {/* 5. Gallery */}`
);

// Gallery section
code = code.replace(
  /<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">/,
  `<motion.div ${scrollAnimBase} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">`
).replace(
  /<\/section>\s*{\/\* 6. Testimonials \*\/}/,
  `</motion.div>
      </section>

      {/* 6. Testimonials */}`
);

// Testimonials section
code = code.replace(
  /<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">/,
  `<motion.div ${scrollAnimBase} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">`
).replace(
  /<\/div>\s*<\/section>\s*{\/\* 7. Location & Contact \*\/}/,
  `</motion.div>
      </section>

      {/* 7. Location & Contact */}`
);

// Contact section
code = code.replace(
  /<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">/,
  `<motion.div ${scrollAnimBase} className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">`
).replace(
  /<\/div>\s*<\/section>\s*{\/\* Footer spacing \*\/}/,
  `</motion.div>
      </section>

      {/* Footer spacing */}`
);

fs.writeFileSync('src/pages/alappuzha/AlappuzhaHome.tsx', code);
