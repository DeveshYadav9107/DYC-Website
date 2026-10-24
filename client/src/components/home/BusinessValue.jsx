import Reveal from '../animations/Reveal';
import { StaggerContainer, StaggerItem } from '../animations/Stagger';

const BusinessValue = () => {
  const values = [
    {
      title: 'Connected Enterprise',
      desc: 'Break down silos and unify your business processes.',
      image: '/images/connected-enterprise.png',
      hoverItems: [
        { title: 'SAP S/4HANA', sub: 'Next-gen ERP suite' },
        { title: 'System Integration', sub: 'Seamless data flow' },
        { title: 'Cloud Migration', sub: 'Secure & scalable' }
      ]
    },
    {
      title: 'Operational Visibility',
      desc: 'Real-time insights across your entire organization.',
      image: '/images/operational-visibility.png',
      hoverItems: [
        { title: 'Advanced Analytics', sub: 'Real-time dashboards' },
        { title: 'Supply Chain', sub: 'End-to-end tracking' },
        { title: 'Financial Reporting', sub: 'Compliance & accuracy' }
      ]
    },
    {
      title: 'Scalable Growth',
      desc: 'Future-proof systems that grow with your business.',
      image: '/images/scalable-growth.png',
      hoverItems: [
        { title: 'Strategic Staffing', sub: 'Expert consultants' },
        { title: 'Capacity Planning', sub: 'Future-proof architecture' },
        { title: 'Global Rollouts', sub: 'Multi-region deployment' }
      ]
    },
    {
      title: 'Measurable Outcomes',
      desc: 'Data-driven results that impact your bottom line.',
      image: '/images/measurable-outcomes.png',
      hoverItems: [
        { title: 'Process Optimization', sub: 'Reduce operational costs' },
        { title: 'ROI Tracking', sub: 'Clear performance metrics' },
        { title: 'Quality Assurance', sub: 'Zero-defect delivery' }
      ]
    },
  ];

  return (
    <section className="py-24 sm:py-32 bg-[#FDFBF7] px-4 sm:px-6 lg:px-8 border-b border-[#E7E0D3]">
      <div className="max-w-7xl mx-auto">
        <Reveal>
          <div className="text-center mb-16 sm:mb-20">
            <div className="text-[#B88A3B] font-bold uppercase tracking-widest text-xs mb-3.5 flex items-center justify-center gap-2.5">
              <span className="w-8 h-px bg-[#B88A3B]"></span>
              The DYC Advantage
              <span className="w-8 h-px bg-[#B88A3B]"></span>
            </div>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-[#252720] mb-5 tracking-tight">
              Why Businesses Choose Us
            </h2>
            <p className="text-lg md:text-xl text-[#66665D] max-w-2xl mx-auto leading-relaxed">
              We deliver technology solutions that drive actual business value, not just IT implementations.
            </p>
          </div>
        </Reveal>

        <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((val, idx) => (
            <StaggerItem key={idx}>
              <div className="block group h-full relative cursor-default">
                <div className="relative rounded-2xl overflow-hidden h-[420px] flex flex-col justify-end p-7 sm:p-8 border border-[#E7E0D3] shadow-[0_4px_20px_rgba(37,39,32,0.04)] group-hover:border-[#174B39]/50 transition-all duration-500 bg-white">
                  {/* Background Image */}
                  <img 
                    src={val.image} 
                    alt={val.title} 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700"
                  />
                  
                  {/* Warm Gradient Overlay Base */}
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-white/70 to-transparent group-hover:opacity-0 transition-opacity duration-300 z-0"></div>

                  {/* Content Base State */}
                  <div className="relative z-10 mt-auto group-hover:opacity-0 transition-opacity duration-300">
                    <h3 className="text-2xl font-serif font-bold text-[#252720] mb-2.5 tracking-tight">
                      {val.title}
                    </h3>
                    <p className="text-[#66665D] text-sm sm:text-base leading-relaxed">
                      {val.desc}
                    </p>
                  </div>

                  {/* Hover Overlay State: Deep Forest Green with Gold accents */}
                  <div className="absolute inset-0 bg-[#103728]/95 text-white p-7 sm:p-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col z-20 backdrop-blur-xs">
                    <h4 className="text-xl font-serif font-bold mb-6 tracking-tight text-white border-b border-[#B88A3B]/40 pb-3">{val.title}</h4>
                    <div className="flex flex-col h-full justify-center">
                      {val.hoverItems.map((item, i) => (
                        <div key={i} className="border-b border-white/10 py-3.5 last:border-0 cursor-default">
                          <div className="font-semibold text-white text-sm mb-1">{item.title}</div>
                          <div className="text-xs text-[#D7B875]">{item.sub}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
};

export default BusinessValue;
