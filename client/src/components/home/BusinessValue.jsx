import { useState, useRef, useEffect } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';

const advantageSections = [
  {
    number: '01',
    title: 'Connected operations',
    description: 'Align business workflows and enterprise systems so teams can work together with greater clarity and less operational friction.',
    tagline: 'Enterprise Workflow Harmony',
    accentColor: '#174B39'
  },
  {
    number: '02',
    title: 'Visibility that informs decisions',
    description: 'Make processes, responsibilities, and priorities easier to understand, helping teams make more informed day-to-day decisions.',
    tagline: 'Operational Clarity & Insights',
    accentColor: '#174B39'
  },
  {
    number: '03',
    title: 'Expertise where it matters',
    description: 'Explore SAP resources, support, ERP solutions, and staffing options aligned with the skills and scope your project requires.',
    tagline: 'SAP, ERP & Strategic Talent',
    accentColor: '#174B39'
  },
  {
    number: '04',
    title: 'Progress with purpose',
    description: 'Start with clear requirements, agree on priorities, and keep technology initiatives focused on outcomes your team can evaluate.',
    tagline: 'Milestone-Driven Execution',
    accentColor: '#174B39'
  }
];

// Single scroll-reactive storytelling item
const StorySectionItem = ({ 
  item, 
  index, 
  isActive, 
  onActivate,
  isReducedMotion 
}) => {
  const itemRef = useRef(null);
  
  // Observes when this item is in the central reading zone of the viewport
  const isInView = useInView(itemRef, {
    margin: '-28% 0px -32% 0px',
    amount: 'some'
  });

  useEffect(() => {
    if (isInView) {
      onActivate(index);
    }
  }, [isInView, index, onActivate]);

  // If reduced motion is requested, show all sections with comfortable full opacity
  const active = isReducedMotion ? true : isActive;

  return (
    <div 
      id={`advantage-step-${index}`}
      ref={itemRef} 
      className="py-14 sm:py-20 lg:py-24 border-b border-[#E7E0D3]/80 last:border-b-0 transition-colors duration-500"
    >
      <motion.div
        animate={{
          opacity: active ? 1 : 0.36,
          y: active ? 0 : 10,
          scale: active ? 1 : 0.985
        }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1.0] }}
        className="relative pl-6 sm:pl-8 border-l-2 transition-all duration-500"
        style={{
          borderColor: active ? '#B88A3B' : 'transparent'
        }}
      >
        {/* Numerical Marker & Eyebrow */}
        <div className="flex items-center gap-3.5 mb-3">
          <span 
            className="text-2xl sm:text-3xl font-serif font-bold tracking-tight transition-colors duration-500"
            style={{ color: active ? '#B88A3B' : '#C5BFB5' }}
          >
            {item.number}
          </span>
          <span className="w-6 h-px bg-[#E7E0D3]" />
          <span 
            className="text-xs uppercase font-semibold tracking-widest transition-colors duration-500"
            style={{ color: active ? '#174B39' : '#8A897C' }}
          >
            {item.tagline}
          </span>
        </div>

        {/* Section Heading */}
        <h3 
          className="text-2xl sm:text-3xl lg:text-[34px] font-serif font-bold leading-[1.2] mb-4 tracking-tight transition-colors duration-500"
          style={{
            color: active ? '#174B39' : '#8A897C'
          }}
        >
          {item.title}
        </h3>

        {/* Section Description */}
        <p 
          className="text-base sm:text-lg leading-relaxed max-w-xl font-sans transition-colors duration-500"
          style={{
            color: active ? '#252720' : '#8A897C'
          }}
        >
          {item.description}
        </p>

        {/* Active subtle status pill */}
        {active && (
          <motion.div 
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35 }}
            className="mt-5 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF0E8] border border-[#174B39]/20 text-[11px] font-semibold text-[#174B39]"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#B88A3B] animate-pulse" />
            <span>Active Focus Point</span>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

