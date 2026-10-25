import { Link } from 'react-router-dom';
import { 
  FiLayers, 
  FiTrendingUp, 
  FiPackage, 
  FiShoppingCart, 
  FiCode, 
  FiLayout, 
  FiServer, 
  FiUsers, 
  FiArrowRight 
} from 'react-icons/fi';
import Reveal from '../animations/Reveal';
import { StaggerContainer, StaggerItem } from '../animations/Stagger';

const SAPCapabilitiesPreview = () => {
  const capabilities = [
    {
      name: 'SAP S/4HANA',
      type: 'ENVIRONMENT',
      desc: 'A modern ERP foundation for connecting core business processes, data and enterprise operations.',
      icon: FiLayers
    },
    {
      name: 'SAP FICO',
      type: 'FUNCTIONAL',
      desc: 'Finance and controlling capabilities supporting accounting processes, financial visibility and reporting.',
      icon: FiTrendingUp
    },
    {
      name: 'SAP MM',
      type: 'FUNCTIONAL',
      desc: 'Procurement, purchasing and inventory workflows that support materials management.',
      icon: FiPackage
    },
    {
      name: 'SAP SD',
      type: 'FUNCTIONAL',
      desc: 'Sales and distribution processes covering orders, deliveries and billing workflows.',
      icon: FiShoppingCart
    },
    {
      name: 'SAP ABAP',
      type: 'TECHNICAL',
      desc: 'Custom SAP development, extensions and backend logic tailored to defined business requirements.',
      icon: FiCode
    },
    {
      name: 'SAP Fiori',
      type: 'TECHNICAL',
      desc: 'Modern, role-based SAP application experiences designed to make key workflows easier to use.',
      icon: FiLayout
    },
    {
      name: 'SAP Basis',
      type: 'TECHNICAL',
      desc: 'SAP technical administration, system operations and landscape support, according to project needs.',
      icon: FiServer
    },
    {
      name: 'SAP SuccessFactors',
      type: 'CLOUD',
      desc: 'Cloud-based human resources and talent-management capabilities for relevant people processes.',
      icon: FiUsers
    }
  ];

  return (
    <section className="py-24 sm:py-32 bg-[#FDFBF7] border-b border-[#E7E0D3] px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -right-[12%] w-[550px] h-[550px] rounded-full bg-[radial-gradient(circle,rgba(23,75,57,0.035),transparent_70%)] blur-[100px]" />
        <div className="absolute bottom-1/4 -left-[12%] w-[550px] h-[550px] rounded-full bg-[radial-gradient(circle,rgba(184,138,59,0.035),transparent_70%)] blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* ================= SECTION HEADER ================= */}
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 sm:mb-16 gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAF0E8] border border-[#174B39]/20 text-[#174B39] text-xs font-bold tracking-[0.2em] uppercase mb-4 self-start shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-[#B88A3B]" />
                <span>OUR EXPERTISE</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-serif font-bold text-[#252720] mb-4 tracking-tight leading-[1.18]">
                SAP expertise, built around your business.
              </h2>
              <p className="text-base sm:text-lg text-[#66665D] leading-relaxed font-sans">
                From core ERP environments to functional modules, technical development and cloud-based business applications, explore the SAP capabilities relevant to your requirements.
              </p>
            </div>
            
            <Link 
              to="/sap-capabilities" 
              className="btn-secondary px-6 py-3.5 whitespace-nowrap text-sm sm:text-base font-semibold group flex items-center justify-center gap-2.5 self-start md:self-end"
            >
              <span>View All Capabilities</span>
              <span aria-hidden="true" className="group-hover:translate-x-1 transition-transform text-[#B88A3B] font-bold">→</span>
            </Link>
          </div>
        </Reveal>

        {/* ================= 8-CARD CAPABILITIES GRID (2 ROWS OF 4) ================= */}
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {capabilities.map((cap, idx) => {
            const Icon = cap.icon;

            return (
              <StaggerItem key={idx} className="h-full">
                <Link 
                  to="/sap-capabilities" 
                  className="group relative bg-white border border-[#E7E0D3] p-6 sm:p-7 rounded-2xl shadow-[0_4px_20px_rgba(37,39,32,0.03)] hover:shadow-[0_14px_36px_rgba(23,75,57,0.09)] hover:border-[#174B39]/40 transition-all duration-300 flex flex-col justify-between h-full group-hover:-translate-y-1"
                >
                  <div>
                    {/* Top Row: Icon Container & Category Tag */}
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-11 h-11 rounded-xl bg-[#EAF0E8] text-[#174B39] flex items-center justify-center group-hover:bg-[#174B39] group-hover:text-white transition-colors duration-300 shadow-2xs">
                        <Icon className="text-xl" />
                      </div>
                      <span className="text-[11px] font-bold text-[#B88A3B] uppercase tracking-[0.16em] px-2.5 py-1 rounded-full bg-[#B88A3B]/10">
                        {cap.type}
                      </span>
                    </div>

                    {/* Module Title */}
                    <h3 className="font-serif font-bold text-xl sm:text-[22px] text-[#252720] group-hover:text-[#174B39] transition-colors duration-300 mb-2.5 tracking-tight">
                      {cap.name}
                    </h3>

                    {/* Informative Description (Visible by default) */}
                    <p className="text-[#66665D] text-sm leading-relaxed font-sans mb-6">
                      {cap.desc}
                    </p>
                  </div>

                  {/* Understated Action Affordance */}
                  <div className="pt-4 border-t border-[#E7E0D3]/60 flex items-center justify-between text-xs font-semibold text-[#174B39] group-hover:text-[#B88A3B] transition-colors mt-auto">
                    <span className="tracking-wide">Explore Capability</span>
                    <FiArrowRight className="text-sm transform group-hover:translate-x-1.5 transition-transform duration-300" />
                  </div>
                </Link>
              </StaggerItem>
            );
          })}
        </StaggerContainer>

        {/* ================= COMPACT FULL-WIDTH CTA STRIP ================= */}
        <Reveal>
          <div className="mt-12 sm:mt-16 bg-white rounded-2xl border border-[#E7E0D3] p-6 sm:p-8 md:p-10 shadow-[0_4px_24px_rgba(37,39,32,0.04)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#B88A3B] mb-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B88A3B]" />
                <span>Custom Enterprise Requirements</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#252720] tracking-tight mb-2">
                Looking for a specific SAP skill or module?
              </h3>
              <p className="text-sm sm:text-base text-[#66665D] leading-relaxed font-sans">
                Tell us what your business needs, and start a conversation with DYC about the relevant expertise.
              </p>
            </div>
            
            <Link
              to="/contact"
              className="btn-primary px-7 py-3.5 whitespace-nowrap text-sm sm:text-base font-semibold shrink-0 shadow-[0_4px_16px_rgba(23,75,57,0.2)] hover:shadow-[0_8px_24px_rgba(23,75,57,0.3)]"
            >
              Discuss Your Requirements
            </Link>
          </div>
        </Reveal>

      </div>
    </section>
  );
};

export default SAPCapabilitiesPreview;
