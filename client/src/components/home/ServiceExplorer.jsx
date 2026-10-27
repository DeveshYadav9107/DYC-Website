import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Reveal from '../animations/Reveal';
import { FiCheck } from 'react-icons/fi';

const ServiceExplorer = () => {
  const [activeTab, setActiveTab] = useState('resources');

  const tabs = [
    { id: 'resources', label: 'SAP Resources' },
    { id: 'support', label: 'SAP Support' },
    { id: 'staffing', label: 'Staffing & Manpower' },
    { id: 'erp', label: 'ERP Software' },
  ];

  const content = {
    resources: {
      title: 'Find the Right SAP Talent',
      desc: 'We provide top-tier functional and technical SAP consultants for your implementation, upgrade, or maintenance projects.',
      list: [
        'Functional Consultants (FICO, MM, SD, HR)',
        'Technical Consultants (ABAP, Basis, Fiori)',
        'Implementation & Rollout Support',
        'Contract and Full-Time Engagement',
      ],
      link: '/services/sap-resources',
      cta: 'Request SAP Resources',
      image: '/images/service-sap-resources.png',
    },
    support: {
      title: 'Reliable SAP Support & Maintenance',
      desc: 'Ensure your SAP landscape runs smoothly with our dedicated application management and support services.',
      list: [
        'Application Management Services (AMS)',
        'SAP Migration & Upgrade Support',
        'Business Process Optimization',
        'Custom Development & Enhancements',
      ],
      link: '/services/sap-support',
      cta: 'Explore SAP Support',
      image: '/images/service-sap-support.jpg',
    },
    staffing: {
      title: 'Comprehensive IT & Non-IT Staffing',
      desc: 'Scale your workforce efficiently with our tailored manpower supply and recruitment solutions.',
      list: [
        'Contract & Permanent Staffing',
        'Project-Based Staffing',
        'Remote / Virtual IT Staffing',
        'End-to-End Recruitment Process',
      ],
      link: '/services/staffing',
      cta: 'Find Talent',
      image: '/images/service-staffing.jpg',
    },
    erp: {
      title: 'Custom ERP Built for Your Business',
      desc: 'Replace fragmented systems with a unified ERP solution tailored exactly to your operational workflows.',
      list: [
        'Payroll & HR Management',
        'Sales & Quote Tracking',
        'Order & Task Trackability',
        'Business Process Automation',
      ],
      link: '/services/erp-solutions',
      cta: 'Explore ERP Solutions',
      image: '/images/service-erp-solutions.png',
    },
  };

  return (
    <section id="service-explorer" className="py-24 sm:py-32 bg-[#FDFBF7] px-4 sm:px-6 lg:px-8 relative border-b border-[#E7E0D3]">
      <div className="max-w-7xl mx-auto relative z-10">
        <Reveal>
          <div className="text-center mb-16 sm:mb-20">
            <div className="text-[#B88A3B] font-bold uppercase tracking-widest text-xs mb-3.5 flex items-center justify-center gap-2.5">
              <span className="w-8 h-px bg-[#B88A3B]"></span>
              Focused Solutions
              <span className="w-8 h-px bg-[#B88A3B]"></span>
            </div>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-[#252720] mb-4 tracking-tight">
              What Do You Need Help With?
            </h2>
            <p className="text-lg md:text-xl text-[#66665D] max-w-2xl mx-auto leading-relaxed">
              Select an area below to explore how we can support your business goals with enterprise-grade solutions.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="bg-white border border-[#E7E0D3] rounded-3xl p-4 sm:p-8 shadow-[0_6px_24px_rgba(37,39,32,0.04)]">
            {/* Tabs */}
            <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3 mb-10">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-5 sm:px-6 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 border cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-[#174B39] text-white border-[#103728] shadow-[0_4px_16px_rgba(23,75,57,0.25)]'
                      : 'bg-[#FDFBF7] text-[#66665D] hover:text-[#174B39] hover:bg-[#EAF0E8]/60 border-[#E7E0D3]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="bg-[#F8F5EE] rounded-2xl overflow-hidden border border-[#E7E0D3] relative min-h-[460px]">
              <AnimatePresence mode="wait">
                <motion.div 
                  key={activeTab} 
                  className="grid md:grid-cols-2 h-full"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="p-8 sm:p-10 md:p-12 flex flex-col justify-center">
                    <span className="text-xs font-bold text-[#B88A3B] uppercase tracking-wider mb-2 block">
                      Capabilities & Engagement
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#252720] mb-4 tracking-tight">
                      {content[activeTab].title}
                    </h3>
                    <p className="text-base sm:text-lg text-[#66665D] mb-8 leading-relaxed">
                      {content[activeTab].desc}
                    </p>
                    
                    <ul className="space-y-3.5 mb-10">
                      {content[activeTab].list.map((item, idx) => (
                        <motion.li 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.15 + (idx * 0.08) }}
                          key={idx} 
                          className="flex items-center gap-3"
                        >
                          <div className="w-5 h-5 rounded-full bg-[#EAF0E8] border border-[#174B39]/20 flex items-center justify-center shrink-0">
                            <FiCheck className="text-xs text-[#174B39]" />
                          </div>
                          <span className="text-[#252720] font-medium text-sm sm:text-base">{item}</span>
                        </motion.li>
                      ))}
                    </ul>

                    <div>
                      <Link
                        to={content[activeTab].link}
                        className="btn-primary inline-block px-8 py-3.5 text-sm sm:text-base font-semibold"
                      >
                        {content[activeTab].cta}
                      </Link>
                    </div>
                  </div>
                  
                  <div className="relative min-h-[320px] hidden md:block overflow-hidden">
                    <motion.img
                      initial={{ scale: 1.05 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      src={content[activeTab].image}
                      alt={content[activeTab].title}
                      className="w-full h-full object-cover absolute inset-0"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/images/sap-banner.png';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#F8F5EE] via-transparent to-transparent z-10 w-1/4"></div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default ServiceExplorer;
