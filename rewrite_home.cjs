const fs = require('fs');

const content = `import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, Phone, MessageCircle, Clock, Anchor, Ship, GlassWater, PartyPopper, Users, Heart, CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';

const TRAVEL_GROUPS = [
  { id: 'couple', label: 'Couple', icon: Heart },
  { id: 'family', label: 'Family', icon: Users },
  { id: 'friends', label: 'Friends', icon: PartyPopper },
  { id: 'corporate', label: 'Corporate Group', icon: Anchor },
  { id: 'celebration', label: 'Special Celebration', icon: GlassWater },
];

const HOUSEBOAT_RECOMMENDATIONS = {
  couple: {
    title: '1-Bedroom Premium Houseboat',
    desc: 'Intimate, private, and luxurious. Perfect for a romantic getaway with a private deck and candlelight dinner options.',
    img: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2000&auto=format&fit=crop',
    tags: ['Private Chef', 'Jacuzzi Option', 'Decorations']
  },
  family: {
    title: '2-3 Bedroom Family Houseboat',
    desc: 'Spacious decks, safe for children, and multiple rooms. Enjoy quality family time cruising the backwaters.',
    img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2000&auto=format&fit=crop',
    tags: ['Family Lounge', 'Kid Friendly Meals', 'AC Bedrooms']
  },
  friends: {
    title: '3-4 Bedroom Leisure Houseboat',
    desc: 'Large upper deck for lounging, great music system, and plenty of space to relax and catch up with friends.',
    img: 'https://images.unsplash.com/photo-1587425126867-0c7f12e8489c?q=80&w=2000&auto=format&fit=crop',
    tags: ['Upper Deck', 'Music System', 'Group Dining']
  },
  corporate: {
    title: 'Luxury Conference Houseboat',
    desc: 'Equipped for team offsites with large seating areas, premium catering, and presentation facilities if needed.',
    img: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=2000&auto=format&fit=crop',
    tags: ['Large Capacity', 'Premium Catering', 'Lounge Area']
  },
  celebration: {
    title: 'Party & Celebration Houseboat',
    desc: 'Custom decorated boats with ample space for cake cutting, parties, and creating unforgettable memories.',
    img: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2000&auto=format&fit=crop',
    tags: ['Custom Decor', 'Event Space', 'Special Menu']
  }
};

const GALLERY_CATEGORIES = ['All', 'Restaurant', 'Houseboats', 'Celebrations', 'Food', 'Backwaters', 'Sunsets'];
const GALLERY_IMAGES: Array<{src: string, category: string}> = []; // User requested gallery removed for now.

const scrollFadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.8, ease: "easeOut" }
};

const staggerContainer = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true, margin: "-100px" },
  transition: { staggerChildren: 0.2 }
};

const staggerItem = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" }
};

export default function AlappuzhaHome() {
  const { hash } = useLocation();
  const [activeGroup, setActiveGroup] = useState<string>('couple');
  const [activeGallery, setActiveGallery] = useState('All');

  useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => element.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    }
  }, [hash]);

  const recommendedBoat = HOUSEBOAT_RECOMMENDATIONS[activeGroup as keyof typeof HOUSEBOAT_RECOMMENDATIONS];

  const filteredGallery = activeGallery === 'All' 
    ? GALLERY_IMAGES 
    : GALLERY_IMAGES.filter(img => img.category === activeGallery);

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 font-sans selection:bg-teal-700/30 selection:text-teal-900 overflow-x-hidden">
      
      {/* 1. Hero Section */}
      <section className="relative h-[90vh] md:h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-slate-200">
          <motion.img 
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1.05, opacity: 0.9 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            src="https://images.unsplash.com/photo-1599487405270-864309b8214f?q=80&w=3132&auto=format&fit=crop"
            alt="Alappuzha Backwaters"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-white/40 to-transparent" />
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto flex flex-col items-center">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-sm font-semibold tracking-[0.3em] uppercase text-teal-900 mb-6 drop-shadow-md"
          >
            Welcome to the Venice of the East
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-5xl md:text-7xl lg:text-8xl font-serif text-slate-900 mb-8 leading-tight drop-shadow-2xl uppercase"
          >
            ASADO <span className="italic text-teal-700">ALAPPUZHA</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-lg md:text-2xl text-slate-600 font-light max-w-2xl mb-12"
          >
            Experience the serene backwaters, luxury houseboats, and exquisite culinary delights.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-6 w-full max-w-lg mx-auto"
          >
            <a 
              href="#houseboats" 
              className="flex-1 bg-teal-700 text-white px-8 py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-teal-600 transition-colors flex items-center justify-center border-2 border-teal-700"
            >
              Explore Houseboats
            </a>
            <Link 
              to="/alappuzha/menu" 
              className="flex-1 bg-transparent border-2 border-teal-700 text-teal-700 px-8 py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-teal-700 hover:text-white transition-colors flex items-center justify-center"
            >
              View Menu
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 2. Discover the Backwaters */}
      <section className="py-24 px-4 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-teal-600/5 via-transparent to-transparent opacity-50" />
        <motion.div {...scrollFadeUp} className="max-w-4xl mx-auto text-center relative z-10">
          <Ship className="w-12 h-12 text-teal-700 mx-auto mb-8 opacity-80" />
          <h2 className="text-3xl md:text-5xl font-serif text-slate-900 mb-8 leading-tight">
            A Harmony of Nature & Luxury
          </h2>
          <p className="text-xl text-slate-600 font-light leading-relaxed mb-8">
            Asado Alappuzha offers an immersive backwater experience. Whether you're dining by the lake, hosting a grand celebration, or drifting through the serene waters on our premium houseboats, we curate moments that last a lifetime.
          </p>
          <div className="w-24 h-[1px] bg-teal-700/50 mx-auto" />
        </motion.div>
      </section>

      {/* 3. Interactive Houseboat Curation */}
      <section id="houseboats" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...scrollFadeUp} className="text-center mb-16">
            <h2 className="text-sm font-bold text-teal-700 uppercase tracking-[0.3em] mb-4">Curated Experiences</h2>
            <h3 className="text-4xl md:text-5xl font-serif text-slate-900 mb-6">Find Your Perfect Houseboat</h3>
            <p className="text-slate-600 font-light text-lg">Select your travel group to see our recommendation.</p>
          </motion.div>
          
          <motion.div variants={staggerContainer} initial="initial" whileInView="whileInView" viewport={{ once: true, margin: "-100px" }} className="flex flex-wrap justify-center gap-4 mb-16">
            {TRAVEL_GROUPS.map(group => {
              const Icon = group.icon;
              const isActive = activeGroup === group.id;
              return (
                <motion.button
                  variants={staggerItem}
                  key={group.id}
                  onClick={() => setActiveGroup(group.id)}
                  className={\`flex items-center gap-3 px-6 py-4 rounded-full border transition-all duration-300 \${
                    isActive 
                      ? 'bg-teal-700 border-teal-700 text-white shadow-[0_0_20px_rgba(15,118,110,0.3)]' 
                      : 'bg-transparent border-teal-700/30 text-slate-600 hover:border-teal-700 hover:text-teal-700'
                  }\`}
                >
                  <Icon className={\`w-5 h-5 \${isActive ? 'text-white' : 'text-teal-700'}\`} />
                  <span className="font-bold uppercase tracking-wider text-xs">{group.label}</span>
                </motion.button>
              );
            })}
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeGroup}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="bg-slate-50 border border-teal-700/20 rounded-[24px] overflow-hidden flex flex-col md:flex-row shadow-2xl"
            >
              <div className="md:w-1/2 h-64 md:h-auto relative">
                <img 
                  src={recommendedBoat.img} 
                  alt={recommendedBoat.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-slate-50 to-transparent opacity-80 md:opacity-100" />
              </div>
              <div className="md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center z-10">
                <h4 className="text-3xl font-serif text-slate-900 mb-4">{recommendedBoat.title}</h4>
                <p className="text-slate-600 font-light leading-relaxed mb-8 text-lg">
                  {recommendedBoat.desc}
                </p>
                <div className="flex flex-wrap gap-3 mb-10">
                  {recommendedBoat.tags.map((tag, i) => (
                    <span key={i} className="inline-flex items-center gap-2 bg-white text-teal-700 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border border-teal-700/20">
                      <CheckCircle2 className="w-3 h-3" /> {tag}
                    </span>
                  ))}
                </div>
                <div>
                  <a 
                    href="#contact"
                    className="inline-flex items-center gap-2 bg-teal-700 text-white px-8 py-3 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-teal-600 transition-colors"
                  >
                    Enquire Now
                  </a>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* 4. Celebrate at Asado */}
      <section id="celebrations" className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-slate-200">
          <img 
            src="https://images.unsplash.com/photo-1592484080164-839213197171?q=80&w=2000&auto=format&fit=crop"
            alt="Celebrations"
            className="w-full h-full object-cover opacity-40"
          />
        </div>
        
        <div className="max-w-5xl mx-auto px-4 relative z-10 text-center">
          <motion.div {...scrollFadeUp}>
            <h2 className="text-sm font-bold text-teal-700 uppercase tracking-[0.3em] mb-4">Get-Togethers</h2>
            <h3 className="text-4xl md:text-6xl font-serif text-slate-900 mb-8">Friends & Office Celebrations</h3>
            <p className="text-xl text-slate-600 font-light max-w-3xl mx-auto mb-16">
              Make your milestones memorable with our curated celebration setups right by the backwaters.
            </p>
          </motion.div>

          <motion.div {...scrollFadeUp} transition={{ duration: 0.8, delay: 0.2 }} className="bg-white/80 backdrop-blur-md border border-teal-700/30 rounded-[24px] p-8 md:p-12 max-w-2xl mx-auto text-left shadow-2xl">
            <h4 className="text-2xl font-serif text-slate-900 mb-8 border-b border-teal-700/20 pb-4">Celebration Package Inclusions</h4>
            <div className="grid gap-6">
              {[
                { title: 'Dedicated Space', desc: 'Reserved area decorated with balloons and custom themes.' },
                { title: 'Custom Cake', desc: 'Complimentary celebration cake for groups over 10.' },
                { title: 'Special Menu', desc: 'Tailored buffet or unlimited a la carte options.' },
                { title: 'Live Entertainment', desc: 'Arrangements for live music or DJ upon request.' }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-teal-700/10 border border-teal-700/30 flex items-center justify-center shrink-0 mt-1">
                    <CheckCircle2 className="w-4 h-4 text-teal-700" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 mb-1">{item.title}</h5>
                    <p className="text-slate-600 text-sm font-light leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-10 text-center">
              <a 
                href="#contact"
                className="inline-block bg-teal-700 text-white px-8 py-3 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-teal-600 transition-colors"
              >
                Plan Your Event
              </a>
            </div>
            <div className="mt-6 text-center text-xs text-slate-500 font-light italic">
              *Complimentary celebration space is available with a minimum food purchase.
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* 5. Gallery */}
      <section id="gallery" className="py-24 bg-slate-50">
        <motion.div {...scrollFadeUp} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-sm font-bold text-teal-700 uppercase tracking-[0.3em] mb-4">Visual Journey</h2>
            <h3 className="text-4xl md:text-5xl font-serif text-slate-900">Gallery</h3>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {GALLERY_CATEGORIES.map(category => (
              <button
                key={category}
                onClick={() => setActiveGallery(category)}
                className={\`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 \${
                  activeGallery === category 
                    ? 'bg-teal-700 text-white' 
                    : 'bg-transparent text-slate-600 border border-teal-700/30 hover:border-teal-700 hover:text-teal-700'
                }\`}
              >
                {category}
              </button>
            ))}
          </div>

          {filteredGallery.length === 0 ? (
            <div className="text-center text-slate-600 font-light py-12">
              <p>Gallery will be updated soon.</p>
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredGallery.map((img, i) => (
                  <motion.div
                    key={img.src + i}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4 }}
                    className="group relative aspect-square overflow-hidden rounded-[16px] bg-white border border-teal-700/10"
                  >
                    <img 
                      src={img.src} 
                      alt={img.category} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-6 left-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0">
                      <span className="text-teal-700 text-xs font-bold uppercase tracking-widest bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full border border-teal-700/30">
                        {img.category}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* 6. Testimonials */}
      <section className="py-24 bg-white">
        <motion.div {...scrollFadeUp} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-sm font-bold text-teal-700 uppercase tracking-[0.3em] mb-4">Guest Experiences</h2>
          <h3 className="text-4xl md:text-5xl font-serif text-slate-900 mb-16">Google Reviews</h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                text: "The houseboat experience arranged by Asado was phenomenal. The food from their restaurant was the cherry on top. Truly a luxury backwater experience.",
                author: "Anjali S.",
                rating: 5
              },
              {
                text: "Celebrated our anniversary here. They set up the most beautiful candlelight dinner by the lake. Outstanding service and ambience.",
                author: "Rahul M.",
                rating: 5
              },
              {
                text: "The best place in Alappuzha for a relaxing evening. The live music, the view, and the Karimeen Pollichathu are a must-try!",
                author: "David W.",
                rating: 5
              }
            ].map((review, i) => (
              <motion.div variants={staggerItem} initial="initial" whileInView="whileInView" viewport={{ once: true, margin: "-50px" }} key={i} className="bg-slate-50 border border-teal-700/20 p-8 rounded-[24px] flex flex-col justify-between">
                <div>
                  <div className="flex justify-center gap-1 mb-6 text-teal-700">
                    {[...Array(review.rating)].map((_, j) => (
                      <span key={j}>★</span>
                    ))}
                  </div>
                  <p className="text-slate-600 italic font-light leading-relaxed mb-6">"{review.text}"</p>
                </div>
                <h5 className="text-slate-900 font-medium tracking-wide">— {review.author}</h5>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* 7. Location & Contact */}
      <section id="contact" className="py-24 bg-slate-50">
        <motion.div {...scrollFadeUp} className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            
            <div>
              <h2 className="text-sm font-bold text-teal-700 uppercase tracking-[0.3em] mb-4">Get In Touch</h2>
              <h3 className="text-4xl font-serif text-slate-900 mb-10">Contact Us</h3>
              
              <div className="space-y-12">
                <div>
                  <h4 className="text-teal-900 font-bold uppercase tracking-wider text-sm mb-4">Restaurant Enquiries</h4>
                  <div className="flex flex-col gap-4">
                    <a href="tel:+919876512345" className="flex items-center gap-4 text-slate-600 hover:text-teal-700 transition-colors">
                      <div className="w-10 h-10 rounded-full border border-teal-700/30 flex items-center justify-center shrink-0">
                        <Phone className="w-4 h-4" />
                      </div>
                      <span className="font-light">+91 98765 12345</span>
                    </a>
                  </div>
                </div>
                <div>
                  <h4 className="text-teal-900 font-bold uppercase tracking-wider text-sm mb-4">Houseboat Enquiries</h4>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <a 
                      href="tel:+919876512345"
                      className="flex-1 flex items-center justify-center gap-2 border border-teal-700/30 py-3 rounded-full text-slate-600 hover:border-teal-700 hover:text-teal-700 transition-all"
                    >
                      <Phone className="w-4 h-4" />
                      <span className="text-sm font-medium uppercase tracking-wider">Call</span>
                    </a>
                    <a 
                      href="https://wa.me/919876512345"
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 bg-[#25D366]/10 border border-[#25D366]/30 py-3 rounded-full text-[#25D366] hover:bg-[#25D366] hover:text-black transition-all"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-sm font-medium uppercase tracking-wider">WhatsApp</span>
                    </a>
                  </div>
                </div>
                <div>
                  <h4 className="text-teal-900 font-bold uppercase tracking-wider text-sm mb-4">Location</h4>
                  <div className="flex items-start gap-4 text-slate-600 mb-6">
                    <div className="w-10 h-10 rounded-full border border-teal-700/30 flex items-center justify-center shrink-0 mt-1">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <p className="font-light leading-relaxed">
                      Asado Cafe, Erezha,<br />
                      Mullakkal, Alappuzha,<br />
                      Kerala 688011
                    </p>
                  </div>
                  <a 
                    href="https://maps.app.goo.gl/BTdeG8hUQJL4P2pU7?g_st=ac"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 bg-transparent text-teal-700 border border-teal-700 px-6 py-2 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-teal-700 hover:text-white transition-colors"
                  >
                    Get Directions
                  </a>
                </div>
              </div>
            </div>

            <div className="relative rounded-[24px] overflow-hidden border border-teal-700/20 aspect-square lg:aspect-auto">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1m3!1d3936.6341238466636!2d76.3332467147775!3d9.499878293198083!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b0884fd35e46be9%3A0x6bfef8dcd4f5e74c!2sAlappuzha%2C%20Kerala!5e0!3m2!1sen!2sin!4v1655000000000!5m2!1sen!2sin" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 grayscale contrast-125 opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-700"
              ></iframe>
            </div>

          </div>
        </motion.div>
      </section>
      
      {/* Footer spacing */}
      <div className="h-12 bg-slate-50" />
    </div>
  );
}
\`;

fs.writeFileSync('src/pages/alappuzha/AlappuzhaHome.tsx', content);
