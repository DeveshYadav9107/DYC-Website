import Reveal from '../animations/Reveal';
import { StaggerContainer, StaggerItem } from '../animations/Stagger';

const IndustriesGrid = () => {
  const industries = [
    { name: 'Manufacturing', image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80', desc: 'Optimize supply chains and production planning.' },
    { name: 'Retail & FMCG', image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=800&q=80', desc: 'Streamline inventory and enhance customer experiences.' },
    { name: 'Healthcare', image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80', desc: 'Secure data management and compliance tracking.' },
    { name: 'Automotive', image: 'https://images.unsplash.com/photo-1518987048-93e29699e79a?auto=format&fit=crop&w=800&q=80', desc: 'Just-in-time manufacturing and dealer management.' },
    { name: 'Logistics', image: 'https://images.unsplash.com/photo-1586528116311-ad8ed7c663be?auto=format&fit=crop&w=800&q=80', desc: 'Real-time fleet tracking and warehouse management.' },
    { name: 'Finance', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80', desc: 'Strict regulatory compliance and risk management.' },
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
            <StaggerItem key={idx} className="relative rounded-2xl overflow-hidden h-[300px] flex flex-col justify-end p-8 border border-border/50 hover:border-primary/50 transition-all duration-500 shadow-surface group hover:-translate-y-2 hover:shadow-glow">
              
              {/* Background Image */}
              <img 
                src={ind.image} 
                alt={ind.name} 
                className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000"
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/90 to-transparent"></div>
              <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-overlay"></div>

              {/* Content */}
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-white mb-2 tracking-tight group-hover:text-primary-bright transition-colors">
                  {ind.name}
                </h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  {ind.desc}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
};

export default IndustriesGrid;
