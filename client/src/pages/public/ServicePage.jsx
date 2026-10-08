import { useParams, Link, Navigate } from 'react-router-dom';
import Reveal from '../../components/animations/Reveal';
import { StaggerContainer, StaggerItem } from '../../components/animations/Stagger';

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
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80'
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
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80'
  },
  'sap-support': {
    title: 'SAP Support & Maintenance',
    subtitle: 'Ensure your SAP landscape runs smoothly with our dedicated application management and support services.',
    features: [
      { title: 'Application Management Services (AMS)', desc: '24/7 dedicated support desk for L1, L2, and L3 issue resolution.' },
      { title: 'System Upgrades', desc: 'Seamless patch applications, enhancement packs (EhP), and version upgrades.' },
      { title: 'Performance Optimization', desc: 'Continuous monitoring and tuning to ensure maximum system uptime and speed.' },
      { title: 'Custom Enhancements', desc: 'Development of custom Z-reports, workflows, and user exits as your needs evolve.' }
    ],
    inquiryType: 'sap-support',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80'
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
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80'
  }
};

const ServicePage = () => {
  const { serviceId } = useParams();
  const service = servicesData[serviceId];

  // If URL is invalid, redirect to home or a 404
  if (!service) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="bg-bg-primary min-h-screen text-text-primary">
      {/* Header */}
      <div className="bg-bg-tertiary text-text-primary py-24 px-6 relative overflow-hidden border-b border-border-light">
        
        {/* Background Image & Overlays */}
        <div className="absolute inset-0 z-0 opacity-30">
          <img src={service.image} alt={service.title} className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_top_right,var(--color-primary-light),transparent_70%)] z-0"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-bg-tertiary via-transparent to-transparent z-0"></div>

        <div className="max-w-7xl mx-auto relative z-10 pt-10">
          <Reveal>
            <div className="max-w-3xl">
              <div className="text-primary font-bold uppercase tracking-wider text-xs mb-4 inline-flex items-center gap-2 bg-white/60 px-3 py-1 rounded-full backdrop-blur-sm border border-border">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                Service Detail
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight text-text-primary">{service.title}</h1>
              <p className="text-xl md:text-2xl text-text-secondary leading-relaxed">
                {service.subtitle}
              </p>
            </div>
          </Reveal>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-6 py-32">
        <Reveal>
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-16 text-center tracking-tight">What We Offer</h2>
        </Reveal>
        
        <StaggerContainer className="grid md:grid-cols-2 gap-8">
          {service.features.map((feat, idx) => (
            <StaggerItem key={idx} className="bg-surface border border-border shadow-surface rounded-2xl p-8 flex gap-6 group hover:border-primary/50 hover:shadow-surface-hover hover:-translate-y-1 transition-all">
              <div className="text-primary text-2xl mt-1 group-hover:scale-125 transition-transform">✓</div>
              <div>
                <h3 className="text-xl font-bold text-text-primary mb-2 group-hover:text-primary transition-colors">{feat.title}</h3>
                <p className="text-text-secondary leading-relaxed">{feat.desc}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>

      {/* Dynamic CTA */}
      <div className="bg-bg-tertiary border-t border-border-light py-32 px-6 text-center">
        <Reveal>
          <h2 className="text-3xl md:text-5xl font-bold text-text-primary mb-6 tracking-tight">Ready to get started?</h2>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
            Our team is ready to assist you with your {service.title.toLowerCase()} needs. 
            Contact us today for a free consultation.
          </p>
          <Link 
            to={`/contact?type=${service.inquiryType}`} 
            className="btn-primary inline-block px-8 py-4 text-lg"
          >
            Request {service.title}
          </Link>
        </Reveal>
      </div>
    </div>
  );
};

export default ServicePage;
