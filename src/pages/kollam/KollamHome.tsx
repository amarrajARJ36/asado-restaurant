import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, MapPin, Phone, Mail, Star, Clock, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { branches } from '../../data';
import { useBanners } from '../../hooks/useBanners';

export default function KollamHome() {
  const branch = branches.find(b => b.slug === 'kollam');
  const { banners } = useBanners();
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const nextBanner = () => {
    setCurrentBanner((prev) => (prev + 1) % banners.length);
  };

  const prevBanner = () => {
    setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);
  };
  
  if (!branch) return null;

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[80vh] md:h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-neutral-900">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            className="w-full h-full object-cover opacity-100 brightness-110 scale-105 motion-safe:animate-[pulse_10s_ease-in-out_infinite]"
          >
            <source src="/kollam-hero.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/10" />
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-7xl font-bold text-white uppercase tracking-tight mb-4 drop-shadow-lg"
          >
            Asado Kollam
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl text-neutral-200 font-light mb-10 drop-shadow-md"
          >
            Lake View Restaurant
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full max-w-md"
          >
            <Link 
              to="/kollam/menu"
              className="w-full sm:w-auto bg-amber-600 text-white px-10 py-5 rounded-full font-bold uppercase tracking-wider hover:bg-amber-700 transition-colors shadow-xl shadow-amber-600/20 text-lg"
            >
              View Menu
            </Link>
            <a href="tel:9061113114" className="w-full sm:w-auto bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-5 rounded-full font-medium uppercase tracking-wider hover:bg-white/20 transition-colors text-sm text-center block sm:inline-block">
              Reserve Table
            </a>
          </motion.div>
        </div>
      </section>

      {/* Promos / Banners Slider */}
      {banners.length > 0 && (
        <section className={`py-12 border-b relative overflow-hidden transition-colors duration-500 ${banners[currentBanner]?.bgColor || 'bg-amber-50'} ${banners[currentBanner]?.bgColor === 'bg-amber-50' ? 'border-amber-100' : 'border-blue-100'}`}>
          <div className="max-w-4xl mx-auto px-4 text-center relative z-10 min-h-[120px] flex items-center justify-center">
            
            {banners.length > 1 && (
              <button onClick={prevBanner} className="absolute left-0 md:left-4 p-2 rounded-full hover:bg-black/5 transition-colors z-20">
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            <div className="w-full px-8 md:px-16 overflow-hidden relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentBanner}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 ${banners[currentBanner]?.tagBg || 'bg-amber-200'} ${banners[currentBanner]?.tagColor || 'text-amber-900'}`}>
                    {banners[currentBanner]?.tagText}
                  </span>
                  <h2 className={`text-2xl md:text-3xl font-bold mb-2 ${banners[currentBanner]?.textColor || 'text-amber-950'}`}>
                    {banners[currentBanner]?.title}
                  </h2>
                  <p className={`opacity-80 ${banners[currentBanner]?.textColor || 'text-amber-950'}`}>
                    {banners[currentBanner]?.subtitle}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {banners.length > 1 && (
              <button onClick={nextBanner} className="absolute right-0 md:right-4 p-2 rounded-full hover:bg-black/5 transition-colors z-20">
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>
          
          {/* Indicators */}
          {banners.length > 1 && (
            <div className="flex justify-center gap-2 mt-4 absolute bottom-4 left-0 right-0 z-10">
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentBanner(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${currentBanner === idx ? 'bg-black/50 w-4' : 'bg-black/20'}`}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Quick Links / Navigation Cards */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <Link to="/kollam/cruise" className="group block relative rounded-2xl overflow-hidden aspect-square bg-neutral-800">
              <img src="https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=3132&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Cruise with Asado" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <h3 className="text-2xl font-bold text-white mb-2">Cruise with Asado</h3>
                <p className="text-neutral-300 text-sm flex items-center gap-2 group-hover:text-amber-400 transition-colors">
                  Explore Cruise Packages <ArrowRight className="w-4 h-4" />
                </p>
              </div>
            </Link>
            
            <Link to="/kollam/events" className="group block relative rounded-2xl overflow-hidden aspect-square bg-neutral-800">
              <img src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=3298&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Events & Decorations" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <h3 className="text-2xl font-bold text-white mb-2">Events & Decorations</h3>
                <p className="text-neutral-300 text-sm flex items-center gap-2 group-hover:text-amber-400 transition-colors">
                  Plan your celebration <ArrowRight className="w-4 h-4" />
                </p>
              </div>
            </Link>
            
            <Link to="/kollam/gallery" className="group block relative rounded-2xl overflow-hidden aspect-square bg-neutral-800">
              <img src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=3174&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Gallery" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <h3 className="text-2xl font-bold text-white mb-2">Gallery</h3>
                <p className="text-neutral-300 text-sm flex items-center gap-2 group-hover:text-amber-400 transition-colors">
                  View the ambience <ArrowRight className="w-4 h-4" />
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-24 bg-white text-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold uppercase tracking-tight mb-6 text-neutral-900">Visit Us in Kollam</h2>
              <p className="text-neutral-600 mb-8 text-lg font-light leading-relaxed">
                Experience the perfect blend of lakeside serenity and culinary excellence. Our Kollam branch offers signature BBQ, backwater cruises, and an unforgettable dining atmosphere.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg text-neutral-900">Opening Hours</h4>
                    <p className="text-neutral-500">Mon-Sun: 12:00 PM - 11:00 PM</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg text-neutral-900">Location</h4>
                    <p className="text-neutral-500">Jaladarshini Lakeside Gardens, near Milma Diary,<br />Palace Nagar, Thevally, Kollam, Kerala 691012</p>
                    <a href="https://maps.app.goo.gl/tycM4c3aJdQ1JanL6?g_st=aw" target="_blank" rel="noreferrer" className="text-amber-600 font-medium text-sm hover:underline mt-1 inline-block">View on Google Maps</a>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg text-neutral-900">Contact & Reservations</h4>
                    <p className="text-neutral-500">
                      <a href="tel:9061113114" className="hover:underline">9061113114</a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#25D366]/10 flex items-center justify-center shrink-0">
                    <MessageCircle className="w-5 h-5 text-[#25D366]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg text-neutral-900">WhatsApp</h4>
                    <p className="text-neutral-500">
                      <a href="https://wa.me/91906113114" target="_blank" rel="noreferrer" className="hover:underline text-[#25D366]">0906113114</a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-neutral-800">
              <iframe
                src="https://maps.google.com/maps?q=Asado%20Cafe,%20Jaladarshini%20Lakeside%20Gardens,%20Thevally,%20Kollam&t=&z=15&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0"
              ></iframe>
            </div>
          </div>
        </div>
      </section>
      
    </div>
  );
}
