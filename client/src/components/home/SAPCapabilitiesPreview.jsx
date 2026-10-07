import { Link } from 'react-router-dom';
import Reveal from '../animations/Reveal';
import { StaggerContainer, StaggerItem } from '../animations/Stagger';

const SAPCapabilitiesPreview = () => {
  const capabilities = [
    { name: 'SAP S/4HANA', type: 'Environment' },
    { name: 'SAP FICO', type: 'Functional' },
    { name: 'SAP MM', type: 'Functional' },
    { name: 'SAP SD', type: 'Functional' },
    { name: 'SAP ABAP', type: 'Technical' },
    { name: 'SAP Fiori', type: 'Technical' },
    { name: 'SAP Basis', type: 'Technical' },
    { name: 'SAP SuccessFactors', type: 'Cloud' },
  ];

  return (
    <section className="py-32 bg-bg-primary border-t border-border/50 px-6 relative">
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

        <StaggerContainer className="flex flex-wrap gap-4">
          {capabilities.map((cap, idx) => (
            <StaggerItem key={idx} className="glass-panel px-6 py-4 flex-grow md:flex-grow-0 min-w-[200px] hover:border-primary/50 transition-colors cursor-default">
              <div className="text-[10px] text-text-muted font-bold mb-1 uppercase tracking-widest">{cap.type}</div>
              <div className="font-semibold text-white tracking-tight">{cap.name}</div>
            </StaggerItem>
          ))}
          <StaggerItem className="px-6 py-4 rounded-xl border-2 border-dashed border-border text-text-muted hover:border-primary/50 hover:text-primary transition-colors flex items-center justify-center font-medium min-w-[200px]">
            <Link to="/sap-capabilities" className="w-full h-full flex items-center justify-center">
              + Explore More
            </Link>
          </StaggerItem>
        </StaggerContainer>
      </div>
    </section>
  );
};

export default SAPCapabilitiesPreview;
