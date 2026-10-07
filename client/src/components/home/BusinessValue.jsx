import { Link } from 'react-router-dom';
import Reveal from '../animations/Reveal';
import { StaggerContainer, StaggerItem } from '../animations/Stagger';

const BusinessValue = () => {
  const values = [
    {
      title: 'Connected Enterprise',
      desc: 'Break down silos and unify your business processes.',
      image: '/images/connected-enterprise.png',
      link: '/services/erp-solutions',
    },
    {
      title: 'Operational Visibility',
      desc: 'Real-time insights across your entire organization.',
      image: '/images/operational-visibility.png',
      link: '/services/sap-support',
    },
    {
      title: 'Scalable Growth',
      desc: 'Future-proof systems that grow with your business.',
      image: '/images/scalable-growth.png',
      link: '/services/staffing',
    },
    {
      title: 'Measurable Outcomes',
      desc: 'Data-driven results that impact your bottom line.',
      image: '/images/measurable-outcomes.png',
      link: '/contact',
    },
  ];

  return (
    <section className="py-32 bg-bg-primary px-6 border-y border-border/50">
      <div className="max-w-7xl mx-auto">
        <Reveal>
          <div className="text-center mb-20">
            <div className="text-primary font-bold uppercase tracking-wider text-xs mb-3 flex items-center justify-center gap-2">
              <span className="w-8 h-px bg-primary"></span>
              The DYC Advantage
              <span className="w-8 h-px bg-primary"></span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">Why Businesses Choose Us</h2>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
              We deliver technology solutions that drive actual business value, not just IT implementations.
            </p>
          </div>
        </Reveal>

        <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((val, idx) => (
            <StaggerItem key={idx}>
              <Link to={val.link} className="block group h-full">
                <div className="relative rounded-2xl overflow-hidden h-[420px] flex flex-col justify-end p-8 border border-border/50 hover:border-primary/50 transition-all duration-500 shadow-surface group-hover:-translate-y-2 group-hover:shadow-glow-strong">
                  {/* Background Image */}
                  <img 
                    src={val.image} 
                    alt={val.title} 
                    className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/90 to-transparent"></div>
                  <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-overlay"></div>

                  {/* Content */}
                  <div className="relative z-10 mt-auto">
                    <h3 className="text-2xl font-bold text-white mb-3 tracking-tight group-hover:text-primary-bright transition-colors">
                      {val.title}
                    </h3>
                    <p className="text-text-secondary leading-relaxed mb-6">
                      {val.desc}
                    </p>
                    <div className="text-primary font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
                      Explore <span aria-hidden="true">→</span>
                    </div>
                  </div>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
};

export default BusinessValue;
