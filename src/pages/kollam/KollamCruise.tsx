import { motion } from 'motion/react';
import { 
  Anchor, 
  Map, 
  Phone,
  MessageCircle,
  MapPin,
  ShieldCheck,
  Coffee,
  Ship,
  HeartHandshake
} from 'lucide-react';

export default function KollamCruise() {
  const scrollIntoView = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-[#FDFBF7] min-h-screen text-emerald-950 font-sans selection:bg-emerald-900 selection:text-emerald-50">
      {/* 1. Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-black">
          <img 
            src="https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=3132&auto=format&fit=crop"
            alt="Kerala Backwaters Houseboat"
            className="w-full h-full object-cover opacity-70 scale-105 motion-safe:animate-[pulse_20s_ease-in-out_infinite]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-black/40 to-transparent" />
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center mt-20">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-8xl font-serif text-white mb-6 leading-tight drop-shadow-2xl"
          >
            Asado Cruise
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-2xl text-emerald-50 font-light max-w-2xl mx-auto mb-12 drop-shadow-lg leading-relaxed"
          >
            Discover the beauty of Kerala's Ashtamudi Lake with a Asado's Shikara cruise experience.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-6"
          >
            <button 
              onClick={() => scrollIntoView('contact')}
              className="bg-amber-600 text-white px-10 py-4 rounded-none font-bold tracking-widest hover:bg-amber-700 transition-colors shadow-xl text-sm"
            >
              BOOK YOUR CRUISE
            </button>
            <button 
              onClick={() => scrollIntoView('packages')}
              className="bg-black/40 backdrop-blur-md border border-emerald-100/30 text-white px-10 py-4 rounded-none font-bold tracking-widest hover:bg-emerald-900/60 transition-colors text-sm"
            >
              VIEW PACKAGES
            </button>
          </motion.div>
        </div>
      </section>

      {/* 2. Choose Your Cruise */}
      <section id="packages" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-sm font-bold text-amber-700 uppercase tracking-[0.3em] mb-4">Packages</h2>
          <h3 className="text-4xl md:text-5xl font-serif text-emerald-900">Choose Experience</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="group relative overflow-hidden bg-black aspect-[4/5] md:aspect-square flex flex-col justify-end p-8 md:p-12">
            <img 
              src="https://images.unsplash.com/photo-1593693411515-c20261bcad6e?q=80&w=3269&auto=format&fit=crop" 
              alt="Standard Cruise" 
              className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-black/60 to-transparent" />
            <div className="absolute inset-0 border border-emerald-900/50 m-4 pointer-events-none" />
            
            <div className="relative z-10 text-center flex flex-col items-center">
              <h3 className="text-3xl md:text-4xl font-serif text-white mb-2">Standard Cruise</h3>
              <div className="text-2xl font-light text-amber-400 mb-4">₹1300<span className="text-sm text-emerald-200/70">/hr</span></div>
              <div className="flex gap-4 text-xs font-semibold text-emerald-100 uppercase tracking-widest mb-6">
                <span>1 Hour</span>
                <span>•</span>
                <span>Up to 5 Guests</span>
              </div>
              <p className="text-emerald-50 mb-8 font-light leading-relaxed max-w-sm">
                Perfect for couples & families seeking a quick getaway to catch the golden hour over the Ashtamudi lake.
              </p>
              <button onClick={() => scrollIntoView('contact')} className="inline-flex items-center gap-2 bg-white text-emerald-950 px-8 py-3 font-bold uppercase tracking-widest text-xs hover:bg-emerald-50 transition-colors">
                Book Standard
              </button>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-black aspect-[4/5] md:aspect-square flex flex-col justify-end p-8 md:p-12">
            <img 
              src="https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=3270&auto=format&fit=crop" 
              alt="Premium Cruise" 
              className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-black/60 to-transparent" />
            <div className="absolute inset-0 border border-amber-600/50 m-4 pointer-events-none" />
            
            <div className="relative z-10 text-center flex flex-col items-center">
              <h3 className="text-3xl md:text-4xl font-serif text-white mb-2">Premium Cruise</h3>
              <div className="text-2xl font-light text-amber-400 mb-4">₹7000<span className="text-sm text-emerald-200/70">/pkg</span></div>
              <div className="flex gap-4 text-xs font-semibold text-emerald-100 uppercase tracking-widest mb-6">
                <span>5 Hours</span>
                <span>•</span>
                <span>Up to 5 Guests</span>
              </div>
              <p className="text-emerald-50 mb-8 font-light leading-relaxed max-w-sm">
                Relax. Explore. Enjoy Kerala. An immersive, extended journey through the serene backwaters.
              </p>
              <button onClick={() => scrollIntoView('contact')} className="inline-flex items-center gap-2 bg-amber-600 text-white px-8 py-3 font-bold uppercase tracking-widest text-xs hover:bg-amber-700 transition-colors">
                Book Premium
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. The Asado Difference & Amenities Combined */}
      <section className="py-24 bg-black text-emerald-50 border-y-8 border-amber-600/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative aspect-[3/4] overflow-hidden rounded-t-full border-8 border-emerald-900/50">
              <img 
                src="/cruise-experience.jpeg" 
                alt="Asado Cruise Experience" 
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/10" />
            </div>
            
            <div>
              <h2 className="text-sm font-bold text-amber-500 uppercase tracking-[0.3em] mb-4">The Experience</h2>
              <h3 className="text-4xl md:text-5xl font-serif mb-12 text-white leading-tight">Why Cruise With Asado & What's Included</h3>
              
              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-10">
                {[
                  { title: "Premium Shikara", icon: Ship, desc: "Authentic & comfortable boats." },
                  { title: "Friendly Crew", icon: HeartHandshake, desc: "Experienced local guides." },
                  { title: "Scenic Routes", icon: Map, desc: "Explore untouched backwaters." },
                  { title: "Cafe Check-in", icon: Coffee, desc: "Start your journey at Asado Cafe." },
                  { title: "Comfort Seating", icon: Anchor, desc: "Relax in shaded canopies." },
                  { title: "Safety Assured", icon: ShieldCheck, desc: "Life jackets & certified captains." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-emerald-900/50 border border-emerald-800 text-amber-500">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-lg font-serif text-emerald-100 mb-1">{item.title}</h4>
                      <p className="text-sm text-emerald-300/80 font-light">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Enhance Your Experience (Add-ons with Photos) */}
      <section className="py-24 bg-[#FDFBF7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-sm font-bold text-amber-700 uppercase tracking-[0.3em] mb-4">Add-ons</h2>
            <h3 className="text-4xl md:text-5xl font-serif text-emerald-900">Enhance Your Cruise</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                title: "Tea & Snacks", 
                desc: "Perfect for morning or evening rides. Enjoy authentic Kerala snacks with hot tea.",
                img: "https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?q=80&w=2000&auto=format&fit=crop"
              },
              { 
                title: "Welcome Drink", 
                desc: "Freshly prepared refreshing drinks to start your backwater journey.",
                img: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?q=80&w=2000&auto=format&fit=crop"
              },
              { 
                title: "Traditional Kerala Meal", 
                desc: "Enjoy authentic local flavours served on a banana leaf.",
                img: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Sadhya_DSW.jpg/1280px-Sadhya_DSW.jpg"
              }
            ].map((addon, i) => (
              <div key={i} className="group relative overflow-hidden bg-black aspect-[4/3] flex flex-col justify-end">
                <img 
                  src={addon.img} 
                  alt={addon.title} 
                  className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-black/40 to-transparent opacity-90" />
                
                <div className="relative z-10 p-8 text-center border m-3 border-white/10 group-hover:border-amber-500/50 transition-colors">
                  <h4 className="text-2xl font-serif text-white mb-2">{addon.title}</h4>
                  <p className="text-emerald-100/80 text-sm font-light leading-relaxed">{addon.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Gallery */}
      <section className="py-24 bg-emerald-50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl md:text-5xl font-serif text-emerald-900">Gallery</h3>
          </div>
          
          <div className="columns-1 sm:columns-2 md:columns-3 gap-4 space-y-4">
            {[
              { title: "Boats", h: "h-96", img: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=3132&auto=format&fit=crop" },
              { title: "Backwaters", h: "h-64", img: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=3270&auto=format&fit=crop" },
              { title: "Sunset", h: "h-80", img: "https://upload.wikimedia.org/wikipedia/commons/9/96/Kerala_Houseboat_View.JPG" },
              { title: "Guests", h: "h-72", img: "https://upload.wikimedia.org/wikipedia/commons/d/df/Kerala_Launch.JPG" },
              { title: "Meals", h: "h-96", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Sadhya_DSW.jpg/1280px-Sadhya_DSW.jpg" },
              { title: "Morning Cruise", h: "h-64", img: "https://images.unsplash.com/photo-1593693411515-c20261bcad6e?q=80&w=3269&auto=format&fit=crop" }
            ].map((item, i) => (
              <div key={i} className={`relative break-inside-avoid overflow-hidden group ${item.h} bg-emerald-900`}>
                <img src={item.img} alt={item.title} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-300" />
                <div className="absolute inset-0 p-6 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-white font-bold tracking-widest uppercase text-xs drop-shadow-md">{item.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Contact / Book Now */}
      <section id="contact" className="py-24 bg-[#FDFBF7]">
        <div className="max-w-5xl mx-auto px-4 relative z-10">
          <div className="bg-black p-12 md:p-20 text-center relative overflow-hidden">
            <div className="absolute inset-0 border-2 border-amber-600/30 m-4 pointer-events-none" />
            <h2 className="text-sm font-bold text-amber-500 uppercase tracking-[0.3em] mb-4">Book Now</h2>
            <h3 className="text-4xl md:text-5xl font-serif text-white mb-12">Ready to Cruise?</h3>
            
            <div className="flex flex-col sm:flex-row justify-center gap-6 relative z-10">
              <a 
                href="tel:09061114112"
                className="flex items-center justify-center gap-3 bg-amber-600 text-white px-8 py-4 font-bold uppercase tracking-widest text-xs hover:bg-amber-700 transition-colors"
              >
                <Phone className="w-4 h-4" />
                Call Now
              </a>
              <a 
                href="https://wa.me/91906113114"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-3 bg-[#25D366] text-white px-8 py-4 font-bold uppercase tracking-widest text-xs hover:bg-[#20bd5a] transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </a>
              <a 
                href="https://maps.app.goo.gl/tycM4c3aJdQ1JanL6?g_st=aw"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-3 bg-emerald-900 border border-emerald-800 text-white px-8 py-4 font-bold uppercase tracking-widest text-xs hover:bg-emerald-800 transition-colors"
              >
                <MapPin className="w-4 h-4" />
                Directions
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
