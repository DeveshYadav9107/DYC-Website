import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  FiUsers,
  FiCpu,
  FiLayers,
  FiDatabase,
  FiArrowRight,
  FiCheckCircle,
  FiActivity,
  FiFileText,
  FiClock,
  FiShield,
  FiTrendingUp,
  FiServer,
  FiBox,
  FiPieChart,
} from 'react-icons/fi';

const servicesData = [
  {
    id: 'staffing',
    number: '01',
    eyebrow: 'PEOPLE & TALENT',
    title: 'Manpower Supply & Staffing',
    headline: 'Find the right people for the work ahead.',
    description:
      'Build a workforce aligned with your operational needs through staffing support for contract, permanent, and project-based requirements.',
    supportingPoints: [
      'Contract and permanent staffing',
      'Skilled and semi-skilled workforce requirements',
      'Role-based resource sourcing',
      'Workforce requirements and deployment coordination',
    ],
    serviceLink: '/services/staffing',
    inquiryLink: '/contact?type=staffing-request',
    inquiryLabel: 'Discuss Staffing Scope',
    icon: FiUsers,
    colSpan: 'lg:col-span-7',
    enterDirection: 'left',
  },
  {
    id: 'sap-resources',
    number: '02',
    eyebrow: 'SAP EXPERTISE',
    title: 'SAP Resources',
    headline: 'The right expertise for your SAP landscape.',
    description:
      'Connect your project with relevant functional and technical expertise aligned with your SAP environment, roles, and delivery requirements.',
    supportingPoints: [
      'Functional SAP resources',
      'Technical SAP resources',
      'Module-specific requirements',
      'ECC or S/4HANA project context, where applicable',
    ],
    serviceLink: '/services/sap-resources',
    inquiryLink: '/contact?type=sap-resource-request',
    inquiryLabel: 'Request SAP Talent',
    icon: FiCpu,
    colSpan: 'lg:col-span-5',
    enterDirection: 'right',
  },
  {
    id: 'sap-support',
    number: '03',
    eyebrow: 'SUPPORT & CONTINUITY',
    title: 'SAP Support',
    headline: 'Keep critical business systems moving forward.',
    description:
      'Support ongoing SAP operations through maintenance, issue resolution, enhancements, and optimization aligned with your support requirements.',
    supportingPoints: [
      'Application support and maintenance',
      'Troubleshooting and issue resolution',
      'Enhancements and optimization',
      'Support aligned with business priorities',
    ],
    serviceLink: '/services/sap-support',
    inquiryLink: '/contact?type=sap-support',
    inquiryLabel: 'Arrange Support Review',
    icon: FiLayers,
    colSpan: 'lg:col-span-5',
    enterDirection: 'left',
  },
  {
    id: 'erp-solutions',
    number: '04',
    eyebrow: 'BUSINESS SYSTEMS',
    title: 'ERP Solutions',
    headline: 'Shape systems around how your business works.',
    description:
      'Explore enterprise software and ERP capabilities that help organize business workflows, connect operational information, and address defined process requirements.',
    supportingPoints: [
      'Custom enterprise software systems',
      'Business workflow support',
      'Data and process integration',
      'Functional requirements translated into software capabilities',
    ],
    serviceLink: '/services/erp-solutions',
    inquiryLink: '/contact?type=erp-inquiry',
    inquiryLabel: 'Explore Custom Scope',
    icon: FiDatabase,
    colSpan: 'lg:col-span-7',
    enterDirection: 'right',
  },
];

/* =========================================================================
   CUSTOM VISUAL 01: Refined People-and-Talent Composition
   ========================================================================= */
