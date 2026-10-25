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
    <div className="bg-[#F8F5EE] min-h-screen text-[#252720]">
      {/* Header Banner */}
      <div className="bg-[#F8F5EE] text-[#252720] py-20 sm:py-28 lg:py-36 px-4 sm:px-6 lg:px-8 relative overflow-hidden border-b border-[#E7E0D3]">
        
        {/* Background Banner Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/sap-banner.png" 
            alt="SAP Capabilities & Ecosystem Architecture" 
            className="w-full h-full object-cover object-right md:object-center contrast-[1.05] saturate-[1.08]" 
          />
          {/* Gentle gradient to guarantee contrast over text on mobile and left edge while preserving visual clarity */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#F8F5EE] via-[#F8F5EE]/80 to-[#F8F5EE]/20 md:via-[#F8F5EE]/25 md:to-transparent md:max-w-2xl z-0 pointer-events-none" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10 pt-4 sm:pt-6">
          <Reveal>
            <div className="grid md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-7 lg:col-span-7">
                <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-sm border border-[#174B39]/20 text-[#174B39] text-xs font-bold tracking-[0.2em] uppercase mb-6 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-[#B88A3B]"></span>
                  <span>Enterprise Systems</span>
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-serif font-bold mb-6 tracking-tight text-[#252720] leading-[1.14]">
                  SAP <span className="text-[#174B39] italic">Capabilities</span> & Ecosystem Architecture
                </h1>
                <p className="text-lg sm:text-xl text-[#66665D] max-w-xl leading-relaxed font-sans mb-8">
                  We provide comprehensive SAP expertise across the entire enterprise landscape. From legacy ECC systems to modern S/4HANA transformations, our certified consultants deliver end-to-end solutions.
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm font-semibold text-[#174B39]">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/85 backdrop-blur-md border border-[#E7E0D3] shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-[#B88A3B]"></span>
                    <span>Functional & Technical Modules</span>
                  </div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/85 backdrop-blur-md border border-[#E7E0D3] shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-[#174B39]"></span>
                    <span>S/4HANA & Cloud Integration</span>
                  </div>
                </div>
              </div>

              {/* Right column kept clear to let the glowing SAP holographic globe and consultant touchpoint shine */}
              <div className="hidden md:flex md:col-span-5 lg:col-span-5 justify-end items-end h-full pointer-events-none" />
            </div>
          </Reveal>
        </div>
      </div>

      {/* Modules List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 space-y-20 sm:space-y-24">
        {categories.map((category, idx) => (
          <div key={idx} className="grid md:grid-cols-12 gap-10 md:gap-14 items-start border-t border-[#E7E0D3] pt-16 first:border-0 first:pt-0">
            <Reveal className="md:col-span-5">
              <div className="sticky top-28">
                <div className="text-[#B88A3B] font-bold uppercase tracking-widest text-xs mb-3 flex items-center gap-2.5">
                  <span className="w-8 h-px bg-[#B88A3B]"></span>
                  Domain 0{idx + 1}
                </div>
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#252720] mb-3 tracking-tight">
                  {category.title}
                </h2>
                <p className="text-lg text-[#174B39] font-medium mb-5">{category.desc}</p>
                <p className="text-[#66665D] leading-relaxed text-sm sm:text-base">
                  {category.paragraph}
                </p>
              </div>
            </Reveal>
            
            <div className="md:col-span-7">
              <StaggerContainer className="grid sm:grid-cols-2 gap-4">
                {category.modules.map((mod, i) => (
                  <StaggerItem key={i} className="bg-white border border-[#E7E0D3] rounded-2xl p-6 hover:border-[#174B39]/50 transition-all duration-300 shadow-[0_4px_16px_rgba(37,39,32,0.03)] group hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(23,75,57,0.08)]">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#B88A3B] mb-1.5 block">Module</span>
                    <h3 className="font-serif font-bold text-xl text-[#252720] mb-1.5 group-hover:text-[#174B39] transition-colors">{mod.name}</h3>
                    <p className="text-[#66665D] text-xs sm:text-sm leading-relaxed">{mod.full}</p>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="bg-[#FDFBF7] border-t border-[#E7E0D3] py-24 sm:py-32 px-4 sm:px-6 lg:px-8 text-center">
        <Reveal>
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-[#252720] mb-5 tracking-tight">
            Need a Specific SAP Expert?
          </h2>
          <p className="text-lg md:text-xl text-[#66665D] max-w-2xl mx-auto mb-10 leading-relaxed font-sans">
            Whether you need a single ABAP developer or a full functional team for an S/4HANA rollout, we can deploy the right talent quickly.
          </p>
          <Link to="/contact" className="btn-primary inline-block px-8 py-4 text-base sm:text-lg font-semibold">
            Request SAP Resources
          </Link>
        </Reveal>
      </div>
    </div>
  );
};

export default SAPCapabilitiesPage;
