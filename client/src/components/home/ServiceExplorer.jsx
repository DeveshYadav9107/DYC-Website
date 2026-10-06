import { useState } from 'react';
import { Link } from 'react-router-dom';

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
    <section id="services" className="py-24 bg-white px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-900 mb-4">What do you need help with?</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select an area below to explore how we can support your business goals.
          </p>
        </div>

        <div className="bg-gray-50 rounded-2xl p-4 md:p-8 border border-gray-100 shadow-sm">
          {/* Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm min-h-[400px]">
            <div key={activeTab} className="grid md:grid-cols-2 h-full animate-fadeIn">
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <h3 className="text-3xl font-bold text-primary-900 mb-4">{content[activeTab].title}</h3>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  {content[activeTab].desc}
                </p>
                
                <ul className="space-y-4 mb-10">
                  {content[activeTab].list.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="text-accent-500 mt-1">✓</span>
                      <span className="text-gray-700 font-medium">{item}</span>
                    </li>
                  ))}
                </ul>

                <div>
                  <Link
                    to={content[activeTab].link}
                    className="inline-block bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded shadow font-semibold transition-colors"
                  >
                    {content[activeTab].cta}
                  </Link>
                </div>
              </div>
              
              <div className="relative min-h-[300px] hidden md:block">
                <div className="absolute inset-0 bg-primary-900/10 z-10"></div>
                <img
                  src={content[activeTab].image}
                  alt={content[activeTab].title}
                  className="w-full h-full object-cover absolute inset-0"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-white via-white/20 to-transparent z-20"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServiceExplorer;
