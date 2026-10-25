import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Hero = () => {
  return (
    <section className="relative bg-[#F8F5EE] overflow-hidden text-[#252720] pt-16 pb-20 md:pt-24 md:pb-28 px-4 sm:px-6 lg:px-8 border-b border-[#E7E0D3]">

      {/* Background ambient warm illumination */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] right-[10%] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle_at_center,rgba(23,75,57,0.06),transparent_65%)] blur-[90px]" />
        <div className="absolute top-[40%] -left-[10%] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle_at_center,rgba(184,138,59,0.05),transparent_65%)] blur-[80px]" />
        {/* Subtle architectural grid pattern */}
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#174B39_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10 grid lg:grid-cols-12 gap-12 lg:gap-14 items-center">

        {/* ================= LEFT COLUMN: EDITORIAL CONTENT ================= */}
        <div className="lg:col-span-6 flex flex-col justify-center">

          {/* Eyebrow Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#EAF0E8] border border-[#174B39]/20 text-[#174B39] text-xs font-bold tracking-[0.2em] uppercase mb-6 self-start shadow-2xs"
          >
            <span className="w-2 h-2 rounded-full bg-[#B88A3B]"></span>
            <span>SAP · ERP · STAFFING</span>
          </motion.div>

          {/* Editorial Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-[58px] font-serif font-bold leading-[1.14] mb-6 tracking-tight text-[#252720]"
          >
            Empowering Businesses With the Right <span className="text-[#174B39] italic">People</span> and <span className="text-[#B88A3B]">Technology</span>.
          </motion.h1>

          {/* Supporting Copy */}
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
            className="text-base sm:text-lg lg:text-xl text-[#66665D] mb-10 max-w-xl leading-relaxed font-sans"
          >
            SAP expertise, enterprise ERP solutions, and skilled professionals to help businesses work smarter and grow with confidence.
          </motion.p>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link
              to="/contact"
              className="btn-primary px-7 py-3.5 text-base sm:text-lg font-semibold shadow-[0_4px_16px_rgba(23,75,57,0.25)] hover:shadow-[0_8px_24px_rgba(23,75,57,0.35)]"
            >
              Discuss Your Requirements
            </Link>
            <a
              href="#services"
              className="btn-secondary px-7 py-3.5 text-base sm:text-lg font-semibold group flex items-center justify-center gap-2.5"
            >
              <span>Explore Our Services</span>
              <span aria-hidden="true" className="group-hover:translate-x-1 transition-transform text-[#B88A3B] font-bold">→</span>
            </a>
          </motion.div>

        </div>

        {/* ================= RIGHT COLUMN: REFINED CORPORATE VISUAL ================= */}
        <div className="lg:col-span-6 relative flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
            className="relative w-full flex items-center justify-center"
          >
            {/* Ambient warm radial glow behind the visual */}
            <div className="absolute inset-0 w-full h-full rounded-full bg-[radial-gradient(circle_at_center,rgba(184,138,59,0.09),transparent_70%)] blur-2xl pointer-events-none" />

            {/* Seamless Visual without white boundary, tall full height */}
            <img
              src="/images/hero-sap-ecosystem.png"
              alt="Dinesh Yadav & Company SAP, ERP & Enterprise Capability Ecosystem"
              className="w-full max-w-[580px] lg:max-w-[660px] h-auto max-h-[560px] lg:max-h-[640px] object-contain mix-blend-multiply drop-shadow-[0_24px_48px_rgba(23,75,57,0.14)] transform hover:scale-[1.02] transition-transform duration-700 relative z-10"
            />
          </motion.div>
        </div>

      </div>
    </section>
  );
};

export default Hero;
