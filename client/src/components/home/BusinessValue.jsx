import { Link } from 'react-router-dom';
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
    <section className="py-32 bg-bg-tertiary px-6 border-y border-border-light">
      <div className="max-w-7xl mx-auto">
        <Reveal>
          <div className="text-center mb-20">
            <div className="text-primary font-bold uppercase tracking-wider text-xs mb-3 flex items-center justify-center gap-2">
              <span className="w-8 h-px bg-primary"></span>
              The DYC Advantage
              <span className="w-8 h-px bg-primary"></span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-text-primary mb-6 tracking-tight">Why Businesses Choose Us</h2>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
              We deliver technology solutions that drive actual business value, not just IT implementations.
            </p>
          </div>
        </Reveal>

        <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((val, idx) => (
            <StaggerItem key={idx}>
              <div className="block group h-full relative cursor-default">
                <div className="relative rounded-2xl overflow-hidden h-[420px] flex flex-col justify-end p-8 border border-border shadow-surface transition-all duration-500">
                  {/* Background Image */}
                  <img 
                    src={val.image} 
                    alt={val.title} 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700"
                  />
                  
                  {/* Gradient Overlay Base */}
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-white/90 to-transparent group-hover:opacity-0 transition-opacity duration-300 z-0"></div>

                  {/* Content Base State */}
                  <div className="relative z-10 mt-auto group-hover:opacity-0 transition-opacity duration-300">
                    <h3 className="text-2xl font-bold text-text-primary mb-3 tracking-tight">
                      {val.title}
                    </h3>
                    <p className="text-text-secondary leading-relaxed">
                      {val.desc}
                    </p>
                  </div>

                  {/* Hover Overlay State */}
                  <div className="absolute inset-0 bg-bg-navy/95 text-white p-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col z-20 backdrop-blur-sm">
                    <h4 className="text-xl font-bold mb-6 tracking-tight text-white">{val.title}</h4>
                    <div className="flex flex-col h-full">
                      {val.hoverItems.map((item, i) => (
                        <div key={i} className="group/item flex items-center justify-between border-b border-white/20 py-4 last:border-0 cursor-pointer">
                          <div>
                            <div className="font-semibold text-white mb-1 group-hover/item:text-primary-light transition-colors">{item.title}</div>
                            <div className="text-sm text-primary-light/70">{item.sub}</div>
                          </div>
                          <span className="text-primary-light/50 group-hover/item:text-primary-light group-hover/item:translate-x-1 transition-all">→</span>
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
