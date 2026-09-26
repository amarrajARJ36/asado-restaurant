import { Link } from 'react-router-dom';
import { branches } from '../data';
import { motion } from 'motion/react';
import { ChevronRight, ArrowRight, Star } from 'lucide-react';
import FooterCopyright from '../components/FooterCopyright';

export default function MainHome() {
  const scrollToBranches = () => {
    document.getElementById('branches')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-amber-500/30">
      
      {/* Hero Section */}
      <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Background Image / Video */}
        <div className="absolute inset-0 z-0 bg-neutral-900">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            className="w-full h-full object-cover opacity-60 scale-105 motion-safe:animate-[pulse_10s_ease-in-out_infinite]"
          >
            <source src="/asado-hero.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-4xl mx-auto mt-20">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter uppercase mb-6"
          >
            Asado Cafe
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-3xl font-light text-neutral-200 mb-2 font-serif italic"
          >
            An Experience.
          </motion.p>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-lg md:text-2xl font-light text-neutral-400 mb-12"
          >
            More than a Restaurant.
          </motion.p>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            onClick={scrollToBranches}
            className="group flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full font-medium uppercase tracking-wider text-sm transition-all hover:bg-neutral-200"
          >
            Explore Our Branches
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>
      </section>

      {/* Branches Showcase (Netflix Style Banners) */}
      <section id="branches" className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight uppercase">Choose Your Branch</h2>
            <p className="text-neutral-400 mt-4 text-lg">Select a destination to explore menus, events, and reservations.</p>
          </div>

          <div className="flex flex-col gap-12 md:gap-24">
            {branches.map((branch, index) => (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                key={branch.id}
                className="relative group rounded-3xl overflow-hidden bg-neutral-900 border border-neutral-800"
              >
                <div className="relative w-full min-h-[280px] sm:min-h-[320px] md:min-h-0 md:aspect-[21/9] overflow-hidden bg-neutral-800">
                  {/* Conditional Background Image */}
                  <img 
                    src={
                      branch.slug === 'kollam' 
                        ? '/asado-sign.jpeg' 
                        : branch.slug === 'alappuzha' 
                          ? '/asado-sign 2.jpeg' 
                          : '/asado-sign 3.jpeg'
                    } 
                    alt={branch.name} 
                    className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700" 
                  />
                  
                  {/* Gradients for text legibility */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent md:hidden" />
                  
                  {/* Content Overlay */}
                  <div className="absolute inset-0 p-6 sm:p-8 md:p-16 flex flex-col justify-center">
                    <div className="max-w-xl">
                      <div className="flex items-center gap-3 mb-2 sm:mb-3">
                        <h3 className="text-2xl sm:text-3xl md:text-5xl font-bold uppercase tracking-tight text-white">{branch.name}</h3>
                      </div>
                      
                      <p className="text-neutral-300 text-sm sm:text-base md:text-xl font-light mb-5 sm:mb-6 md:mb-8 max-w-md leading-relaxed">
                        {branch.description}
                      </p>

                      {branch.status === 'active' ? (
                        <Link 
                          to={`/${branch.slug}`}
                          className="inline-flex items-center gap-2 bg-white text-black px-5 py-2.5 sm:px-6 sm:py-3 rounded-full text-sm sm:text-base font-medium transition-colors hover:bg-neutral-200"
                        >
                          Visit {branch.name}
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Experience Container with Fixed Background */}
      <div className="relative">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="sticky top-0 h-screen w-full overflow-hidden bg-neutral-900">
            <img 
              src="/about-bg.jpg"
              alt="About Asado"
              className="w-full h-full object-cover opacity-70"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black" />
          </div>
        </div>

        <div className="relative z-10">
          {/* About Section */}
          <section className="min-h-screen flex items-center justify-center py-20">
            <div className="max-w-5xl mx-auto px-4 text-center">
              <motion.h2 
                initial={{ opacity: 0, y: 100, filter: "blur(10px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-20%" }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="text-4xl md:text-6xl font-bold uppercase tracking-tight mb-8 text-white drop-shadow-lg"
              >
                The Asado Experience
              </motion.h2>
              
              <motion.p 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20%" }}
                transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="text-xl md:text-2xl text-neutral-100 font-medium leading-relaxed drop-shadow-md"
              >
                Born from a passion for culinary excellence and unforgettable atmospheres, Asado Cafe is more than just a destination—it's a journey of flavors, music, and moments. Across our branches in Kerala, we bring together the best of global cuisine with the soul of local hospitality.
              </motion.p>
            </div>
          </section>

          {/* Gallery Preview Section */}
          <section className="min-h-screen flex flex-col justify-center overflow-hidden relative py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 text-center relative z-10 w-full">
              <motion.h2 
                initial={{ opacity: 0, y: 50, filter: "blur(10px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-20%" }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="text-3xl md:text-5xl font-bold uppercase tracking-tight mb-4 text-white drop-shadow-lg"
              >
                Gallery
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20%" }}
                transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="text-neutral-300 text-lg max-w-2xl mx-auto drop-shadow"
              >
                Glimpses of the perfect ambience, crafted to make your moments special.
              </motion.p>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-20%" }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="flex gap-6 px-4 md:px-8 pb-12 overflow-x-auto snap-x snap-mandatory hide-scrollbar relative z-10 w-full"
            >
               {[
                 "/H1.jpeg",
                 "/H2.jpeg",
                 "/H3.jpeg",
                 "/H4.jpeg",
                 "/H5.jpeg"
               ].map((src, item) => (
                 <div 
                   key={item} 
                   className="snap-center shrink-0 w-[80vw] md:w-[400px] aspect-[4/5] bg-neutral-200 rounded-2xl overflow-hidden relative group shadow-xl border border-white/10"
                 >
                   <img src={src} alt="Gallery Preview" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                   <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
                 </div>
               ))}
            </motion.div>
          </section>

          {/* Testimonials Section */}
          <section className="min-h-screen flex flex-col justify-center py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16 w-full">
              <motion.h2 
                initial={{ opacity: 0, y: 50, filter: "blur(10px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-20%" }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="text-3xl md:text-5xl font-bold uppercase tracking-tight mb-4 text-white drop-shadow-lg"
              >
                What They Say
              </motion.h2>
            </div>

            <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-3 gap-8 w-full">
               {[
                 { name: "Arun K.", text: "The vibe at Asado is just unmatched. The best place in town to chill with friends and enjoy great food.", rating: 5 },
                 { name: "Sneha V.", text: "Absolutely love the aesthetics! A very aesthetic cafe with an amazing view. The food is top-notch.", rating: 5 },
                 { name: "Rahul M.", text: "Good food, great music, and an amazing atmosphere. Every visit to Asado is a memorable experience.", rating: 5 }
               ].map((testimonial, i) => (
                 <motion.div
                   key={i}
                   initial={{ opacity: 0, y: 50 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true, margin: "-20%" }}
                   transition={{ duration: 0.8, delay: 0.1 + (i * 0.1), ease: [0.16, 1, 0.3, 1] }}
                   className="bg-neutral-900/60 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-2xl hover:-translate-y-1 transition-transform duration-300"
                 >
                   <div className="flex gap-1 text-amber-500 mb-6">
                     {[...Array(testimonial.rating)].map((_, j) => (
                       <Star key={j} className="w-5 h-5 fill-current" />
                     ))}
                   </div>
                   <p className="text-neutral-300 mb-8 italic text-lg leading-relaxed">"{testimonial.text}"</p>
                   <p className="font-bold uppercase tracking-wider text-sm text-white">{testimonial.name}</p>
                 </motion.div>
               ))}
            </div>
          </section>
        </div>
      </div>

      {/* Footer (Brand level) */}
      <footer className="border-t border-neutral-900 py-12 text-center text-neutral-500">
        <FooterCopyright className="text-neutral-500 text-sm" />
      </footer>
    </div>
  );
}