const BusinessValue = () => {
  const [activeStep, setActiveStep] = useState(0);
  const isReducedMotion = useReducedMotion();

  const handleStepClick = (index) => {
    setActiveStep(index);
    const element = document.getElementById(`advantage-step-${index}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <section className="relative py-24 sm:py-32 bg-[#FDFBF7] px-4 sm:px-6 lg:px-8 border-b border-[#E7E0D3] overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -right-[10%] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(23,75,57,0.04),transparent_70%)] blur-[90px]" />
        <div className="absolute bottom-1/4 -left-[10%] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(184,138,59,0.04),transparent_70%)] blur-[90px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* ================= LEFT COLUMN: STICKY EDITORIAL HERO & IMAGE ================= */}
          <div className="lg:col-span-5 lg:sticky lg:top-28 lg:self-start">
            
            {/* Small uppercase eyebrow label */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAF0E8] border border-[#174B39]/20 text-[#174B39] text-xs font-bold tracking-[0.2em] uppercase mb-5 self-start shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#B88A3B]" />
              <span>THE DYC ADVANTAGE</span>
            </div>

            {/* Strong main heading */}
            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-serif font-bold text-[#252720] leading-[1.18] mb-5 tracking-tight">
              Better systems. The right people. <span className="text-[#174B39] italic">Clearer progress</span>.
            </h2>

            {/* Short introductory paragraph */}
            <p className="text-base sm:text-lg text-[#66665D] leading-relaxed font-sans mb-8">
              Technology delivers greater value when systems, people, and business priorities work together. DYC brings SAP expertise, ERP capabilities, and staffing support into the conversation—shaped around your business requirements.
            </p>

            {/* Supporting Image: Enterprise Connected Network */}
            <div className="relative rounded-2xl overflow-hidden border border-[#E7E0D3] shadow-[0_12px_32px_rgba(23,75,57,0.07)] bg-white mb-8 group">
              <img 
                src="/images/enterprise-connected-network.jpg" 
                alt="Connected enterprise operations, systems and skilled professionals"
                className="w-full aspect-[16/10] object-cover group-hover:scale-[1.02] transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#103728]/60 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-white">
                <span className="font-semibold tracking-wide drop-shadow-sm">Connected Enterprise Ecosystem</span>
                <span className="text-[#D7B875] font-serif italic text-sm">SAP · ERP · Staffing</span>
              </div>
            </div>

            {/* Subtle Progress Indicator / Active Step Tracker */}
            <div className="bg-white/90 backdrop-blur-xs p-4 sm:p-5 rounded-2xl border border-[#E7E0D3] shadow-xs mb-8">
              <div className="flex items-center justify-between mb-3 text-xs">
                <span className="font-bold text-[#174B39] tracking-wider uppercase">Reading Progress</span>
                <span className="font-serif font-bold text-[#B88A3B] text-sm">
                  {advantageSections[activeStep].number} / 04
                </span>
              </div>

              {/* Progress bar tracks */}
              <div className="grid grid-cols-4 gap-2 mb-3">
                {advantageSections.map((sec, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleStepClick(idx)}
                    aria-label={`Jump to step ${sec.number}: ${sec.title}`}
                    className="h-1.5 rounded-full transition-all duration-400 cursor-pointer"
                    style={{
                      backgroundColor: idx === activeStep ? '#B88A3B' : idx < activeStep ? '#174B39' : '#E7E0D3'
                    }}
                  />
                ))}
              </div>

              <div className="text-xs text-[#66665D] font-medium flex items-center justify-between">
                <span>{advantageSections[activeStep].title}</span>
                <span className="text-[11px] text-[#B88A3B] italic">Click to jump</span>
              </div>
            </div>

            {/* Closing Line */}
            <div className="pt-6 border-t border-[#E7E0D3] flex items-center gap-3">
              <div className="w-1.5 h-8 bg-[#B88A3B] rounded-full shrink-0" />
              <p className="text-sm sm:text-base font-serif italic font-medium text-[#174B39]">
                "One business. Connected expertise. A clearer way forward."
              </p>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: SCROLL-REACTIVE STORYTELLING SECTIONS ================= */}
          <div className="lg:col-span-7 flex flex-col divide-y divide-[#E7E0D3]/80">
            {advantageSections.map((item, index) => (
              <StorySectionItem
                key={item.number}
                item={item}
                index={index}
                isActive={activeStep === index}
                onActivate={setActiveStep}
                isReducedMotion={isReducedMotion}
              />
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export default BusinessValue;
