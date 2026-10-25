import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';

const industries = [
  {
    name: 'Manufacturing',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
    desc: 'Optimize supply chains, plant maintenance, and production planning.',
    vertical: 'Enterprise Vertical',
    heightClass: 'h-[420px] lg:h-[440px]'
  },
  {
    name: 'Retail & FMCG',
    image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=800&q=80',
    desc: 'Streamline inventory, order execution, and customer experiences.',
    vertical: 'Consumer & Retail',
    heightClass: 'h-[420px] lg:h-[470px]'
  },
  {
    name: 'Healthcare',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
    desc: 'Secure data management, clinical resources, and compliance tracking.',
    vertical: 'Life Sciences',
    heightClass: 'h-[420px] lg:h-[430px]'
  },
  {
    name: 'Automotive',
    image: '/images/automotive.png',
    desc: 'Just-in-time manufacturing, inventory workflows, and dealer management.',
    vertical: 'Mobility & Auto',
    heightClass: 'h-[420px] lg:h-[450px]'
  },
  {
    name: 'Logistics',
    image: 'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?auto=format&fit=crop&w=800&q=80',
    desc: 'Real-time fleet tracking, global freight, and warehouse management.',
    vertical: 'Supply & Transport',
    heightClass: 'h-[420px] lg:h-[430px]'
  },
  {
    name: 'Finance',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    desc: 'Strict regulatory compliance, financial accounting, and risk management.',
    vertical: 'Banking & Financial',
    heightClass: 'h-[420px] lg:h-[460px]'
  },
];