const TalentNetworkVisual = () => (
  <div className="relative w-full rounded-2xl bg-[#FAF8F3] border border-[#E7E0D3] p-5 sm:p-6 overflow-hidden">
    {/* Decorative constellation arcs */}
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
      viewBox="0 0 400 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M 60 70 Q 180 30 320 80"
        stroke="#B88A3B"
        strokeWidth="1.2"
        strokeDasharray="4 4"
      />
      <path
        d="M 60 70 Q 150 160 310 170"
        stroke="#174B39"
        strokeWidth="1.2"
        strokeDasharray="4 4"
      />
      <path
        d="M 180 120 L 320 80"
        stroke="#B88A3B"
        strokeWidth="1"
        strokeDasharray="3 3"
      />
      <circle cx="60" cy="70" r="3.5" fill="#174B39" />
      <circle cx="180" cy="120" r="3.5" fill="#B88A3B" />
      <circle cx="320" cy="80" r="3.5" fill="#174B39" />
      <circle cx="310" cy="170" r="3" fill="#B88A3B" />
    </svg>

    {/* Header Status Bar */}
    <div className="relative z-10 flex items-center justify-between border-b border-[#E7E0D3]/80 pb-3 mb-4">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#174B39] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#174B39]"></span>
        </span>
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#174B39]">
          Active Workforce Sourcing
        </span>
      </div>
      <span className="text-[10px] font-semibold text-[#8A897C] bg-white px-2.5 py-0.5 rounded-full border border-[#E7E0D3]">
        Multi-Discipline
      </span>
    </div>

    {/* Talent Streams Matrix */}
    <div className="relative z-10 grid grid-cols-2 gap-2.5">
      <div className="bg-white/95 rounded-xl p-3 border border-[#E7E0D3] shadow-2xs">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-5 h-5 rounded-md bg-[#EAF0E8] text-[#174B39] flex items-center justify-center text-xs">
            <FiCpu className="text-[11px]" />
          </div>
          <span className="text-xs font-bold text-[#252720]">IT Specialists</span>
        </div>
        <p className="text-[11px] text-[#66665D] leading-tight">
          Developers, Architects & Cloud Tech
        </p>
      </div>

      <div className="bg-white/95 rounded-xl p-3 border border-[#E7E0D3] shadow-2xs">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-5 h-5 rounded-md bg-[#FFF9ED] text-[#B88A3B] flex items-center justify-center text-xs">
            <FiUsers className="text-[11px]" />
          </div>
          <span className="text-xs font-bold text-[#252720]">Functional Leads</span>
        </div>
        <p className="text-[11px] text-[#66665D] leading-tight">
          Project Managers & Business Analysts
        </p>
      </div>

      <div className="bg-white/95 rounded-xl p-3 border border-[#E7E0D3] shadow-2xs">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-5 h-5 rounded-md bg-[#FFF9ED] text-[#B88A3B] flex items-center justify-center text-xs">
            <FiShield className="text-[11px]" />
          </div>
          <span className="text-xs font-bold text-[#252720]">Industrial Technical</span>
        </div>
        <p className="text-[11px] text-[#66665D] leading-tight">
          Engineers, Supervisors & Operations
        </p>
      </div>

      <div className="bg-white/95 rounded-xl p-3 border border-[#E7E0D3] shadow-2xs">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-5 h-5 rounded-md bg-[#EAF0E8] text-[#174B39] flex items-center justify-center text-xs">
            <FiClock className="text-[11px]" />
          </div>
          <span className="text-xs font-bold text-[#252720]">Deployment Options</span>
        </div>
        <p className="text-[11px] text-[#66665D] leading-tight">
          Contract, Permanent & Project Teams
        </p>
      </div>
    </div>
  </div>
);

/* =========================================================================
   CUSTOM VISUAL 02: SAP-Inspired Architecture & Systems Diagram
   ========================================================================= */
const SAPArchitectureVisual = () => (
  <div className="relative w-full rounded-2xl bg-[#FAF8F3] border border-[#E7E0D3] p-5 overflow-hidden">
    {/* Subtle architectural grid */}
    <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(#174B39_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

    {/* Central SAP Architecture Hub */}
    <div className="relative z-10 flex flex-col items-center text-center">
      {/* Official SAP Blue Badge with Gold Glow */}
      <div className="relative mb-3">
        <div className="absolute -inset-1.5 rounded-xl bg-gradient-to-r from-[#0070F2]/20 via-[#B88A3B]/20 to-[#003882]/20 blur-sm pointer-events-none" />
        <div className="relative px-4 py-2 rounded-lg bg-gradient-to-br from-[#0070F2] to-[#003882] shadow-sm flex items-center justify-center">
          <span className="text-white font-extrabold tracking-widest text-sm font-sans">
            SAP
          </span>
          <span className="text-[9px] text-white/90 ml-1 font-semibold">® Landscape</span>
        </div>
      </div>

      {/* Connected Architecture Modules */}
      <div className="w-full grid grid-cols-3 gap-2 mt-2">
        <div className="bg-white rounded-lg p-2.5 border border-[#E7E0D3] text-center shadow-2xs">
          <span className="text-[10px] font-bold text-[#0070F2] uppercase block">
            Functional
          </span>
          <span className="text-xs font-semibold text-[#252720] block mt-0.5">
            FICO · MM · SD
          </span>
        </div>

        <div className="bg-white rounded-lg p-2.5 border border-[#E7E0D3] text-center shadow-2xs">
          <span className="text-[10px] font-bold text-[#174B39] uppercase block">
            Technical
          </span>
          <span className="text-xs font-semibold text-[#252720] block mt-0.5">
            ABAP · Basis · UI5
          </span>
        </div>

        <div className="bg-white rounded-lg p-2.5 border border-[#E7E0D3] text-center shadow-2xs">
          <span className="text-[10px] font-bold text-[#B88A3B] uppercase block">
            Evolution
          </span>
          <span className="text-xs font-semibold text-[#252720] block mt-0.5">
            S/4HANA & Cloud
          </span>
        </div>
      </div>

      {/* Integration line */}
      <div className="w-full flex items-center justify-between text-[11px] text-[#66665D] mt-3.5 pt-3 border-t border-[#E7E0D3]/80">
        <span className="flex items-center gap-1.5 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-[#174B39]"></span>
          Verified Domain Matching
        </span>
        <span className="text-[10px] font-semibold text-[#174B39] bg-[#EAF0E8] px-2 py-0.5 rounded-md">
          Role-Ready
        </span>
      </div>
    </div>
  </div>
);

/* =========================================================================
   CUSTOM VISUAL 03: System Continuity & Operational Diagnostics
   ========================================================================= */
const SystemContinuityVisual = () => (
  <div className="relative w-full rounded-2xl bg-[#FAF8F3] border border-[#E7E0D3] p-5 overflow-hidden">
    <div className="flex items-center justify-between border-b border-[#E7E0D3]/80 pb-3 mb-3.5">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-md bg-[#EAF0E8] text-[#174B39] flex items-center justify-center text-xs">
          <FiActivity className="text-[11px]" />
        </div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#174B39]">
          Ongoing Operations & AMS
        </span>
      </div>
      <span className="text-[10px] font-semibold text-[#174B39] bg-white px-2 py-0.5 rounded-full border border-[#E7E0D3]">
        Operational Health
      </span>
    </div>

    {/* 3-Stage Support Workflow */}
    <div className="space-y-2">
      <div className="bg-white rounded-lg p-2.5 border border-[#E7E0D3] flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#174B39]" />
          <span className="font-semibold text-[#252720]">Incident & Troubleshooting</span>
        </div>
        <span className="text-[10px] text-[#66665D] font-mono">L1 / L2 / L3</span>
      </div>

      <div className="bg-white rounded-lg p-2.5 border border-[#E7E0D3] flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#B88A3B]" />
          <span className="font-semibold text-[#252720]">Enhancements & System Tuning</span>
        </div>
        <span className="text-[10px] text-[#66665D]">Ongoing Tuning</span>
      </div>

      <div className="bg-white rounded-lg p-2.5 border border-[#E7E0D3] flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#174B39]" />
          <span className="font-semibold text-[#252720]">Maintenance Aligned to Scope</span>
        </div>
        <span className="text-[10px] text-[#174B39] font-medium bg-[#EAF0E8] px-1.5 py-0.5 rounded">
          Defined Priority
        </span>
      </div>
    </div>
  </div>
);

/* =========================================================================
   CUSTOM VISUAL 04: Interconnected Enterprise Workflow (ERP Solutions)
   ========================================================================= */
const ERPWorkflowVisual = () => (
  <div className="relative w-full rounded-2xl bg-[#FAF8F3] border border-[#E7E0D3] p-5 sm:p-6 overflow-hidden">
    <div className="flex items-center justify-between border-b border-[#E7E0D3]/80 pb-3 mb-4">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-md bg-[#FFF9ED] text-[#B88A3B] flex items-center justify-center text-xs">
          <FiServer className="text-[11px]" />
        </div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#174B39]">
          Integrated Business System Architecture
        </span>
      </div>
      <span className="text-[10px] font-semibold text-[#66665D] bg-white px-2.5 py-0.5 rounded-full border border-[#E7E0D3]">
        Unified Workflow
      </span>
    </div>

    {/* 4 Connected Workflows */}
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 relative">
      <div className="bg-white rounded-xl p-3 border border-[#E7E0D3] shadow-2xs">
        <div className="w-6 h-6 rounded-md bg-[#EAF0E8] text-[#174B39] flex items-center justify-center text-xs mb-2">
          <FiFileText />
        </div>
        <span className="text-xs font-bold text-[#252720] block">Payroll & HR</span>
        <span className="text-[10px] text-[#66665D] block mt-0.5 leading-tight">
          Attendance & compliant runs
        </span>
      </div>

      <div className="bg-white rounded-xl p-3 border border-[#E7E0D3] shadow-2xs">
        <div className="w-6 h-6 rounded-md bg-[#FFF9ED] text-[#B88A3B] flex items-center justify-center text-xs mb-2">
          <FiBox />
        </div>
        <span className="text-xs font-bold text-[#252720] block">Supply & Stock</span>
        <span className="text-[10px] text-[#66665D] block mt-0.5 leading-tight">
          Visibility & material flows
        </span>
      </div>

      <div className="bg-white rounded-xl p-3 border border-[#E7E0D3] shadow-2xs">
        <div className="w-6 h-6 rounded-md bg-[#EAF0E8] text-[#174B39] flex items-center justify-center text-xs mb-2">
          <FiTrendingUp />
        </div>
        <span className="text-xs font-bold text-[#252720] block">Sales & Quotes</span>
        <span className="text-[10px] text-[#66665D] block mt-0.5 leading-tight">
          Order trackability & status
        </span>
      </div>

      <div className="bg-white rounded-xl p-3 border border-[#E7E0D3] shadow-2xs">
        <div className="w-6 h-6 rounded-md bg-[#FFF9ED] text-[#B88A3B] flex items-center justify-center text-xs mb-2">
          <FiPieChart />
        </div>
        <span className="text-xs font-bold text-[#252720] block">Process Intel</span>
        <span className="text-[10px] text-[#66665D] block mt-0.5 leading-tight">
          Operational reporting views
        </span>
      </div>
    </div>
  </div>
);

const CoreBusinessAreas = () => {
  const isReducedMotion = useReducedMotion();

  // Entrance variants
  const fadeUp = {
    hidden: { opacity: 0, y: isReducedMotion ? 0 : 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] },
    },
  };

  const fromLeft = {
    hidden: {
      opacity: 0,
      x: isReducedMotion ? 0 : -35,
      y: isReducedMotion ? 0 : 25,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { duration: 0.75, ease: [0.21, 0.47, 0.32, 0.98] },
    },
  };

  const fromRight = {
    hidden: {
      opacity: 0,
      x: isReducedMotion ? 0 : 35,
      y: isReducedMotion ? 0 : 25,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { duration: 0.75, ease: [0.21, 0.47, 0.32, 0.98] },
    },
  };

  return (
    <section
      id="services"
      className="py-24 sm:py-32 bg-[#F8F5EE] px-4 sm:px-6 lg:px-8 border-b border-[#E7E0D3] relative overflow-hidden"
    >
      {/* Subtle background ambient illumination */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle_at_center,rgba(23,75,57,0.04),transparent_70%)] blur-3xl" />
        <div className="absolute bottom-10 left-10 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle_at_center,rgba(184,138,59,0.04),transparent_70%)] blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* =========================================================================
            SECTION INTRODUCTION (Editorial Hierarchy & Approved Copy)
            ========================================================================= */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 sm:mb-20 gap-8">
          <div className="max-w-3xl">
            {/* Eyebrow with horizontal line extension */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              variants={fadeUp}
              className="flex items-center gap-3 mb-4"
            >
              <motion.span
                initial={{ width: 0 }}
                whileInView={{ width: 36 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="h-px bg-[#B88A3B]"
              />
              <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#B88A3B]">
                HOW WE HELP
              </span>
            </motion.div>

            {/* Main Editorial Heading */}
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              variants={fadeUp}
              className="text-3xl sm:text-4xl lg:text-[52px] font-serif font-bold text-[#252720] tracking-tight leading-[1.14] mb-5"
            >
              Different challenges.{' '}
              <span className="text-[#174B39] italic font-serif">Connected expertise.</span>
            </motion.h2>

            {/* Introduction Copy */}
            <motion.p
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: 0.15 }}
              variants={fadeUp}
              className="text-base sm:text-lg lg:text-xl text-[#66665D] leading-relaxed font-sans max-w-2xl"
            >
              From the right people to the right systems, explore solutions shaped around your
              business requirements.
            </motion.p>
          </div>

          {/* Secondary Header CTA to Working Destination */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            transition={{ delay: 0.25 }}
            variants={fadeUp}
            className="flex flex-wrap items-center gap-4 shrink-0"
          >
            <Link
              to="/contact"
              className="btn-primary px-6 py-3 text-sm sm:text-base font-semibold shadow-[0_4px_16px_rgba(23,75,57,0.2)] hover:shadow-[0_8px_24px_rgba(23,75,57,0.3)] inline-flex items-center gap-2 group"
            >
              <span>Discuss Your Requirements</span>
              <FiArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>

        {/* =========================================================================
            ASYMMETRIC EDITORIAL BENTO GRID (4 Primary Services)
            ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-7 items-stretch">
          {/* =====================================================================
              CARD 01: Manpower Supply & Staffing (Featured 7-Column Bento)
              ===================================================================== */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={fromLeft}
            whileHover={
              isReducedMotion
                ? {}
                : {
                    y: -6,
                    transition: { duration: 0.35, ease: 'easeOut' },
                  }
            }
            className="lg:col-span-7 bg-white rounded-3xl border border-[#E7E0D3] hover:border-[#174B39]/40 p-7 sm:p-9 flex flex-col justify-between shadow-[0_6px_24px_rgba(37,39,32,0.04)] hover:shadow-[0_16px_40px_rgba(23,75,57,0.1)] transition-all duration-500 relative group overflow-hidden"
          >
            {/* Top gold accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#B88A3B]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Header: Service Number, Eyebrow & Icon */}
            <div>
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#E7E0D3]/70">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-[#FAF8F3] border border-[#E7E0D3] text-[#174B39] font-serif font-bold text-xs flex items-center justify-center">
                    01
                  </span>
                  <span className="text-[11px] font-bold text-[#B88A3B] uppercase tracking-[0.2em]">
                    PEOPLE & TALENT
                  </span>
                </div>
                <div className="w-9 h-9 rounded-xl bg-[#EAF0E8] border border-[#174B39]/20 text-[#174B39] flex items-center justify-center text-sm shadow-2xs group-hover:scale-105 transition-transform duration-300">
                  <FiUsers />
                </div>
              </div>

              {/* Title, Headline & Description */}
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#252720] mb-2 tracking-tight">
                Manpower Supply & Staffing
              </h3>
              <h4 className="text-base sm:text-lg font-serif italic text-[#174B39] mb-3">
                Find the right people for the work ahead.
              </h4>
              <p className="text-sm sm:text-base text-[#66665D] leading-relaxed mb-6 font-sans">
                Build a workforce aligned with your operational needs through staffing support for
                contract, permanent, and project-based requirements.
              </p>

              {/* Custom Visual: Talent Matrix */}
              <div className="mb-6">
                <TalentNetworkVisual />
              </div>

              {/* Supporting Points */}
              <div className="mb-8 pt-4 border-t border-[#E7E0D3]/60">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A897C] block mb-3">
                  Key Scope Areas
                </span>
                <ul className="grid sm:grid-cols-2 gap-2.5">
                  {[
                    'Contract and permanent staffing',
                    'Skilled and semi-skilled workforce requirements',
                    'Role-based resource sourcing',
                    'Workforce requirements and deployment coordination',
                  ].map((pt, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-[#252720]">
                      <FiCheckCircle className="text-xs text-[#174B39] shrink-0 mt-0.5" />
                      <span className="leading-snug">{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* CTAs */}
            <div className="pt-4 border-t border-[#E7E0D3]/70 flex flex-wrap items-center justify-between gap-3">
              <Link
                to="/services/staffing"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#174B39] hover:text-[#103728] transition-colors group/link"
              >
                <span>Explore Staffing Solutions</span>
                <FiArrowRight className="text-xs text-[#B88A3B] group-hover/link:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/contact?type=staffing-request"
                className="text-xs font-semibold text-[#66665D] hover:text-[#174B39] bg-[#FAF8F3] hover:bg-[#EAF0E8]/60 px-3.5 py-1.5 rounded-full border border-[#E7E0D3] transition-colors"
              >
                Intake Desk →
              </Link>
            </div>
          </motion.div>

          {/* =====================================================================
              CARD 02: SAP Resources (5-Column Architectural Bento)
              ===================================================================== */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={fromRight}
            transition={{ delay: 0.15 }}
            whileHover={
              isReducedMotion
                ? {}
                : {
                    y: -6,
                    transition: { duration: 0.35, ease: 'easeOut' },
                  }
            }
            className="lg:col-span-5 bg-white rounded-3xl border border-[#E7E0D3] hover:border-[#174B39]/40 p-7 sm:p-9 flex flex-col justify-between shadow-[0_6px_24px_rgba(37,39,32,0.04)] hover:shadow-[0_16px_40px_rgba(23,75,57,0.1)] transition-all duration-500 relative group overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#0070F2]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div>
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#E7E0D3]/70">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-[#FAF8F3] border border-[#E7E0D3] text-[#174B39] font-serif font-bold text-xs flex items-center justify-center">
                    02
                  </span>
                  <span className="text-[11px] font-bold text-[#B88A3B] uppercase tracking-[0.2em]">
                    SAP EXPERTISE
                  </span>
                </div>
                <div className="w-9 h-9 rounded-xl bg-[#EAF0E8] border border-[#174B39]/20 text-[#174B39] flex items-center justify-center text-sm shadow-2xs group-hover:scale-105 transition-transform duration-300">
                  <FiCpu />
                </div>
              </div>

              <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#252720] mb-2 tracking-tight">
                SAP Resources
              </h3>
              <h4 className="text-base sm:text-lg font-serif italic text-[#174B39] mb-3">
                The right expertise for your SAP landscape.
              </h4>
              <p className="text-sm sm:text-base text-[#66665D] leading-relaxed mb-6 font-sans">
                Connect your project with relevant functional and technical expertise aligned with
                your SAP environment, roles, and delivery requirements.
              </p>

              {/* Custom Visual: SAP Architecture */}
              <div className="mb-6">
                <SAPArchitectureVisual />
              </div>

              {/* Supporting Points */}
              <div className="mb-8 pt-4 border-t border-[#E7E0D3]/60">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A897C] block mb-3">
                  Focus Deliverables
                </span>
                <ul className="space-y-2">
                  {[
                    'Functional SAP resources',
                    'Technical SAP resources',
                    'Module-specific requirements',
                    'ECC or S/4HANA project context, where applicable',
                  ].map((pt, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-[#252720]">
                      <FiCheckCircle className="text-xs text-[#174B39] shrink-0 mt-0.5" />
                      <span className="leading-snug">{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* CTAs */}
            <div className="pt-4 border-t border-[#E7E0D3]/70 flex flex-wrap items-center justify-between gap-3">
              <Link
                to="/services/sap-resources"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#174B39] hover:text-[#103728] transition-colors group/link"
              >
                <span>Explore SAP Resources</span>
                <FiArrowRight className="text-xs text-[#B88A3B] group-hover/link:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/contact?type=sap-resource-request"
                className="text-xs font-semibold text-[#66665D] hover:text-[#174B39] bg-[#FAF8F3] hover:bg-[#EAF0E8]/60 px-3.5 py-1.5 rounded-full border border-[#E7E0D3] transition-colors"
              >
                Intake Desk →
              </Link>
            </div>
          </motion.div>

          {/* =====================================================================
              CARD 03: SAP Support (5-Column Continuity Bento)
              ===================================================================== */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={fromLeft}
            transition={{ delay: 0.25 }}
            whileHover={
              isReducedMotion
                ? {}
                : {
                    y: -6,
                    transition: { duration: 0.35, ease: 'easeOut' },
                  }
            }
            className="lg:col-span-5 bg-white rounded-3xl border border-[#E7E0D3] hover:border-[#174B39]/40 p-7 sm:p-9 flex flex-col justify-between shadow-[0_6px_24px_rgba(37,39,32,0.04)] hover:shadow-[0_16px_40px_rgba(23,75,57,0.1)] transition-all duration-500 relative group overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#B88A3B]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div>
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#E7E0D3]/70">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-[#FAF8F3] border border-[#E7E0D3] text-[#174B39] font-serif font-bold text-xs flex items-center justify-center">
                    03
                  </span>
                  <span className="text-[11px] font-bold text-[#B88A3B] uppercase tracking-[0.2em]">
                    SUPPORT & CONTINUITY
                  </span>
                </div>
                <div className="w-9 h-9 rounded-xl bg-[#EAF0E8] border border-[#174B39]/20 text-[#174B39] flex items-center justify-center text-sm shadow-2xs group-hover:scale-105 transition-transform duration-300">
                  <FiLayers />
                </div>
              </div>

              <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#252720] mb-2 tracking-tight">
                SAP Support
              </h3>
              <h4 className="text-base sm:text-lg font-serif italic text-[#174B39] mb-3">
                Keep critical business systems moving forward.
              </h4>
              <p className="text-sm sm:text-base text-[#66665D] leading-relaxed mb-6 font-sans">
                Support ongoing SAP operations through maintenance, issue resolution, enhancements,
                and optimization aligned with your support requirements.
              </p>

              {/* Custom Visual: Continuity & Health */}
              <div className="mb-6">
                <SystemContinuityVisual />
              </div>

              {/* Supporting Points */}
              <div className="mb-8 pt-4 border-t border-[#E7E0D3]/60">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A897C] block mb-3">
                  Maintenance Capabilities
                </span>
                <ul className="space-y-2">
                  {[
                    'Application support and maintenance',
                    'Troubleshooting and issue resolution',
                    'Enhancements and optimization',
                    'Support aligned with business priorities',
                  ].map((pt, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-[#252720]">
                      <FiCheckCircle className="text-xs text-[#174B39] shrink-0 mt-0.5" />
                      <span className="leading-snug">{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* CTAs */}
            <div className="pt-4 border-t border-[#E7E0D3]/70 flex flex-wrap items-center justify-between gap-3">
              <Link
                to="/services/sap-support"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#174B39] hover:text-[#103728] transition-colors group/link"
              >
                <span>Explore SAP Support</span>
                <FiArrowRight className="text-xs text-[#B88A3B] group-hover/link:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/contact?type=sap-support"
                className="text-xs font-semibold text-[#66665D] hover:text-[#174B39] bg-[#FAF8F3] hover:bg-[#EAF0E8]/60 px-3.5 py-1.5 rounded-full border border-[#E7E0D3] transition-colors"
              >
                Intake Desk →
              </Link>
            </div>
          </motion.div>

          {/* =====================================================================
              CARD 04: ERP Solutions (Featured 7-Column Bento)
              ===================================================================== */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={fromRight}
            transition={{ delay: 0.35 }}
            whileHover={
              isReducedMotion
                ? {}
                : {
                    y: -6,
                    transition: { duration: 0.35, ease: 'easeOut' },
                  }
            }
            className="lg:col-span-7 bg-white rounded-3xl border border-[#E7E0D3] hover:border-[#174B39]/40 p-7 sm:p-9 flex flex-col justify-between shadow-[0_6px_24px_rgba(37,39,32,0.04)] hover:shadow-[0_16px_40px_rgba(23,75,57,0.1)] transition-all duration-500 relative group overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#174B39]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div>
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#E7E0D3]/70">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-[#FAF8F3] border border-[#E7E0D3] text-[#174B39] font-serif font-bold text-xs flex items-center justify-center">
                    04
                  </span>
                  <span className="text-[11px] font-bold text-[#B88A3B] uppercase tracking-[0.2em]">
                    BUSINESS SYSTEMS
                  </span>
                </div>
                <div className="w-9 h-9 rounded-xl bg-[#EAF0E8] border border-[#174B39]/20 text-[#174B39] flex items-center justify-center text-sm shadow-2xs group-hover:scale-105 transition-transform duration-300">
                  <FiDatabase />
                </div>
              </div>

              <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#252720] mb-2 tracking-tight">
                ERP Solutions
              </h3>
              <h4 className="text-base sm:text-lg font-serif italic text-[#174B39] mb-3">
                Shape systems around how your business works.
              </h4>
              <p className="text-sm sm:text-base text-[#66665D] leading-relaxed mb-6 font-sans">
                Explore enterprise software and ERP capabilities that help organize business
                workflows, connect operational information, and address defined process
                requirements.
              </p>

              {/* Custom Visual: ERP Workflow */}
              <div className="mb-6">
                <ERPWorkflowVisual />
              </div>

              {/* Supporting Points */}
              <div className="mb-8 pt-4 border-t border-[#E7E0D3]/60">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A897C] block mb-3">
                  System Architecture Pillars
                </span>
                <ul className="grid sm:grid-cols-2 gap-2.5">
                  {[
                    'Custom enterprise software systems',
                    'Business workflow support',
                    'Data and process integration',
                    'Functional requirements translated into software capabilities',
                  ].map((pt, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-[#252720]">
                      <FiCheckCircle className="text-xs text-[#174B39] shrink-0 mt-0.5" />
                      <span className="leading-snug">{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* CTAs */}
            <div className="pt-4 border-t border-[#E7E0D3]/70 flex flex-wrap items-center justify-between gap-3">
              <Link
                to="/services/erp-solutions"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#174B39] hover:text-[#103728] transition-colors group/link"
              >
                <span>Explore ERP Solutions</span>
                <FiArrowRight className="text-xs text-[#B88A3B] group-hover/link:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/contact?type=erp-inquiry"
                className="text-xs font-semibold text-[#66665D] hover:text-[#174B39] bg-[#FAF8F3] hover:bg-[#EAF0E8]/60 px-3.5 py-1.5 rounded-full border border-[#E7E0D3] transition-colors"
              >
                Intake Desk →
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CoreBusinessAreas;
