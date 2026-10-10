import { Link } from 'react-router-dom';
import Reveal from '../../components/animations/Reveal';
import { StaggerContainer, StaggerItem } from '../../components/animations/Stagger';

const SAPCapabilitiesPage = () => {
  const categories = [
    {
      title: 'Functional Modules',
      desc: 'Optimize your core business processes with expert configuration.',
      paragraph: 'Our functional consultants possess deep industry knowledge and understand that technology is merely an enabler for business goals. We specialize in mapping complex business workflows into standard SAP processes, minimizing custom developments while maximizing efficiency. From streamlining financial closes to optimizing supply chains, our experts ensure your SAP environment perfectly aligns with your operational realities.',
      modules: [
        { name: 'SAP FICO', full: 'Financial Accounting & Controlling' },
        { name: 'SAP MM', full: 'Materials Management' },
        { name: 'SAP SD', full: 'Sales and Distribution' },
        { name: 'SAP HR/HCM', full: 'Human Capital Management' },
        { name: 'SAP PP', full: 'Production Planning' },
        { name: 'SAP PM', full: 'Plant Maintenance' },
      ]
    },
    {
      title: 'Technical Modules',
      desc: 'Robust development, integration, and system administration.',
      paragraph: 'Behind every successful SAP landscape is a rock-solid technical foundation. Our technical architects and developers build scalable, secure, and highly performant solutions. Whether you need custom ABAP developments, seamless integrations via PI/PO, or 24/7 Basis support to maintain system health, our technical teams deliver excellence. We also prioritize intuitive user experiences by designing modern Fiori applications that drive user adoption.',
      modules: [
        { name: 'SAP ABAP', full: 'Advanced Business Application Programming' },
        { name: 'SAP Basis', full: 'System Administration' },
        { name: 'SAP Fiori / UI5', full: 'User Experience & Interfaces' },
        { name: 'SAP PI/PO', full: 'Process Integration / Orchestration' },
      ]
    },
    {
      title: 'Cloud & Environments',
      desc: 'Modernize your landscape with the latest SAP innovations.',
      paragraph: 'The future of enterprise technology lives in the cloud. We guide organizations through the complexities of digital transformation, mitigating risks during critical transitions like S/4HANA migrations. Our cloud specialists help you harness the full power of SAP\'s modern suite, integrating core ERP capabilities with specialized cloud solutions like SuccessFactors and Ariba to create a unified, intelligent enterprise architecture.',
      modules: [
        { name: 'SAP S/4HANA', full: 'Next-generation ERP' },
        { name: 'SAP SuccessFactors', full: 'Cloud HR' },
        { name: 'SAP Ariba', full: 'Procurement & Supply Chain' },
      ]
    }
  ];

  return (
    <div className="bg-bg-primary min-h-screen text-text-primary">
      {/* Header */}
      <div className="bg-bg-tertiary text-text-primary py-24 px-6 relative overflow-hidden border-b border-border-light">
        
        {/* Background Image & Overlays */}
        <div className="absolute inset-0 z-0 opacity-100">
          <img src="/images/sap-banner.png" alt="SAP Capabilities Banner" className="w-full h-full object-cover object-right" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-bg-tertiary/80 via-bg-tertiary/30 to-transparent z-0"></div>

        <div className="max-w-7xl mx-auto relative z-10 pt-10">
          <Reveal>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">SAP <span className="text-primary">Capabilities</span></h1>
            <p className="text-xl text-text-secondary max-w-3xl leading-relaxed">
              We provide comprehensive SAP expertise across the entire enterprise landscape. From legacy ECC systems to modern S/4HANA transformations, our certified consultants deliver end-to-end solutions.
            </p>
          </Reveal>
        </div>
      </div>

      {/* Modules List */}
      <div className="max-w-7xl mx-auto px-6 py-24 space-y-24">
        {categories.map((category, idx) => (
          <div key={idx} className="grid md:grid-cols-12 gap-12 items-start border-t border-border-light pt-16 first:border-0 first:pt-0">
            <Reveal className="md:col-span-5">
              <div className="sticky top-32">
                <div className="text-primary font-bold uppercase tracking-wider text-xs mb-3 flex items-center gap-2">
                  <span className="w-8 h-px bg-primary"></span>
                  Domain {idx + 1}
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4 tracking-tight">{category.title}</h2>
                <p className="text-xl text-text-secondary font-medium mb-6">{category.desc}</p>
                <p className="text-text-secondary leading-relaxed mb-8">
                  {category.paragraph}
                </p>
              </div>
            </Reveal>
            
            <div className="md:col-span-7">
              <StaggerContainer className="grid sm:grid-cols-2 gap-4">
                {category.modules.map((mod, i) => (
                  <StaggerItem key={i} className="bg-surface border border-border rounded-xl p-6 hover:border-primary/50 transition-colors shadow-sm group">
                    <h3 className="font-bold text-xl text-[#102A43] mb-2 group-hover:text-primary transition-colors">{mod.name}</h3>
                    <p className="text-text-secondary text-sm leading-relaxed">{mod.full}</p>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="bg-bg-tertiary border-t border-border-light py-32 px-6 text-center">
        <Reveal>
          <h2 className="text-3xl md:text-5xl font-bold text-text-primary mb-6 tracking-tight">Need a specific SAP expert?</h2>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
            Whether you need a single ABAP developer or a full functional team for an S/4HANA rollout, we can deploy the right talent quickly.
          </p>
          <Link to="/contact" className="btn-primary inline-block px-8 py-4 text-lg">
            Request SAP Resources
          </Link>
        </Reveal>
      </div>
    </div>
  );
};

export default SAPCapabilitiesPage;
