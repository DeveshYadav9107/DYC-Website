import { Link } from 'react-router-dom';
import Reveal from '../animations/Reveal';
import { StaggerContainer, StaggerItem } from '../animations/Stagger';

const SAPCapabilitiesPreview = () => {
  const capabilities = [
    { name: 'SAP S/4HANA', type: 'Environment', desc: 'Next-gen enterprise resource planning.' },
    { name: 'SAP FICO', type: 'Functional', desc: 'Financial accounting & controlling.' },
    { name: 'SAP MM', type: 'Functional', desc: 'Streamline materials management.' },
    { name: 'SAP SD', type: 'Functional', desc: 'Optimize sales and distribution.' },
    { name: 'SAP ABAP', type: 'Technical', desc: 'Custom enterprise development.' },
    { name: 'SAP Fiori', type: 'Technical', desc: 'Intuitive user experiences.' },
    { name: 'SAP Basis', type: 'Technical', desc: 'Reliable system administration.' },
    { name: 'SAP SuccessFactors', type: 'Cloud', desc: 'Modern human capital management.' },
  ];

  return (
    <section className="py-32 bg-bg-light-blue border-t border-border-light px-6 relative">
      <div className="max-w-7xl mx-auto relative z-10">
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="max-w-2xl">
              <div className="text-primary font-bold uppercase tracking-wider text-xs mb-3 flex items-center gap-2">
                <span className="w-8 h-px bg-primary"></span>
                Our Expertise
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-6 tracking-tight">Deep SAP Capabilities</h2>
              <p className="text-lg text-text-secondary leading-relaxed">
                From legacy systems to S/4HANA, our certified consultants bring deep module-specific expertise to your enterprise.
              </p>
            </div>
            <Link to="/sap-capabilities" className="btn-secondary px-6 py-3 whitespace-nowrap">
              View All Capabilities
            </Link>
          </div>
        </Reveal>

        <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {capabilities.map((cap, idx) => (
            <StaggerItem key={idx} className="h-full">
              <Link to="/sap-capabilities" className="block group relative bg-surface border border-border px-6 py-6 md:py-8 rounded-2xl shadow-surface hover:shadow-surface-hover transition-all duration-500 overflow-hidden h-full group-hover:-translate-y-1">
                {/* Background Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#102A43] to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"></div>

                {/* Content */}
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                    <div className="text-xs text-primary font-bold mb-2 uppercase tracking-widest group-hover:text-primary-light/80 transition-colors duration-300">{cap.type}</div>
                    <div className="font-bold text-xl md:text-2xl text-text-primary tracking-tight group-hover:text-white transition-colors duration-300">{cap.name}</div>
                  </div>
                  
                  {/* Hover Description */}
                  <div className="mt-4 text-primary-light/90 text-sm md:text-base opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-75 leading-relaxed line-clamp-2">
                    {cap.desc}
                  </div>
                </div>
              </Link>
            </StaggerItem>
          ))}
          <StaggerItem className="h-full">
            <Link to="/sap-capabilities" className="group relative px-6 py-6 md:py-8 rounded-2xl border-2 border-dashed border-primary/30 text-primary hover:border-primary hover:bg-primary/5 transition-all duration-500 flex flex-col items-center justify-center font-bold h-full gap-3 text-center hover:-translate-y-1">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                <span className="text-2xl">+</span>
              </div>
              <span>Explore All<br/>Capabilities</span>
            </Link>
          </StaggerItem>
        </StaggerContainer>
      </div>
    </section>
  );
};

export default SAPCapabilitiesPreview;