const IndustriesGrid = () => {
  const isReducedMotion = useReducedMotion();
  const [isDesktop, setIsDesktop] = useState(true);

  // Responsive window check to adapt directional offsets safely
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Directional entrance animation variants based on 3-column placement
  const getCardVariants = (colIndex) => {
    if (isReducedMotion) {
      return {
        hidden: { opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 },
        visible: { opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 }
      };
    }

    // On mobile / tablet: pure smooth upward fade (no horizontal movement to avoid overflow)
    if (!isDesktop) {
      return {
        hidden: { opacity: 0, y: 35 },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] }
        }
      };
    }

    // On desktop: Directional entrance by column
    if (colIndex === 0) {
      // Left column: arrives diagonally from bottom-left
      return {
        hidden: { opacity: 0, x: -55, y: 45, rotate: -1.2 },
        visible: { 
          opacity: 1, 
          x: 0, 
          y: 0, 
          rotate: 0,
          transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
        }
      };
    } else if (colIndex === 1) {
      // Center column: arrives upward with gentle scale transition
      return {
        hidden: { opacity: 0, x: 0, y: 55, scale: 0.96 },
        visible: { 
          opacity: 1, 
          x: 0, 
          y: 0, 
          scale: 1,
          transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
        }
      };
    } else {
      // Right column: arrives diagonally from bottom-right
      return {
        hidden: { opacity: 0, x: 55, y: 45, rotate: 1.2 },
        visible: { 
          opacity: 1, 
          x: 0, 
          y: 0, 
          rotate: 0,
          transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
        }
      };
    }
  };

  // Subtle vertical rhythm offsets for editorial layout
  const getEditorialOffsetClass = (index) => {
    const colIndex = index % 3;
    if (colIndex === 0) return 'lg:mt-0';
    if (colIndex === 1) return 'lg:mt-8';
    return 'lg:mt-3';
  };

  return (
    <section className="py-24 sm:py-32 bg-[#F8F5EE] px-4 sm:px-6 lg:px-8 relative border-b border-[#E7E0D3] overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 -left-[10%] w-[550px] h-[550px] rounded-full bg-[radial-gradient(circle,rgba(23,75,57,0.035),transparent_70%)] blur-[100px]" />
        <div className="absolute bottom-1/3 -right-[10%] w-[550px] h-[550px] rounded-full bg-[radial-gradient(circle,rgba(184,138,59,0.035),transparent_70%)] blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* ================= SECTION INTRODUCTION ================= */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 sm:mb-20 gap-6">
          <div className="max-w-2xl">
            
            {/* Eyebrow Label */}
            <motion.div
              initial={isReducedMotion ? false : { opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAF0E8] border border-[#174B39]/20 text-[#174B39] text-xs font-bold tracking-[0.2em] uppercase mb-4 self-start shadow-2xs"
            >
              <span className="w-2 h-2 rounded-full bg-[#B88A3B]" />
              <span>INDUSTRIES WE SUPPORT</span>
            </motion.div>

            {/* Main Heading */}
            <motion.h2
              initial={isReducedMotion ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.65, delay: 0.1, ease: 'easeOut' }}
              className="text-3xl sm:text-4xl lg:text-[42px] font-serif font-bold text-[#252720] mb-4 tracking-tight leading-[1.18]"
            >
              Expertise shaped around your industry.
            </motion.h2>

            {/* Supporting Copy */}
            <motion.p
              initial={isReducedMotion ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.65, delay: 0.2, ease: 'easeOut' }}
              className="text-base sm:text-lg text-[#66665D] leading-relaxed font-sans"
            >
              Every industry operates differently. Explore how DYC's SAP expertise, ERP capabilities, and staffing solutions can align with your business requirements.
            </motion.p>
          </div>

          {/* Action Affordance */}
          <motion.div
            initial={isReducedMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.65, delay: 0.3, ease: 'easeOut' }}
            className="self-start md:self-end shrink-0"
          >
            <Link
              to="/industries"
              className="btn-secondary px-6 py-3.5 whitespace-nowrap text-sm sm:text-base font-semibold group flex items-center justify-center gap-2.5"
            >
              <span>View All Sectors</span>
              <span aria-hidden="true" className="group-hover:translate-x-1 transition-transform text-[#B88A3B] font-bold">→</span>
            </Link>
          </motion.div>
        </div>

        {/* ================= EDITORIAL 3-COLUMN MASONRY-STYLE GRID ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
          {industries.map((ind, idx) => {
            const colIndex = idx % 3;
            const variants = getCardVariants(colIndex);
            const offsetClass = getEditorialOffsetClass(idx);
            const staggerDelay = 0.18 + (idx % 3) * 0.12 + Math.floor(idx / 3) * 0.16;

            return (
              <motion.div
                key={ind.name}
                custom={colIndex}
                variants={variants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  ...variants.visible.transition,
                  delay: isReducedMotion ? 0 : staggerDelay
                }}
                className={`w-full ${offsetClass}`}
              >
                <Link 
                  to="/industries" 
                  className="block group h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#174B39] focus-visible:ring-offset-2 rounded-2xl"
                >
                  <div className={`relative rounded-2xl overflow-hidden ${ind.heightClass} flex flex-col justify-between p-7 sm:p-8 border border-[#E7E0D3] group-hover:border-[#174B39]/40 transition-all duration-500 shadow-[0_4px_20px_rgba(37,39,32,0.04)] group-hover:shadow-[0_16px_40px_rgba(23,75,57,0.12)] group-hover:-translate-y-1.5 bg-[#FDFBF7]`}>
                    
                    {/* Background Image Layer with Controlled Clarity & Subtle Zoom */}
                    <div className="absolute inset-0 overflow-hidden">
                      <img
                        src={ind.image}
                        alt={ind.name}
                        loading="lazy"
                        className="w-full h-full object-cover object-center transform group-hover:scale-[1.04] transition-transform duration-800 ease-out"
                      />
                      
                      {/* Top Vignette for Photographic Definition */}
                      <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-transparent pointer-events-none" />

                      {/* Controlled Warm Cream Gradient near the text area to ensure readability without washing out the photo */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#FDFBF7] via-[#FDFBF7]/92 via-42% to-transparent pointer-events-none" />

                      {/* Subtle Forest Green Hover Glow */}
                      <div className="absolute inset-0 bg-[#174B39]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    </div>

                    {/* Top Row: Category Tag & Sector Index */}
                    <div className="relative z-10 flex items-center justify-between">
                      <span className="text-[10px] sm:text-[11px] font-bold text-[#B88A3B] uppercase tracking-[0.18em] px-3 py-1 rounded-full bg-white/95 backdrop-blur-md border border-[#E7E0D3] shadow-xs">
                        {ind.vertical}
                      </span>
                      <span className="text-xs font-serif font-bold text-white/95 drop-shadow-md px-2 py-0.5 rounded bg-black/20 backdrop-blur-xs">
                        0{idx + 1}
                      </span>
                    </div>

                    {/* Bottom Content Area */}
                    <div className="relative z-10 mt-auto pt-6">
                      <h3 className="text-2xl sm:text-[26px] font-serif font-bold text-[#252720] mb-2 tracking-tight group-hover:text-[#174B39] transition-colors duration-300">
                        {ind.name}
                      </h3>
                      
                      <p className="text-[#66665D] text-sm sm:text-base leading-relaxed mb-5 font-sans line-clamp-2">
                        {ind.desc}
                      </p>

                      <div className="inline-flex items-center gap-2 text-sm font-bold text-[#174B39] group-hover:text-[#B88A3B] transition-colors">
                        <span>Explore Sector Solutions</span>
                        <span aria-hidden="true" className="transform group-hover:translate-x-1.5 transition-transform duration-300 text-[#B88A3B] font-bold">→</span>
                      </div>
                    </div>

                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* ================= SECTION BOTTOM SUBTLE ADVICE STRIP ================= */}
        <motion.div
          initial={isReducedMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-14 sm:mt-18 text-center"
        >
          <p className="text-xs sm:text-sm text-[#66665D] font-sans">
            Operating in a specialized industry or cross-sector ecosystem?{' '}
            <Link 
              to="/contact" 
              className="text-[#174B39] font-bold underline underline-offset-4 decoration-[#B88A3B] hover:text-[#B88A3B] transition-colors"
            >
              Discuss your sector requirements with our team →
            </Link>
          </p>
        </motion.div>

      </div>
    </section>
  );
};

export default IndustriesGrid;
