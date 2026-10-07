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
    icon: '👥'
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
    icon: '⚙️'
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
    icon: '🛠️'
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
    icon: '💻'
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
      <div className="bg-bg-secondary text-white py-24 px-6 relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,var(--color-primary),transparent_70%)]"></div>
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-center gap-10 pt-10">
          <Reveal>
            <div className="w-24 h-24 bg-surface rounded-2xl flex items-center justify-center text-5xl border border-border shadow-surface grayscale">
              {service.icon}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div>
              <div className="text-primary font-bold uppercase tracking-wider text-xs mb-3 flex items-center gap-2">
                <span className="w-8 h-px bg-primary"></span>
                Service Detail
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">{service.title}</h1>
              <p className="text-xl text-text-secondary max-w-3xl leading-relaxed">
                {service.subtitle}
              </p>
            </div>
          </Reveal>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-6 py-32">
        <Reveal>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-16 text-center tracking-tight">What We Offer</h2>
        </Reveal>
        
        <StaggerContainer className="grid md:grid-cols-2 gap-8">
          {service.features.map((feat, idx) => (
            <StaggerItem key={idx} className="glass-panel p-8 flex gap-6 group hover:border-primary/50 transition-colors">
              <div className="text-primary text-2xl mt-1 group-hover:scale-125 transition-transform">✓</div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary-bright transition-colors">{feat.title}</h3>
                <p className="text-text-secondary leading-relaxed">{feat.desc}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>

      {/* Dynamic CTA */}
      <div className="bg-bg-secondary border-t border-border/50 py-32 px-6 text-center">
        <Reveal>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">Ready to get started?</h2>
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
