import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Reveal from '../animations/Reveal';

const ServiceExplorer = () => {
  const [activeTab, setActiveTab] = useState('resources');

  const tabs = [
    { id: 'resources', label: 'SAP Resources' },
    { id: 'support', label: 'SAP Support' },
    { id: 'staffing', label: 'Staffing' },
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
      image: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
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
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
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
      image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
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
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    },
  };

  return (
    <section id="services" className="py-32 bg-bg-primary px-6 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--color-bg-tertiary),transparent_50%)] opacity-70"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <Reveal>
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-6 tracking-tight">What do you need help with?</h2>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
              Select an area below to explore how we can support your business goals with enterprise-grade solutions.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="bg-surface border border-border rounded-2xl p-4 md:p-8 shadow-surface">
            {/* Tabs */}
            <div className="flex flex-wrap justify-center gap-3 mb-10">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 border ${
                    activeTab === tab.id
                      ? 'bg-primary text-white border-primary shadow-surface-hover'
                      : 'bg-surface text-text-secondary hover:text-primary hover:bg-bg-secondary border-border'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="bg-bg-secondary rounded-2xl overflow-hidden border border-border-light relative min-h-[450px]">
              <AnimatePresence mode="wait">
                <motion.div 
                  key={activeTab} 
                  className="grid md:grid-cols-2 h-full"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="p-8 md:p-12 flex flex-col justify-center">
                    <h3 className="text-3xl font-bold text-text-primary mb-4 tracking-tight">{content[activeTab].title}</h3>
                    <p className="text-lg text-text-secondary mb-8 leading-relaxed">
                      {content[activeTab].desc}
                    </p>
                    
                    <ul className="space-y-4 mb-10">
                      {content[activeTab].list.map((item, idx) => (
                        <motion.li 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 + (idx * 0.1) }}
                          key={idx} 
                          className="flex items-start gap-3"
                        >
                          <span className="text-primary mt-1">✓</span>
                          <span className="text-text-primary font-medium">{item}</span>
                        </motion.li>
                      ))}
                    </ul>

                    <div>
                      <Link
                        to={content[activeTab].link}
                        className="btn-primary inline-block px-8 py-3"
                      >
                        {content[activeTab].cta}
                      </Link>
                    </div>
                  </div>
                  
                  <div className="relative min-h-[300px] hidden md:block overflow-hidden rounded-r-2xl">
                    <motion.img
                      initial={{ scale: 1.05 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      whileHover={{ scale: 1.03 }}
                      src={content[activeTab].image}
                      alt={content[activeTab].title}
                      className="w-full h-full object-cover absolute inset-0"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-bg-secondary/40 to-transparent z-20"></div>
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
