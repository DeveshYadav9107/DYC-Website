import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCpu, FiUsers, FiDatabase } from 'react-icons/fi';

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
        <div className="lg:col-span-6 relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
            className="relative"
          >
            {/* Outer Decorative Framing Accent */}
            <div className="absolute -inset-2.5 rounded-[2.5rem] bg-gradient-to-tr from-[#174B39]/15 via-[#B88A3B]/15 to-transparent blur-xs pointer-events-none" />

            {/* Main Visual Box with Editorial Card Treatment */}
            <div className="relative p-2.5 sm:p-3 bg-[#FDFBF7] rounded-[2.2rem] border border-[#E7E0D3] shadow-[0_20px_50px_rgba(23,75,57,0.12)]">
              <div className="relative overflow-hidden rounded-[1.8rem] aspect-[4/3]">
                <img
                  src="/images/hero-forest-consulting.jpg"
                  alt="Dinesh Yadav & Company enterprise technology and consulting team"
                  className="w-full h-full object-cover transform hover:scale-[1.02] transition-transform duration-700"
                />

                {/* Subtle warm gradient overlay to enhance visual richness */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#103728]/30 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Floating Restrained Card 1: SAP Solutions */}
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-4 -left-4 sm:-left-6 bg-white/95 backdrop-blur-md border border-[#E7E0D3] rounded-2xl p-3 sm:p-3.5 shadow-[0_8px_24px_rgba(37,39,32,0.1)] flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-[#EAF0E8] text-[#174B39] flex items-center justify-center shrink-0">
                  <FiCpu className="text-xl text-[#174B39]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#252720]">SAP Solutions</p>
                  <p className="text-[11px] text-[#66665D]">S/4HANA & ECC Advisory</p>
                </div>
              </motion.div>

              {/* Floating Restrained Card 2: Skilled Professionals */}
              <motion.div
                animate={{ y: [0, 4, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-5 left-6 sm:left-8 bg-white/95 backdrop-blur-md border border-[#E7E0D3] rounded-2xl p-3 sm:p-3.5 shadow-[0_8px_24px_rgba(37,39,32,0.1)] flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-[#EAF0E8] text-[#174B39] flex items-center justify-center shrink-0">
                  <FiUsers className="text-xl text-[#174B39]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#252720]">Skilled Professionals</p>
                  <p className="text-[11px] text-[#66665D]">Functional & Technical Leads</p>
                </div>
              </motion.div>

              {/* Floating Restrained Card 3: ERP Transformation */}
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="hidden sm:flex absolute top-1/2 -right-4 -translate-y-1/2 bg-white/95 backdrop-blur-md border border-[#E7E0D3] rounded-2xl p-3 sm:p-3.5 shadow-[0_8px_24px_rgba(37,39,32,0.1)] items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-[#FDFBF7] border border-[#B88A3B]/30 text-[#B88A3B] flex items-center justify-center shrink-0">
                  <FiDatabase className="text-xl text-[#B88A3B]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#252720]">ERP Transformation</p>
                  <p className="text-[11px] text-[#66665D]">Custom Software Systems</p>
                </div>
              </motion.div>

            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
};

export default Hero;
