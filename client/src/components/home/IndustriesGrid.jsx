import Reveal from '../animations/Reveal';
import { StaggerContainer, StaggerItem } from '../animations/Stagger';

const IndustriesGrid = () => {
  const industries = [
    { name: 'Manufacturing', icon: '🏭', desc: 'Optimize supply chains and production planning.' },
    { name: 'Retail & FMCG', icon: '🛒', desc: 'Streamline inventory and enhance customer experiences.' },
    { name: 'Healthcare', icon: '🏥', desc: 'Secure data management and compliance tracking.' },
    { name: 'Automotive', icon: '🚗', desc: 'Just-in-time manufacturing and dealer management.' },
    { name: 'Logistics', icon: '🚢', desc: 'Real-time fleet tracking and warehouse management.' },
    { name: 'Finance', icon: '🏦', desc: 'Strict regulatory compliance and risk management.' },
  ];

  return (
    <section className="py-32 bg-bg-secondary px-6 relative border-t border-border/50">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,var(--color-primary-dark),transparent_50%)] opacity-10"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <Reveal>
          <div className="text-center mb-20">
            <div className="text-primary font-bold uppercase tracking-wider text-xs mb-3 inline-flex items-center gap-2">
              <span className="w-8 h-px bg-primary"></span>
              Sectors
              <span className="w-8 h-px bg-primary"></span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">Industries We Serve</h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
              Tailored enterprise solutions designed for the unique regulatory and operational challenges of your sector.
            </p>
          </div>
        </Reveal>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {industries.map((ind, idx) => (
            <StaggerItem key={idx} className="glass-panel p-8 group flex flex-col items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-bg-secondary border border-border/50 flex items-center justify-center text-2xl group-hover:scale-110 group-hover:border-primary/50 transition-all duration-300 shadow-sm">
                {ind.icon}
              </div>
              <div>
                <h3 className="font-bold text-xl text-white mb-2 group-hover:text-primary-bright transition-colors tracking-tight">{ind.name}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{ind.desc}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
};

export default IndustriesGrid;
