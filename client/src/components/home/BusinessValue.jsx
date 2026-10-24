import { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const advantageSections = [
  {
    number: '01',
    title: 'Connected operations',
    description: 'Align business workflows and enterprise systems so teams can work together with greater clarity and less operational friction.',
    tagline: 'Enterprise Workflow Harmony'
  },
  {
    number: '02',
    title: 'Visibility that informs decisions',
    description: 'Make processes, responsibilities, and priorities easier to understand, helping teams make more informed day-to-day decisions.',
    tagline: 'Operational Clarity & Insights'
  },
  {
    number: '03',
    title: 'Expertise where it matters',
    description: 'Explore SAP resources, support, ERP solutions, and staffing options aligned with the skills and scope your project requires.',
    tagline: 'SAP, ERP & Strategic Talent'
  },
  {
    number: '04',
    title: 'Progress with purpose',
    description: 'Start with clear requirements, agree on priorities, and keep technology initiatives focused on outcomes your team can evaluate.',
    tagline: 'Milestone-Driven Execution'
  }
];

const BusinessValue = () => {
  const [activeStep, setActiveStep] = useState(0);
  const isReducedMotion = useReducedMotion();

  // Scroll position listener: detects which right-column section is closest to reading line (~40% of viewport)
  useEffect(() => {
    const handleScroll = () => {
      const readingLine = window.innerHeight * 0.42;
      let closestIdx = 0;
      let minDistance = Infinity;

      advantageSections.forEach((_, idx) => {
        const el = document.getElementById(`advantage-step-${idx}`);
        if (el) {
          const rect = el.getBoundingClientRect();
          const elementMid = rect.top + rect.height * 0.35;
          const dist = Math.abs(elementMid - readingLine);
          if (dist < minDistance) {
            minDistance = dist;
            closestIdx = idx;
          }
        }
      });

      setActiveStep(closestIdx);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section 
      id="dyc-advantage-section"
      className="relative bg-[#FDFBF7] px-4 sm:px-6 lg:px-8 border-b border-[#E7E0D3]"
    >
      {/* Background ambient lighting */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -right-[10%] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(23,75,57,0.035),transparent_70%)] blur-[90px]" />
        <div className="absolute bottom-1/4 -left-[10%] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(184,138,59,0.035),transparent_70%)] blur-[90px]" />
      </div>

      <div className="max-w-7xl mx-auto py-24 sm:py-32">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* ================= LEFT COLUMN: PINNED / STICKY ON DESKTOP ================= */}
          <div className="lg:col-span-5 lg:sticky lg:top-32 lg:self-start">
            
            {/* Small uppercase eyebrow label */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAF0E8] border border-[#174B39]/20 text-[#174B39] text-xs font-bold tracking-[0.2em] uppercase mb-6 self-start shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#B88A3B]" />
              <span>THE DYC ADVANTAGE</span>
            </div>

            {/* Strong main heading */}
            <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-serif font-bold text-[#252720] leading-[1.16] mb-6 tracking-tight">
              Better systems. The right people. <span className="text-[#174B39] italic">Clearer progress</span>.
            </h2>

            {/* Short introductory paragraph */}
            <p className="text-base sm:text-lg text-[#66665D] leading-relaxed font-sans mb-10 max-w-lg">
              Technology delivers greater value when systems, people, and business priorities work together. DYC brings SAP expertise, ERP capabilities, and staffing support into the conversation—shaped around your business requirements.
            </p>

            {/* Closing Line */}
            <div className="pt-6 border-t border-[#E7E0D3] flex items-center gap-3.5 max-w-lg">
              <div className="w-1.5 h-8 bg-[#B88A3B] rounded-full shrink-0" />
              <p className="text-sm sm:text-base font-serif italic font-medium text-[#174B39] leading-snug">
                "One business. Connected expertise. A clearer way forward."
              </p>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: SCROLLS FREELY PAST THE PINNED LEFT COLUMN ================= */}
          <div className="lg:col-span-7 flex flex-col">
            {advantageSections.map((item, index) => {
              const isActive = isReducedMotion ? true : activeStep === index;

              return (
                <div
                  key={item.number}
                  id={`advantage-step-${index}`}
                  className="min-h-[55vh] flex flex-col justify-center py-20 sm:py-28 border-b border-[#E7E0D3]/80 last:border-b-0 transition-all duration-500"
                >
                  <motion.div
                    animate={{
                      opacity: isActive ? 1 : 0.32,
                      y: isActive ? 0 : 8,
                      scale: isActive ? 1 : 0.985
                    }}
                    transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1.0] }}
                    className="relative pl-6 sm:pl-9 border-l-2 transition-all duration-500"
                    style={{
                      borderColor: isActive ? '#B88A3B' : 'transparent'
                    }}
                  >
                    {/* Numerical Marker & Eyebrow */}
                    <div className="flex items-center gap-3.5 mb-3.5">
                      <span 
                        className="text-3xl sm:text-4xl font-serif font-bold tracking-tight transition-colors duration-500"
                        style={{ color: isActive ? '#B88A3B' : '#C5BFB5' }}
                      >
                        {item.number}
                      </span>
                      <span className="w-8 h-px bg-[#E7E0D3]" />
                      <span 
                        className="text-xs uppercase font-semibold tracking-widest transition-colors duration-500"
                        style={{ color: isActive ? '#174B39' : '#8A897C' }}
                      >
                        {item.tagline}
                      </span>
                    </div>

                    {/* Section Title */}
                    <h3 
                      className="text-2xl sm:text-3xl lg:text-[36px] font-serif font-bold leading-[1.2] mb-4 tracking-tight transition-colors duration-500"
                      style={{
                        color: isActive ? '#174B39' : '#8A897C'
                      }}
                    >
                      {item.title}
                    </h3>

                    {/* Section Description */}
                    <p 
                      className="text-base sm:text-lg lg:text-xl leading-relaxed max-w-xl font-sans transition-colors duration-500"
                      style={{
                        color: isActive ? '#252720' : '#8A897C'
                      }}
                    >
                      {item.description}
                    </p>
                  </motion.div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
};

export default BusinessValue;
