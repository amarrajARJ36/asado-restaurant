import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, MapPin } from 'lucide-react';
import { branches } from '../../data';

export default function VarkalaHome() {
  const branch = branches.find(b => b.slug === 'varkala');

  return (
    <div className="min-h-screen bg-black text-white flex flex-col selection:bg-amber-500/30">
      
      {/* Minimal Header */}
      <header className="absolute top-0 inset-x-0 z-50 p-6 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm uppercase font-bold tracking-wider">Back to Main</span>
        </Link>
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-amber-500" />
          <span className="text-sm uppercase font-bold tracking-wider">Asado Varkala</span>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative flex-1 flex flex-col items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0 bg-neutral-900">
          {/* Image Placeholder */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/80" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-4xl mx-auto mt-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-sm font-bold uppercase tracking-widest text-amber-400 mb-8"
          >
            Opening Soon
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter uppercase mb-6"
          >
            Asado Varkala
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-3xl font-light text-neutral-300 mb-2"
          >
            Perched Above the Arabian Sea.
          </motion.p>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-lg md:text-xl text-neutral-400 mb-12 max-w-2xl"
          >
            Get ready for an unparalleled dining experience on the iconic cliffs of Varkala. We are crafting something truly special.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full max-w-md"
          >
            <button className="w-full bg-amber-600 text-white px-10 py-5 rounded-full font-bold uppercase tracking-wider hover:bg-amber-700 transition-colors shadow-xl shadow-amber-600/20 text-sm">
              Notify Me
            </button>
            <button className="w-full bg-white/10 backdrop-blur-md border border-white/20 text-white px-10 py-5 rounded-full font-medium uppercase tracking-wider hover:bg-white/20 transition-colors text-sm">
              Construction Updates
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 p-6 text-center text-neutral-500 border-t border-white/10 bg-black/50 backdrop-blur-md">
        <p className="uppercase tracking-widest text-xs">&copy; {new Date().getFullYear()} Asado Café. Stay Tuned.</p>
      </footer>
    </div>
  );
}
