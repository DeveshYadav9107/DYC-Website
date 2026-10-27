import { useParams, Link, Navigate } from 'react-router-dom';
import Reveal from '../../components/animations/Reveal';
import { StaggerContainer, StaggerItem } from '../../components/animations/Stagger';
import { FiCheck } from 'react-icons/fi';

const servicesData = {
  'staffing': {
    title: 'Manpower Supply & Staffing',
    subtitle: 'Scale your workforce efficiently with our tailored manpower supply and recruitment solutions.',
    features: [
      { title: 'Contract Staffing', desc: 'Flexible IT and non-IT professionals for short-term and project-based requirements.' },
      { title: 'Permanent Recruitment', desc: 'End-to-end talent sourcing for full-time executive and technical roles.' },
      { title: 'Remote IT Staffing', desc: 'Virtual developers and engineers ready to integrate with your global teams.' },
      { title: 'Bulk Hiring', desc: 'Rapid deployment of large teams for immediate operational scale-up.' }
    ],
    inquiryType: 'staffing-request',
    image: '/images/service-staffing.jpg'
  },
  'sap-resources': {
    title: 'SAP Resources',
    subtitle: 'Top-tier functional and technical SAP consultants for your implementation, upgrade, or maintenance projects.',
    features: [
      { title: 'Functional Consultants', desc: 'Experts in FICO, MM, SD, HR, PP, and PM to optimize your business processes.' },
      { title: 'Technical Experts', desc: 'ABAP developers, Fiori/UI5 designers, and Basis administrators for robust system health.' },
      { title: 'Project Managers', desc: 'Certified SAP project managers to ensure on-time and on-budget delivery.' },
      { title: 'S/4HANA Specialists', desc: 'Consultants experienced in greenfield and brownfield S/4HANA migrations.' }
    ],
    inquiryType: 'sap-resource-request',
    image: '/images/service-sap-resources.jpg'
  },
  'sap-support': {
    title: 'SAP Support & Maintenance',
    subtitle: 'Ensure your SAP landscape runs smoothly with our dedicated application management and support services.',
    features: [
      { title: 'Application Management Services (AMS)', desc: 'Dedicated enterprise support desk for L1, L2, and L3 issue resolution.' },
      { title: 'System Upgrades', desc: 'Seamless patch applications, enhancement packs (EhP), and version upgrades.' },
      { title: 'Performance Optimization', desc: 'Continuous monitoring and tuning to ensure maximum system uptime and speed.' },
      { title: 'Custom Enhancements', desc: 'Development of custom Z-reports, workflows, and user exits as your needs evolve.' }
    ],
    inquiryType: 'sap-support',
    image: '/images/service-sap-support.jpg'
  },
  'erp-solutions': {
    title: 'Custom ERP Solutions',
    subtitle: 'Replace fragmented systems with a unified ERP solution tailored exactly to your operational workflows.',
    features: [
      { title: 'Payroll & HR', desc: 'Automated attendance, leave management, and compliant payroll processing.' },
      { title: 'Sales & Distribution', desc: 'Lead tracking, quotation generation, and order fulfillment workflows.' },
      { title: 'Inventory Management', desc: 'Real-time stock visibility, procurement automation, and warehouse tracking.' },
      { title: 'Business Analytics', desc: 'Custom dashboards reporting on your most critical KPIs and metrics.' }
    ],
    inquiryType: 'erp-inquiry',
    image: '/images/service-erp-solutions.jpg'
  }
};

const ServicePage = () => {
  const { serviceId } = useParams();
  const service = servicesData[serviceId];

  // If URL is invalid, redirect to home
  if (!service) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="bg-[#F8F5EE] min-h-screen text-[#252720]">
      {/* Header Banner */}
      <div className="bg-[#F8F5EE] text-[#252720] py-14 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden border-b border-[#E7E0D3]">
        
        {/* Background Banner Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src={service.image} 
            alt={service.title} 
            className="w-full h-full object-cover object-[75%_center] contrast-[1.05] saturate-[1.08]" 
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/images/sap-banner.png';
            }}
          />
          {/* Subtle directional gradient to blend seamlessly into left edge while keeping image vivid */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#F8F5EE]/90 via-[#F8F5EE]/60 to-transparent md:w-3/5 z-0 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#F8F5EE]/40 via-transparent to-transparent z-0 pointer-events-none" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <Reveal>
            <div className="max-w-xl lg:max-w-2xl bg-white/85 backdrop-blur-md border border-white/90 shadow-[0_12px_36px_rgba(23,75,57,0.07)] rounded-3xl p-7 sm:p-10">
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#EAF0E8] border border-[#174B39]/20 text-[#174B39] text-xs font-bold tracking-[0.2em] uppercase mb-5 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-[#B88A3B]"></span>
                <span>Service Capability</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold mb-4 tracking-tight text-[#252720] leading-[1.18]">
                {service.title}
              </h1>
              <p className="text-base sm:text-lg text-[#55564E] font-medium leading-relaxed font-sans mb-6">
                {service.subtitle}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-[#174B39]">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF8F3] border border-[#E7E0D3]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B88A3B]"></span>
                  <span>Enterprise Grade</span>
                </div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF8F3] border border-[#E7E0D3]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#174B39]"></span>
                  <span>Tailored Engagements</span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <Reveal>
          <div className="text-center mb-16">
            <span className="text-[#B88A3B] font-bold uppercase tracking-widest text-xs mb-3 inline-block">
              Engagement Highlights
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#252720] tracking-tight">
              What We Offer
            </h2>
          </div>
        </Reveal>
        
        <StaggerContainer className="grid md:grid-cols-2 gap-6 sm:gap-8">
          {service.features.map((feat, idx) => (
            <StaggerItem 
              key={idx} 
              className="bg-white border border-[#E7E0D3] shadow-[0_4px_16px_rgba(37,39,32,0.03)] rounded-2xl p-7 sm:p-8 flex gap-5 group hover:border-[#174B39]/50 hover:shadow-[0_12px_32px_rgba(23,75,57,0.08)] hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-9 h-9 rounded-full bg-[#EAF0E8] border border-[#174B39]/20 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#174B39] group-hover:text-white transition-colors duration-300">
                <FiCheck className="text-sm text-[#174B39] group-hover:text-white transition-colors" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-xl text-[#252720] mb-2 group-hover:text-[#174B39] transition-colors">{feat.title}</h3>
                <p className="text-[#66665D] leading-relaxed text-sm sm:text-base">{feat.desc}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>

      {/* Dynamic CTA */}
      <div className="bg-[#FDFBF7] border-t border-[#E7E0D3] py-24 sm:py-32 px-4 sm:px-6 lg:px-8 text-center">
        <Reveal>
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-[#252720] mb-5 tracking-tight">
            Ready to Get Started?
          </h2>
          <p className="text-lg md:text-xl text-[#66665D] max-w-2xl mx-auto mb-10 leading-relaxed font-sans">
            Our team is ready to assist you with your {service.title.toLowerCase()} needs. 
            Contact us today for a structured consultation.
          </p>
          <Link 
            to={`/contact?type=${service.inquiryType}`} 
            className="btn-primary inline-block px-8 py-4 text-base sm:text-lg font-semibold"
          >
            Request {service.title}
          </Link>
        </Reveal>
      </div>
    </div>
  );
};

export default ServicePage;
