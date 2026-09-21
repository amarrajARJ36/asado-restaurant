import { motion } from 'motion/react';
import { 
  Heart, 
  Gift, 
  GlassWater, 
  Camera, 
  Music, 
  Utensils, 
  Phone,
  MessageCircle
} from 'lucide-react';
import { cn } from '../../lib/utils';

export default function KollamCelebrations() {
  const scrollIntoView = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-[#0F1115] min-h-screen text-[#F8F6F2] font-sans selection:bg-[#D4AF37] selection:text-[#0F1115]">
      
      {/* 1. Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-black">
          <img 
            src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=3270&auto=format&fit=crop"
            alt="Evening Celebration"
            className="w-full h-full object-cover opacity-60 scale-105 motion-safe:animate-[pulse_20s_ease-in-out_infinite]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F1115] via-black/40 to-transparent" />
        </div>
        
        {/* Subtle Background Effects */}
        <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#D4AF37]/5 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center mt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-sm font-semibold tracking-[0.3em] uppercase text-[#E8CBA8] mb-6 drop-shadow-md"
          >
            CELEBRATE LIFE'S SPECIAL MOMENTS
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-5xl md:text-7xl lg:text-8xl font-serif text-[#F8F6F2] mb-8 leading-tight drop-shadow-2xl uppercase"
          >
            WITH <span className="italic text-[#D4AF37]">ASADO</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-lg md:text-xl text-[#B8B8B8] font-light max-w-2xl mx-auto mb-12 drop-shadow-lg leading-relaxed"
          >
            Beautiful Ambience. Delicious Food. Memorable Experiences.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <button 
              onClick={() => scrollIntoView('enquiry')}
              className="bg-[#D4AF37] text-[#0F1115] px-10 py-4 rounded-full font-bold tracking-widest hover:scale-105 transition-transform duration-300 shadow-[0_0_20px_rgba(212,175,55,0.3)] text-sm uppercase"
            >
              Plan Your Celebration
            </button>
          </motion.div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="flex items-center justify-center py-12 text-[#D4AF37]/50">
        <span className="tracking-[0.5em]">────────────</span>
        <span className="mx-4 text-xl">✦</span>
        <span className="tracking-[0.5em]">────────────</span>
      </div>

      {/* 2. Celebrate Every Occasion */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-serif text-[#F8F6F2]">Occasions We Host</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {[
            { 
              title: "Birthday", 
              desc: "Small birthday celebrations", 
              img: "https://images.unsplash.com/photo-1535295972055-1c762f4483e5?q=80&w=2000&auto=format&fit=crop"
            },
            { 
              title: "Anniversary", 
              desc: "Romantic decorations", 
              img: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2000&auto=format&fit=crop"
            },
            { 
              title: "Baby Shower", 
              desc: "Elegant decorations", 
              img: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?q=80&w=2000&auto=format&fit=crop"
            },
            { 
              title: "Proposal", 
              desc: "Private romantic setup", 
              img: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=2000&auto=format&fit=crop"
            }
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: i * 0.1, duration: 0.8 }}
              className="group relative overflow-hidden rounded-[24px] bg-[#1A1D22] aspect-[4/3] flex flex-col justify-end hover:-translate-y-2 transition-all duration-500 hover:shadow-[0_10px_40px_rgba(212,175,55,0.15)] hover:border-[#D4AF37]/30 border border-transparent cursor-pointer"
            >
              <img 
                src={item.img} 
                alt={item.title} 
                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 group-hover:opacity-80 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F1115] via-[#0F1115]/50 to-transparent" />
              
              <div className="relative z-10 p-8 md:p-10 flex flex-col items-center text-center">
                <h3 className="text-3xl font-serif text-[#F8F6F2] mb-3 group-hover:text-[#D4AF37] transition-colors">{item.title}</h3>
                <p className="text-[#B8B8B8] font-light text-lg">Celebrate with delicious food and beautiful decorations.</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Section Divider */}
      <div className="flex items-center justify-center py-12 text-[#D4AF37]/50">
        <span className="tracking-[0.5em]">────────────</span>
        <span className="mx-4 text-xl">✦</span>
        <span className="tracking-[0.5em]">────────────</span>
      </div>

      {/* 3. Decoration Packages */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-serif text-[#F8F6F2] mb-4">Decoration Packages</h2>
          <p className="text-[#B8B8B8] font-light text-lg max-w-2xl mx-auto">Elevate your celebration with our carefully curated setups.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Complimentary",
              subtitle: "Perfect for cake cutting",
              price: "FREE",
              features: ["Reserved Table", "Celebration Space", "Music"],
              badge: "WITH FOOD ORDER",
              isPremium: false
            },
            {
              title: "Signature Decoration",
              subtitle: "Balloon & Theme Decor",
              price: "Starting from ₹1500",
              features: ["Balloon Decoration", "Cake Table Setup", "Theme Decor", "Customized Design"],
              isPremium: true
            },
            {
              title: "Premium Celebration",
              subtitle: "Luxury Experiences",
              price: "Custom Quote",
              features: ["Luxury Balloon Setup", "Floral Decoration", "Photo Corner", "Personalized Theme"],
              isPremium: true
            }
          ].map((pkg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className={cn(
                "group relative rounded-[24px] p-8 flex flex-col items-center text-center transition-all duration-500 overflow-hidden",
                pkg.isPremium 
                  ? "bg-[#1A1D22] border border-[#D4AF37]/20 hover:border-[#D4AF37]/50 hover:shadow-[0_0_30px_rgba(212,175,55,0.1)]" 
                  : "bg-white/5 border border-white/10 hover:border-white/20 backdrop-blur-md"
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-[#D4AF37]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10 w-full">
                <div className="text-[#D4AF37]/50 mb-6">━━━━━━━━━━━━━━━━━━</div>
                <h3 className="text-2xl font-serif text-[#F8F6F2] mb-1">{pkg.title}</h3>
                <p className="text-[#B8B8B8] font-light text-sm mb-6 h-10">{pkg.subtitle}</p>
                
                <div className="text-2xl font-light text-[#E8CBA8] mb-8">{pkg.price}</div>
                
                {pkg.badge && (
                  <div className="inline-block bg-[#0F1115] border border-[#D4AF37]/30 text-[#D4AF37] text-xs px-3 py-1 rounded-full mb-6 uppercase tracking-wider">
                    {pkg.badge}
                  </div>
                )}
                
                <ul className="space-y-4 mb-8 text-left inline-block w-full max-w-[200px]">
                  {pkg.features.map((feat, j) => (
                    <li key={j} className="flex items-center text-[#F8F6F2] font-light">
                      <span className="text-[#D4AF37] mr-3">✔</span>
                      {feat}
                    </li>
                  ))}
                </ul>
                
                <div className="text-[#D4AF37]/50 mt-auto">━━━━━━━━━━━━━━━━━━</div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>



      {/* 5. Customer Memories */}
      <section className="py-12 overflow-hidden">
        <div className="text-center mb-16 px-4">
          <h2 className="text-3xl md:text-5xl font-serif text-[#F8F6F2]">Customer Memories</h2>
          <p className="text-[#B8B8B8] font-light mt-4">Memories will be updated soon.</p>
        </div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex gap-4 px-4 overflow-x-auto pb-8 snap-x snap-mandatory hide-scrollbar max-w-[1600px] mx-auto"
        >
          {([] as string[]).map((img, i) => (
            <div key={i} className="shrink-0 w-[280px] md:w-[400px] aspect-square rounded-[24px] overflow-hidden snap-center relative group border border-white/5">
              <img src={img} alt="Memory" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            </div>
          ))}
        </motion.div>
      </section>

      {/* 8. Event Enquiry */}
      <section id="enquiry" className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#1A1D22] rounded-[32px] p-10 md:p-16 text-center relative overflow-hidden border border-[#D4AF37]/30 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#D4AF37]/10 via-transparent to-transparent opacity-50" />
            
            <div className="relative z-10">
              <h2 className="text-sm font-bold text-[#D4AF37] uppercase tracking-[0.3em] mb-4">Bookings</h2>
              <h3 className="text-4xl md:text-5xl font-serif text-[#F8F6F2] mb-12">Let's Plan Your Celebration</h3>
              
              <div className="flex flex-col sm:flex-row justify-center gap-6">
                <a 
                  href="tel:09061114112"
                  className="group flex items-center justify-center gap-3 bg-[#D4AF37] text-[#0F1115] px-8 py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-transparent hover:text-[#D4AF37] border-2 border-[#D4AF37] transition-all duration-300"
                >
                  <Phone className="w-4 h-4" />
                  Call Now
                </a>
                <a 
                  href="https://wa.me/91906113114"
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center justify-center gap-3 bg-transparent border-2 border-[#D4AF37] text-[#D4AF37] px-8 py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-[#D4AF37] hover:text-[#0F1115] transition-all duration-300"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer spacing */}
      <div className="h-12 bg-[#0F1115]" />
    </div>
  );
}
