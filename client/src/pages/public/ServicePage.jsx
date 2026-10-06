import { useParams, Link, Navigate } from 'react-router-dom';

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
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-primary-900 text-white py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-primary-900 to-primary-900"></div>
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center text-4xl border border-white/20 backdrop-blur-sm">
            {service.icon}
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{service.title}</h1>
            <p className="text-xl text-primary-200 max-w-3xl">
              {service.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-primary-900 mb-10 text-center">What We Offer</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {service.features.map((feat, idx) => (
            <div key={idx} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex gap-6">
              <div className="text-accent-500 text-2xl mt-1">✓</div>
              <div>
                <h3 className="text-xl font-bold text-primary-900 mb-2">{feat.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dynamic CTA */}
      <div className="bg-white border-t border-gray-200 py-20 px-6 text-center">
        <h2 className="text-3xl font-bold text-primary-900 mb-4">Ready to get started?</h2>
        <p className="text-gray-600 max-w-2xl mx-auto mb-8">
          Our team is ready to assist you with your {service.title.toLowerCase()} needs. 
          Contact us today for a free consultation.
        </p>
        <Link 
          to={`/contact?type=${service.inquiryType}`} 
          className="inline-block bg-accent-500 hover:bg-accent-400 text-white font-bold py-3 px-8 rounded shadow transition"
        >
          Request {service.title}
        </Link>
      </div>
    </div>
  );
};

export default ServicePage;
