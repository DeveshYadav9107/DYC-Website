import { Link } from 'react-router-dom';
import Reveal from '../animations/Reveal';
import { StaggerContainer, StaggerItem } from '../animations/Stagger';

const SAPCapabilitiesPreview = () => {
  const capabilities = [
    { name: 'SAP S/4HANA', type: 'Environment', desc: 'Next-gen enterprise resource planning & cloud suite.' },
    { name: 'SAP FICO', type: 'Functional', desc: 'Financial accounting, controlling & regulatory reporting.' },
    { name: 'SAP MM', type: 'Functional', desc: 'Streamline materials management & procurement.' },
    { name: 'SAP SD', type: 'Functional', desc: 'Optimize sales, pricing, and distribution workflows.' },
    { name: 'SAP ABAP', type: 'Technical', desc: 'Custom enterprise development & integrations.' },
    { name: 'SAP Fiori', type: 'Technical', desc: 'Intuitive modern user experiences & mobile apps.' },
    { name: 'SAP Basis', type: 'Technical', desc: 'Reliable system administration, security & patching.' },
    { name: 'SAP SuccessFactors', type: 'Cloud', desc: 'Modern human capital management solutions.' },
  ];

  return (
    <section className="py-24 sm:py-32 bg-[#EAF0E8]/40 border-b border-[#E7E0D3] px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto relative z-10">
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="max-w-2xl">
              <div className="text-[#B88A3B] font-bold uppercase tracking-widest text-xs mb-3 flex items-center gap-2.5">
                <span className="w-8 h-px bg-[#B88A3B]"></span>
                Our Expertise
              </div>
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-[#252720] mb-4 tracking-tight">
                Deep SAP Capabilities
              </h2>
              <p className="text-lg md:text-xl text-[#66665D] leading-relaxed">
                From legacy ECC systems to modern S/4HANA transformations, our certified consultants bring deep module-specific expertise to your enterprise.
              </p>
            </div>
            <Link to="/sap-capabilities" className="btn-secondary px-6 py-3 whitespace-nowrap text-sm sm:text-base font-semibold">
              View All Capabilities
            </Link>
          </div>
        </Reveal>

        <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {capabilities.map((cap, idx) => (
            <StaggerItem key={idx} className="h-full">
              <Link 
                to="/sap-capabilities" 
                className="block group relative bg-white border border-[#E7E0D3] px-6 py-6 sm:py-8 rounded-2xl shadow-[0_4px_16px_rgba(37,39,32,0.04)] hover:shadow-[0_12px_32px_rgba(23,75,57,0.12)] transition-all duration-500 overflow-hidden h-full group-hover:-translate-y-1"
              >
                {/* Background Hover Effect: Deep Forest Green */}
                <div className="absolute inset-0 bg-[#103728] opacity-0 group-hover:opacity-100 transition-opacity duration-400 z-0"></div>

                {/* Content */}
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                    <div className="text-[11px] text-[#B88A3B] font-bold mb-2 uppercase tracking-widest group-hover:text-[#D7B875] transition-colors duration-300">
                      {cap.type}
                    </div>
                    <div className="font-serif font-bold text-xl md:text-2xl text-[#252720] tracking-tight group-hover:text-white transition-colors duration-300">
                      {cap.name}
                    </div>
                  </div>
                  
                  {/* Hover Description */}
                  <div className="mt-4 text-white/90 text-xs sm:text-sm opacity-0 group-hover:opacity-100 transform translate-y-3 group-hover:translate-y-0 transition-all duration-400 leading-relaxed line-clamp-2">
                    {cap.desc}
                  </div>
                </div>
              </Link>
            </StaggerItem>
          ))}
          <StaggerItem className="h-full">
            <Link 
              to="/sap-capabilities" 
              className="group relative px-6 py-6 sm:py-8 rounded-2xl border-2 border-dashed border-[#174B39]/30 bg-white/60 text-[#174B39] hover:border-[#174B39] hover:bg-[#174B39] hover:text-white transition-all duration-400 flex flex-col items-center justify-center font-bold h-full gap-3 text-center hover:-translate-y-1 shadow-2xs"
            >
              <div className="w-12 h-12 rounded-full bg-[#EAF0E8] text-[#174B39] group-hover:bg-white/20 group-hover:text-white flex items-center justify-center group-hover:scale-110 transition-all duration-400">
                <span className="text-2xl">+</span>
              </div>
              <span className="font-serif text-base sm:text-lg">Explore All<br/>Capabilities</span>
            </Link>
          </StaggerItem>
        </StaggerContainer>
      </div>
    </section>
  );
};

export default SAPCapabilitiesPreview;
